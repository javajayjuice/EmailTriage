using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.ObjectMapping;
using Abp.Runtime.Caching;
using Kairos.EmailTriage.Authorization.Users;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.SignalR;
using Kairos.EmailTriage.Services.TicketService.Dtos;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TicketService
{
    /// <summary>
    /// Application service for managing tickets.
    /// </summary>
    public class TicketAppService : ApplicationService, IDomainService, ITransientDependency, ITicketAppService
    {
        private readonly IRepository<Ticket, Guid> _ticketRepo;
        private readonly IRepository<Label, Guid> _labelRepo;
        private readonly IObjectMapper _objectMapper;
        protected readonly IHubContext<ClientHub> _hubContext;
        private readonly ICacheManager _cacheManager;
        private const string AllTicketsCacheKey = "AllTickets";
        private const int CacheTimeInMinutes = 10;

        /// <summary>
        /// Logger instance for logging operations.
        /// </summary>
        public new ILogger Logger { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="TicketAppService"/> class.
        /// </summary>
        /// <param name="ticketRepo">Repository for managing tickets.</param>
        /// <param name="objectMapper">Object mapper for mapping DTOs and entities.</param>
        /// <param name="labelRepo">Repository for managing labels.</param>
        /// <param name="hubContext">Hub context for SignalR communication.</param>
        /// <param name="cacheManager">Cache manager for handling caching operations.</param>
        public TicketAppService(
            IRepository<Ticket, Guid> ticketRepo,
            IObjectMapper objectMapper,
            IRepository<Label, Guid> labelRepo,
            IHubContext<ClientHub> hubContext,
            ICacheManager cacheManager)
        {
            _ticketRepo = ticketRepo;
            _objectMapper = objectMapper;
            Logger = NullLogger.Instance;
            _labelRepo = labelRepo;
            _hubContext = hubContext;
            _cacheManager = cacheManager;
        }

        /// <summary>
        /// Retrieves all tickets with Redis caching.
        /// </summary>
        /// <returns>A list of all tickets.</returns>
        public async Task<List<Ticket>> GetAllTicketsAsync()
        {
            Logger.LogInformation("Using cache: {CacheType}", _cacheManager.GetType().Name);
            return await _cacheManager.GetCache("TicketCache").GetAsync(AllTicketsCacheKey, async (cacheKey) =>
            {
                Logger.LogInformation("Cache miss for AllTickets. Fetching from database.");
                var tickets = await _ticketRepo.GetAllListAsync();
                foreach (var ticket in tickets)
                {
                    ticket.Label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == ticket.LabelId);
                }
                return (object)tickets;
            }) as List<Ticket>;
        }

        /// <summary>
        /// Retrieves a specific ticket by its ID.
        /// </summary>
        /// <param name="id">The ID of the ticket.</param>
        /// <returns>The ticket with the specified ID.</returns>
        /// <exception cref="Exception">Thrown when the ticket is not found.</exception>
        public async Task<Ticket> GetTicketByIdAsync(Guid id)
        {
            var ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null)
            {
                throw new Exception($"Ticket with ID {id} not found.");
            }
            ticket.Label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == ticket.LabelId);

            return ticket;
        }

        /// <summary>
        /// Creates a new ticket.
        /// </summary>
        /// <param name="input">The input data for creating the ticket.</param>
        /// <returns>The created ticket.</returns>
        public async Task<Ticket> CreateTicketAsync(CreateTicketInput input)
        {
            var ticket = _objectMapper.Map<Ticket>(input);

            await _ticketRepo.InsertOrUpdateAsync(ticket);
            await _cacheManager.GetCache("TicketCache").RemoveAsync(AllTicketsCacheKey);
            //await _hubContext.Clients.All.SendAsync("TicketCreated",ticket);
            return ticket;
        }

        public async Task<string> ListCreateTicketAsync(List<CreateTicketInput> input)
        {
            foreach (var item in input)
            {
                var ticket = _objectMapper.Map<Ticket>(item);
                var label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == item.LabelId);
                ticket.LabelId = label.Id;
                ticket.Label = label;

                await _ticketRepo.InsertOrUpdateAsync(ticket);
            }

            await _cacheManager.GetCache("TicketCache").RemoveAsync(AllTicketsCacheKey);
            return "success";
        }

        /// <summary>
        /// Triggers ticket classification manually.
        /// </summary>
        /// <returns>A message indicating the result of the classification.</returns>
        public async Task<string> ClassifyTicketsAsync()
        {
            throw new NotImplementedException();
        }
    }
}
