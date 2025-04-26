using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Hangfire;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.Helpers;
using Kairos.EmailTriage.Services.TrainingDataService.Dtos;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TrainingDataService.Jobs
{
    class KairosModelBackgroundJob : ApplicationService, IKairosModelBackgroundJob, ITransientDependency
    {
        private readonly ClassificationModel _kairosModel;
        private readonly ILogger<KairosModelBackgroundJob> _logger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<Ticket, Guid> _ticketRepo;
        private readonly IRepository<Label, Guid> _labelRepo;

        public KairosModelBackgroundJob(ClassificationModel kairosModel, ILogger<KairosModelBackgroundJob> logger, IRepository<Ticket, Guid> ticketRepo, IRepository<Label, Guid> labelRepo, IUnitOfWorkManager unitOfWorkManager)
        {
            _kairosModel = kairosModel;
            _logger = logger;
            _ticketRepo = ticketRepo;
            _labelRepo = labelRepo;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public async Task<string> PerformTraining()
        {
            _logger.LogInformation("Starting training process...");
            try
            {
                var result = await _kairosModel.PerformTraining();

                // Update ticket

                _logger.LogInformation("Training process completed successfully.");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during the training process.");
                throw;
            }
        }


        public async Task PerformPrediction(PredictTicketDto input)
        {
            _logger.LogInformation("Starting training process...");
            try
            {
                var result = await _kairosModel.PerformPrediction(input);

                using (var uow = _unitOfWorkManager.Begin())
                {
                    var ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == result.Data.Id);
                    if (ticket != null)
                    {
                        var label = await _labelRepo.FirstOrDefaultAsync(l => l.Name.ToLower().Trim() == result.Data.Prediction.ToLower().Trim());
                        if (label != null)
                        {
                            ticket.LabelId = label.Id;
                            ticket.Label = label;
                            ticket.ConfidenceScore = result.Data.Score;

                            await _ticketRepo.UpdateAsync(ticket);
                            _logger.LogInformation($"Ticket {ticket.Id} updated with label {label.Name} and confidence score {result.Data.Score}");
                            await uow.CompleteAsync();
                        }
                        else
                        {
                            _logger.LogWarning($"Label {result.Data.Prediction} not found for ticket {ticket.Id}");
                            await uow.CompleteAsync();
                        }
                    }
                }

                _logger.LogInformation("Prediction process completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during the predicting process.");
                throw;
            }
        }
    }
}
