using Abp.AutoMapper;
using Kairos.EmailTriage.Authorization.Users;
using Kairos.EmailTriage.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TicketService.Dtos
{
    [AutoMapTo(typeof(Ticket))]
    public class CreateTicketInput
    {
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public string? CleanedBody { get; set; }
        public Guid? LabelId { get; set; }
        public float? ConfidenceScore { get; set; }
        public bool? IsFAQ { get; set; }
        public string? Answer { get; set; }
    }
}
