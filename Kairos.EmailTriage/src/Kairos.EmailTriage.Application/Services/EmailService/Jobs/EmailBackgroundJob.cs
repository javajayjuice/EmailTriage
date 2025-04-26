using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Kairos.EmailTriage.Domain;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MimeKit;
using System;
using System.Threading;
using System.Threading.Tasks;


namespace Kairos.EmailTriage.Services.EmailService.Jobs
{
    public class EmailBackgroundJob : BackgroundService, ISingletonDependency
    {
        private readonly ILogger<EmailBackgroundJob> _logger;
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Ticket, Guid> _ticketRepository;
        private uint _lastSeenUID = 0;
        private readonly object _monitoringLock = new object();
        private bool _isRunning = false;

        public EmailBackgroundJob(
            IConfiguration configuration,
            ILogger<EmailBackgroundJob> logger,
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<Ticket, Guid> ticketRepository)
        {
            _configuration = configuration;
            _logger = logger;
            _unitOfWorkManager = unitOfWorkManager;
            _ticketRepository = ticketRepository;
        }

        /// <summary>
        /// Main execution method for the background service
        /// </summary>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Email monitoring service is starting");

            try
            {
                lock (_monitoringLock)
                {
                    _isRunning = true;
                }

                await RunMonitoringLoopAsync(stoppingToken);
            }
            finally
            {
                lock (_monitoringLock)
                {
                    _isRunning = false;
                }
                _logger.LogInformation("Email monitoring service has stopped");
            }
        }

        /// <summary>
        /// The main monitoring loop with retry and error handling
        /// </summary>
        private async Task RunMonitoringLoopAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Starting email monitoring session");
                    await MonitorEmailsAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    // Normal shutdown
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in email monitoring service. Will restart in 60 seconds");

