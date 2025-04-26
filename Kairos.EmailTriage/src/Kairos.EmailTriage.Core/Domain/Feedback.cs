using Abp.AutoMapper;
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
    [Table("Feedbacks")]
    [AutoMap]
    public class Feedback : FullAuditedEntity<Guid>
    {
        [Required]
        public Guid TicketId { get; set; }
        public Ticket Ticket { get; set; }
        public string OldLabel { get; set; }
        public string NewLabel { get; set; }
        //public Guid SubmittedById { get; set; }
        //public User SubmittedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
