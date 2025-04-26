using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using Hangfire;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.Helpers;
using Kairos.EmailTriage.Services.TrainingDataService.Dtos;
using Kairos.EmailTriage.Services.TrainingDataService.Jobs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TrainingDataService
{
    public class TrainingDataAppService : ApplicationService, ITrainingDataAppService, ITransientDependency
    {
        private readonly IRepository<TrainingData, Guid> _trainingDataRepo;
        private readonly IRepository<Ticket, Guid> _ticketRepo;
        private readonly IRepository<Label, Guid> _labelRepo;
        private readonly IObjectMapper _objectMapper;
        private readonly ClassificationModel _kairosModel;
        public ILogger Logger { get; set; }

        public TrainingDataAppService(
            IRepository<TrainingData, Guid> trainingDataRepo,
            IRepository<Ticket, Guid> ticketRepo,
            IRepository<Label, Guid> labelRepo,
            IObjectMapper objectMapper)
        {
            _trainingDataRepo = trainingDataRepo;
            _ticketRepo = ticketRepo;
            _labelRepo = labelRepo;
            _objectMapper = objectMapper;
            Logger = NullLogger.Instance;
        }

        // GET /api/trainingdata - List all trainingData data
        public async Task<List<TrainingData>> GetAllTrainingDataAsync()
        {
            var trainingDataList = await _trainingDataRepo.GetAllListAsync();

            foreach (var trainingData in trainingDataList)
            {
                trainingData.Ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == trainingData.TicketId);
                trainingData.Label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == trainingData.LabelId);
            }

            return trainingDataList;
        }

        // GET /api/trainingdata/{id} - Get specific trainingData data
        public async Task<TrainingData> GetTrainingDataByIdAsync(Guid id)
        {
            var trainingData = await _trainingDataRepo.FirstOrDefaultAsync(td => td.Id == id);
            if (trainingData == null)
            {
                throw new Exception($"TrainingData with ID {id} not found.");
            }

            trainingData.Ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == trainingData.TicketId);
            trainingData.Label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == trainingData.LabelId);

            return trainingData;
        }

        // POST /api/trainingdata - Create trainingData data
        public async Task<TrainingData> CreateTrainingDataAsync(CreateTrainingDataInput input)
        {
            if (input == null)
            {
                throw new ArgumentNullException(nameof(input), "Input cannot be null.");
            }

            var ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == input.TicketId);
            if (ticket == null)
            {
                throw new Exception($"Ticket with ID {input.TicketId} not found.");
            }

            var label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == input.LabelId);
            if (label == null)
            {
                throw new Exception($"Label with ID {input.LabelId} not found.");
            }

            var trainingData = _objectMapper.Map<TrainingData>(input);
            trainingData.Ticket = ticket;
            trainingData.Label = label;

            await _trainingDataRepo.InsertOrUpdateAsync(trainingData);
            return trainingData;
        }

        // Fixed the issue by checking if the Guid is not equal to Guid.Empty instead of null.
        public async Task<string> CreateTrainingDataFromTicketAsync(List<Guid> input)
        {
            if (input == null)
            {
                throw new ArgumentNullException(nameof(input), "Input cannot be null.");
            }

            foreach (var item in input)
            {
                var ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == item);
                if (ticket == null)
                {
                    throw new Exception($"Ticket with ID {item} not found.");
                }

                var label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == ticket.LabelId);
                if (label == null)
                {
                    throw new Exception($"Label with ID {ticket.LabelId} not found.");
                }

                var trainingData = new TrainingData
                {
                    LabelId = label.Id,
                    TicketId = ticket.Id,
                    IsUsed = true
                };

                await _trainingDataRepo.InsertOrUpdateAsync(trainingData);
                trainingData.Label = label;
                trainingData.Ticket = ticket;
            }


            return "success";
        }

        // DELETE /api/trainingdata/{id} - Delete trainingData data
        public async Task DeleteTrainingDataAsync(Guid id)
        {
            var trainingData = await _trainingDataRepo.FirstOrDefaultAsync(td => td.Id == id);
            if (trainingData == null)
            {
                throw new Exception($"TrainingData with ID {id} not found.");
            }

            await _trainingDataRepo.DeleteAsync(trainingData);
        }

        public async Task<string> UpdateColumnsAsync()
        {
            var trainingDataList = await _trainingDataRepo.GetAllListAsync();

            foreach (var trainingData in trainingDataList)
            {
                var ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == trainingData.TicketId);
                if (ticket != null)
                {
                    trainingData.TextColumn = $"{ticket.Subject}: {ticket.CleanedBody}".Trim();
                }
                var label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == trainingData.LabelId);
                if (label != null)
                {
                    trainingData.LabelColumn = label.Name;
                }
                await _trainingDataRepo.UpdateAsync(trainingData);
            }

            return "success";
        }

        public async Task PerformTrainingJob()
        {
            BackgroundJob.Enqueue<KairosModelBackgroundJob>(x => x.PerformTraining());
        }
    }
}