using Abp.AutoMapper;
using Kairos.EmailTriage.Domain;
using System;

namespace Kairos.EmailTriage.Services.TrainingDataService.Dtos
{
    [AutoMapTo(typeof(TrainingData))]
    public class CreateTrainingDataInput
    {
        public Guid TicketId { get; set; }
        public Guid LabelId { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    [AutoMapTo(typeof(TrainingData))]
    public class CreateTrainingFromTicket
    {
        public Guid TicketId { get; set; }
        public Guid? LabelId { get; set; }
    }

    [AutoMap(typeof(Ticket))]
    public class PredictTicketDto
    {
        public string Text { get; set; }
        public Guid Id { get; set; }
    }

    public class PredictionResultsDto
    {
        public string Prediction { get; set; }
        public float Score { get; set; }
        public Guid Id { get; set; }
    }

}