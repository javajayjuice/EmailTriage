using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Domain
{
    [Table("AutomationConfigs")]
    public class AutomationConfig : FullAuditedEntity<Guid>
    {
        public Guid LabelId { get; set; }
        public Label Label { get; set; }
        public bool AutoRespond { get; set; }
        public string ResponseTemplate { get; set; }
        public string NotifyEmail { get; set; }
    }
}
