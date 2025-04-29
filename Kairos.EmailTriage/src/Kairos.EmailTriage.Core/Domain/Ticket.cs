using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Domain
{
    [Table("Tickets")]
    public class Ticket : FullAuditedEntity<Guid>
    {
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public string? CleanedBody { get; set; }
        public Guid? LabelId { get; set; }
        public Label? Label { get; set; }
        public float? ConfidenceScore { get; set; }
        public bool? IsFAQ { get; set; }
        public string? Answer { get; set; }
        //public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
