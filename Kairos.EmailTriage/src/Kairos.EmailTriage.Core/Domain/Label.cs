using Abp.AutoMapper;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Domain
{
    [Table("Labels")]
    [AutoMap]
    public class Label : FullAuditedEntity<Guid>
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
