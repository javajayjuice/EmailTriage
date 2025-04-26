using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Hangfire;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.TrainingDataService.Dtos;
using Kairos.EmailTriage.Services.TrainingDataService.Jobs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TrainingDataService
{
    public class TrainingDataEventHandler : IAsyncEventHandler<EntityCreatedEventData<Ticket>>, ITransientDependency
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IIocManager _iocManager;
        public TrainingDataEventHandler(
            IUnitOfWorkManager unitOfWorkManager,
            IIocManager iocManager)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _iocManager = iocManager;
        }
        public async Task HandleEventAsync(EntityCreatedEventData<Ticket> eventData)
        {
            using (var uow = _unitOfWorkManager.Begin())
            {
                // Handle the event here
                // For example, you can log the event or perform some action
                var ticket = eventData.Entity;
                Console.WriteLine($"Ticket created: {ticket.Id}, Subject: {ticket.Subject}");

                // Perform your logic here
                var predictTicket = new PredictTicketDto
                {
                    Id = ticket.Id,
                    Text = $"{ticket.Subject}: {ticket.CleanedBody}".Trim()
                };

                BackgroundJob.Enqueue<KairosModelBackgroundJob>(x => x.PerformPrediction(predictTicket));

                await uow.CompleteAsync();
            }
        }
    }
}
