using Abp.AutoMapper;
using Kairos.EmailTriage.Domain;
using System;

namespace Kairos.EmailTriage.Services.AutomationConfigService.Dtos
{
    [AutoMapTo(typeof(AutomationConfig))]
    public class CreateAutomationConfigInput
    {
        public Guid LabelId { get; set; }
        public bool AutoRespond { get; set; }
        public string ResponseTemplate { get; set; }
        public string NotifyEmail { get; set; }
    }

    [AutoMapTo(typeof(AutomationConfig))]
    public class UpdateAutomationConfigInput
    {
        public Guid Id { get; set; }
        public Guid LabelId { get; set; }
        public bool AutoRespond { get; set; }
        public string ResponseTemplate { get; set; }
        public string NotifyEmail { get; set; }
    }
}