                    try
                    {
                        // Wait before retrying
                        await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        // Exit if cancelled during delay
                        break;
                    }
                }
            }
        }

        /// <summary>
        /// Monitors an email folder for new messages
        /// </summary>
        private async Task MonitorEmailsAsync(CancellationToken cancellationToken)
        {
            var imapServer = _configuration["GMailSettings:IMapServer"];
            var imapPortStr = _configuration["GMailSettings:IMapPort"];
            var emailAddress = _configuration["GMailSettings:EMail"];
            var password = _configuration["GMailSettings:AppPassword"];

            if (string.IsNullOrEmpty(imapServer) || string.IsNullOrEmpty(imapPortStr) ||
                string.IsNullOrEmpty(emailAddress) || string.IsNullOrEmpty(password))
            {
                throw new InvalidOperationException("Email settings are not properly configured");
            }

            var imapPort = int.Parse(imapPortStr);

            using var client = new ImapClient();

            _logger.LogInformation("Connecting to IMAP server at {0}:{1}", imapServer, imapPort);
            await client.ConnectAsync(imapServer, imapPort, SecureSocketOptions.SslOnConnect, cancellationToken);

            _logger.LogInformation("Authenticating with email server as {0}", emailAddress);
            await client.AuthenticateAsync(emailAddress, password, cancellationToken);

            _logger.LogInformation("Successfully authenticated with email server");

            // Get or create the NewIncomingMail folder
            var newIncomingMailFolder = await EnsureFolderExistsAsync(client, "NewIncomingMail", cancellationToken);

            // Open the folder with read/write access
            await newIncomingMailFolder.OpenAsync(FolderAccess.ReadWrite, cancellationToken);
            _logger.LogInformation("Opened 'NewIncomingMail' folder with {0} messages", newIncomingMailFolder.Count);

            // If this is our first time, get the last message UID
            if (_lastSeenUID == 0 && newIncomingMailFolder.Count > 0)
            {
                var uids = await newIncomingMailFolder.SearchAsync(SearchQuery.All, cancellationToken);
                if (uids.Count > 0)
                    _lastSeenUID = uids[uids.Count - 1].Id;
            }

            _logger.LogInformation("Monitoring 'NewIncomingMail' folder from UID: {0}", _lastSeenUID);

            // First check for new emails that arrived while we weren't connected
            await FetchNewEmails(client, newIncomingMailFolder, cancellationToken);

            // Then enter IDLE mode to wait for new emails
            while (client.IsConnected && !cancellationToken.IsCancellationRequested)
            {
                // IDLE typically times out after ~10 minutes on most servers
                using var idleTimeoutCts = new CancellationTokenSource(TimeSpan.FromMinutes(9));
                using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
                    idleTimeoutCts.Token, cancellationToken);

                try
                {
                    // Set up event handlers for new mail notifications
                    var idleDone = new CancellationTokenSource();

                    EventHandler<EventArgs> handler = (s, e) => {
                        _logger.LogInformation("New mail notification received");
                        idleDone.Cancel();
                    };

                    newIncomingMailFolder.CountChanged += handler;

                    try
                    {
                        using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(
                            linkedCts.Token, idleDone.Token);

                        _logger.LogDebug("Entering IDLE state");
                        await client.IdleAsync(combinedCts.Token);
                    }
                    finally
                    {
                        // Always remove event handlers
                        newIncomingMailFolder.CountChanged -= handler;
                    }

                    // Check for new emails that arrived
                    await FetchNewEmails(client, newIncomingMailFolder, cancellationToken);
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    break; // Exit the loop if cancellation was requested
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during IDLE operation. Will reconnect.");
                    break; // Break to reconnect
                }
            }

            _logger.LogInformation("Disconnecting from mail server");
            await client.DisconnectAsync(true, cancellationToken);
        }

        /// <summary>
        /// Fetches new emails and processes them
        /// </summary>
        private async Task FetchNewEmails(ImapClient client, IMailFolder folder, CancellationToken cancellationToken)
        {
            var query = SearchQuery.Uids(new UniqueIdRange(new UniqueId(_lastSeenUID + 1), UniqueId.MaxValue));
            var newUids = await folder.SearchAsync(query, cancellationToken);

            _logger.LogInformation("Found {0} new emails to process", newUids.Count);

            foreach (var uid in newUids)
            {
                try
                {
                    var message = await folder.GetMessageAsync(uid, cancellationToken);
                    await ProcessNewEmailAsync(client, folder, uid, message, cancellationToken);

                    if (uid.Id > _lastSeenUID)
                        _lastSeenUID = uid.Id;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing email with UID {0}", uid.Id);
                }
            }
        }

        /// <summary>
        /// Processes a new email by moving it to the ReadMail folder
        /// </summary>
        private async Task ProcessNewEmailAsync(ImapClient client, IMailFolder sourceFolder, UniqueId uid, MimeMessage message, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Processing new email: '{0}' from {1}",
                message.Subject,
                message.From);

            try
            {
                var targetFolder = await EnsureFolderExistsAsync(client, "ReadMail", cancellationToken);
                await sourceFolder.MoveToAsync(uid, targetFolder, cancellationToken);
                _logger.LogInformation("Moved email '{0}' to 'ReadMail' folder", message.Subject);

                // TODO: Add your email processing logic here
                // For example, you might want to:
                // 1. Extract important information from the email
                // 2. Create tickets in your system
                // 3. Send notifications
                // 4. Forward to appropriate departments

                // Create Ticket in the database

                using (var uow = _unitOfWorkManager.Begin())
                {
                    try
                    {
                        var ticket = new Ticket
                        {
                            Subject = message.Subject,
                            Body = message.TextBody ?? message.HtmlBody ?? string.Empty
                        };

                        await _ticketRepository.InsertOrUpdateAsync(ticket);

                        await uow.CompleteAsync();
                    }
                    catch (Exception ex)
                    {
                        await uow.CompleteAsync();
                        throw;
                    }
                    
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moving email '{0}' to ReadMail folder", message.Subject);
                throw;
            }
        }

        /// <summary>
        /// Ensures a folder exists, creating it if necessary
        /// </summary>
        private async Task<IMailFolder> EnsureFolderExistsAsync(ImapClient client, string folderName, CancellationToken cancellationToken)
        {
            var personal = client.GetFolder(client.PersonalNamespaces[0]);
            IMailFolder folder = null;

            try
            {
                folder = await personal.GetSubfolderAsync(folderName, cancellationToken);
            }
            catch (FolderNotFoundException)
            {
                folder = await personal.CreateAsync(folderName, true, cancellationToken);
                _logger.LogInformation("Created folder '{0}'", folderName);
            }

            return folder;
        }

        /// <summary>
        /// Returns the status of the monitoring service
        /// </summary>
        public bool IsRunning()
        {
            lock (_monitoringLock)
            {
                return _isRunning;
            }
        }
    }
}
