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
    [Table("TrainingDatas")]
    public class TrainingData : FullAuditedEntity<Guid>
    {
        [Required]
        public Guid TicketId { get; set; }
        public Ticket Ticket { get; set; }
        public string TextColumn { get; set; }

        [Required]
        public Guid LabelId { get; set; }
        public Label Label { get; set; }
        public string LabelColumn { get; set; }

        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
