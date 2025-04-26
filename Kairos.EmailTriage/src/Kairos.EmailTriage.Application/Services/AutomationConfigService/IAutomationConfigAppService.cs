using Abp.Application.Services;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.AutomationConfigService.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.AutomationConfigService
{
    public interface IAutomationConfigAppService : IApplicationService
    {
        Task<List<AutomationConfig>> GetAllAutomationConfigsAsync();
        Task<AutomationConfig> GetAutomationConfigByIdAsync(Guid id);
        Task<AutomationConfig> CreateAutomationConfigAsync(CreateAutomationConfigInput input);
        Task UpdateAutomationConfigAsync(UpdateAutomationConfigInput input);
        Task DeleteAutomationConfigAsync(Guid id);
    }
}