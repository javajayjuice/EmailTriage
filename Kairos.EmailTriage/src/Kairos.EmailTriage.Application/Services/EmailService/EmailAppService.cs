using Abp.Application.Services;
using Abp.Dependency;
using Microsoft.Extensions.Logging;
using MailKit.Net.Imap;
using MailKit.Search;
using MailKit.Security;
using MimeKit;
using System;
using System.Threading;
using System.Threading.Tasks;
using MailKit;
using System.Net.Sockets;
using Microsoft.Extensions.Configuration;

namespace Kairos.EmailTriage.Services.EmailService
{
    public class EmailAppService : ApplicationService, ITransientDependency
    {
        private readonly ILogger<EmailAppService> _logger;
        private readonly IConfiguration _configuration;
        private static uint _lastSeenUID = 0;
        private static Task _monitoringTask = null;
        private static CancellationTokenSource _cancellationTokenSource = null;

        public EmailAppService(ILogger<EmailAppService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public Task MonitorEmailsAsync(CancellationToken cancellationToken)
        {
            try
            {
                // If monitoring is already running, return success
                if (_monitoringTask != null && !_monitoringTask.IsCompleted)
                {
                    return Task.CompletedTask;
                }

                // If we had a previous cancellation token source, dispose it
                if (_cancellationTokenSource != null)
                {
                    _cancellationTokenSource.Dispose();
                }

                // Create a new cancellation token source that will persist beyond this request
                _cancellationTokenSource = new CancellationTokenSource();

                // Start the monitoring in a background task
                _monitoringTask = Task.Run(() => MonitorEmailsInternalAsync(_cancellationTokenSource.Token));

                // Return successfully immediately
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in email monitoring");
                throw new Exception("An unexpected error occurred while monitoring emails.", ex);
            }

        }

        public Task StopMonitoringAsync()
        {
            if (_cancellationTokenSource != null)
            {
                _cancellationTokenSource.Cancel();
                _logger.LogInformation("Email monitoring stop requested");
            }

            return Task.CompletedTask;
        }

        private async Task MonitorEmailsInternalAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    using var client = new ImapClient();
                    await client.ConnectAsync(_configuration.GetSection("GMailSettings")["IMapServer"],
                        int.Parse(_configuration.GetSection("GMailSettings")["IMapPort"]), SecureSocketOptions.SslOnConnect, cancellationToken);

                    _logger.LogInformation("Connecting to IMAP server at {0}:{1}",
                        _configuration.GetSection("GMailSettings")["IMapServer"],
                        int.Parse(_configuration.GetSection("GMailSettings")["IMapPort"]));

                    // Authenticate with the email server
                    await client.AuthenticateAsync(_configuration.GetSection("GMailSettings")["EMail"],
                        _configuration.GetSection("GMailSettings")["AppPassword"], cancellationToken);

                    _logger.LogInformation("Successfully authenticated with email server");

                    // Get the NewIncomingMail folder instead of the inbox
                    var personal = client.GetFolder(client.PersonalNamespaces[0]);
                    var newIncomingMailFolder = await EnsureFolderExistsAsync(client, "NewIncomingMail", cancellationToken);

                    // Open the NewIncomingMail folder
                    await newIncomingMailFolder.OpenAsync(FolderAccess.ReadWrite, cancellationToken);
                    _logger.LogInformation("Opened 'NewIncomingMail' folder with {0} messages", newIncomingMailFolder.Count);

                    if (_lastSeenUID == 0 && newIncomingMailFolder.Count > 0)
                    {
                        var uids = await newIncomingMailFolder.SearchAsync(SearchQuery.All, cancellationToken);
                        if (uids.Count > 0)
                            _lastSeenUID = uids[uids.Count - 1].Id;
                    }

                    _logger.LogInformation("Monitoring 'NewIncomingMail' folder from UID: {0}", _lastSeenUID);

                    // Check for new emails that arrived while we weren't connected
                    await FetchNewEmails(client, newIncomingMailFolder, cancellationToken);

                    // Enter IDLE mode
                    while (client.IsConnected && !cancellationToken.IsCancellationRequested)
                    {
                        try
                        {
                            using var idleTimeoutCts = new CancellationTokenSource(TimeSpan.FromMinutes(9));
                            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(idleTimeoutCts.Token, cancellationToken);

                            // Set up event handlers for new mail notifications
                            var idleDone = new CancellationTokenSource();
                            newIncomingMailFolder.CountChanged += (s, e) =>
                            {
                                _logger.LogInformation("New mail notification received");
                                idleDone.Cancel();
                            };

                            try
                            {
                                using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(linkedCts.Token, idleDone.Token);

                                _logger.LogDebug("Entering IDLE state");
                                await client.IdleAsync(combinedCts.Token);
                            }
                            finally
                            {
                                // Always remove event handlers
                                newIncomingMailFolder.CountChanged -= (s, e) => idleDone.Cancel();
                            }

                            // Check for new emails
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
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in email monitoring. Will retry in 30 seconds.");

                    try
                    {
                        await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break; // Exit if cancellation was requested during delay
                    }
                }
            }

            _logger.LogInformation("Email monitoring stopped");
        }

        private async Task FetchNewEmails(ImapClient client, IMailFolder inbox, CancellationToken cancellationToken)
        {
            var query = SearchQuery.Uids(new UniqueIdRange(new MailKit.UniqueId(_lastSeenUID + 1), MailKit.UniqueId.MaxValue));
            var newUids = await inbox.SearchAsync(query, cancellationToken);

            foreach (var uid in newUids)
            {
                var message = await inbox.GetMessageAsync(uid, cancellationToken);
                await ProcessNewEmailAsync(client, inbox, uid, message, cancellationToken);

                if (uid.Id > _lastSeenUID)
                    _lastSeenUID = uid.Id;
            }
        }

        private async Task ProcessNewEmailAsync(ImapClient client, IMailFolder inbox, UniqueId uid, MimeMessage message, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"New email received: {message.Subject}");

            var targetFolder = await EnsureFolderExistsAsync(client, "ReadMail", cancellationToken);

            await inbox.MoveToAsync(uid, targetFolder, cancellationToken);
            _logger.LogInformation($"Email '{message.Subject}' moved to 'ReadMail' folder.");
        }


        private async Task<IMailFolder> EnsureFolderExistsAsync(ImapClient client, string folderName, CancellationToken cancellationToken)
        {
            var personal = client.GetFolder(client.PersonalNamespaces[0]);
            IMailFolder folder = null;

            try
            {
                // Try to get the NewIncomingMail folder
                folder = await personal.GetSubfolderAsync(folderName, cancellationToken);
            }
            catch (FolderNotFoundException)
            {
                // If the folder doesn't exist, create it
                folder = await personal.CreateAsync(folderName, true, cancellationToken);
                _logger.LogInformation($"Created folder '{folderName}'.");
            }

            return folder;
        }
    }
}
