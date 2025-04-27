using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TicketService
{
    public class TicketEventHandler : IAsyncEventHandler<EntityUpdatedEventData<Ticket>>, ITransientDependency
    {
        protected readonly IHubContext<ClientHub> _hubContext;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IIocManager _iocManager;
        private readonly IDistributedCache _distributedCache;
        private const string TicketsCacheKey = "AllTickets";

        public TicketEventHandler(
            IHubContext<ClientHub> hubContext,
            IUnitOfWorkManager unitOfWorkManager,
            IIocManager iocManager,
            IDistributedCache distributedCache)
        {
            _hubContext = hubContext;
            _unitOfWorkManager = unitOfWorkManager;
            _iocManager = iocManager;
            _distributedCache = distributedCache;
        }

        [UnitOfWork]
        public async Task HandleEventAsync(EntityUpdatedEventData<Ticket> eventData)
        {
            try
            {
                using (var uow = _unitOfWorkManager.Begin())
                {
                    var ticketRepo = _iocManager.Resolve<IRepository<Ticket, Guid>>();
                    var labelRepo = _iocManager.Resolve<IRepository<Label, Guid>>();
                    var ticket = await ticketRepo.FirstOrDefaultAsync(t => t.Id == eventData.Entity.Id);
                    ticket.Label = await labelRepo.GetAsync(ticket.LabelId.Value);

                    var ticketsJson = JsonSerializer.Serialize(ticket);
                    var cacheOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
                    };
                    await _distributedCache.SetStringAsync(TicketsCacheKey, ticketsJson, cacheOptions);

                    await _hubContext.Clients.All.SendAsync("Tickets", ticket);
                    await _hubContext.Clients.All.SendAsync("TicketUpdated", ticket);

                    await uow.CompleteAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to handle ticket update event: {ex.Message}", ex);
            }
        }
    }
}
