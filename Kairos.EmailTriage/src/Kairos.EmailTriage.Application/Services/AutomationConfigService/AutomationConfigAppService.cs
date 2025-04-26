using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.AutomationConfigService.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.AutomationConfigService
{
    public class AutomationConfigAppService : ApplicationService, IAutomationConfigAppService, ITransientDependency
    {
        private readonly IRepository<AutomationConfig, Guid> _automationConfigRepo;
        private readonly IRepository<Label, Guid> _labelRepo;
        private readonly IObjectMapper _objectMapper;
        public ILogger Logger { get; set; }

        public AutomationConfigAppService(
            IRepository<AutomationConfig, Guid> automationConfigRepo,
            IRepository<Label, Guid> labelRepo,
            IObjectMapper objectMapper)
        {
            _automationConfigRepo = automationConfigRepo;
            _labelRepo = labelRepo;
            _objectMapper = objectMapper;
            Logger = NullLogger.Instance;
        }

        // GET /api/automationconfigs - List all automation configs
        public async Task<List<AutomationConfig>> GetAllAutomationConfigsAsync()
        {
            var configs = await _automationConfigRepo.GetAllListAsync();
            foreach (var config in configs)
            {
                config.Label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == config.LabelId);
            }
            return configs;
        }

        // GET /api/automationconfigs/{id} - Get specific automation config
        public async Task<AutomationConfig> GetAutomationConfigByIdAsync(Guid id)
        {
            var config = await _automationConfigRepo.FirstOrDefaultAsync(ac => ac.Id == id);
            if (config == null)
            {
                throw new Exception($"AutomationConfig with ID {id} not found.");
            }

            config.Label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == config.LabelId);
            return config;
        }

        // POST /api/automationconfigs - Create automation config
        public async Task<AutomationConfig> CreateAutomationConfigAsync(CreateAutomationConfigInput input)
        {
            var label = await _labelRepo.FirstOrDefaultAsync(l => l.Id == input.LabelId);
            if (label == null)
            {
                throw new Exception($"Label with ID {input.LabelId} not found.");
            }

            var config = _objectMapper.Map<AutomationConfig>(input);
            config.Label = label;

            await _automationConfigRepo.InsertOrUpdateAsync(config);
            return config;
        }

        // PUT /api/automationconfigs - Update automation config
        public async Task UpdateAutomationConfigAsync(UpdateAutomationConfigInput input)
        {
            var config = await _automationConfigRepo.FirstOrDefaultAsync(ac => ac.Id == input.Id);
            if (config == null)
            {
                throw new Exception($"AutomationConfig with ID {input.Id} not found.");
            }

            _objectMapper.Map(input, config);
            await _automationConfigRepo.UpdateAsync(config);
        }

        // DELETE /api/automationconfigs/{id} - Delete automation config
        public async Task DeleteAutomationConfigAsync(Guid id)
        {
            var config = await _automationConfigRepo.FirstOrDefaultAsync(ac => ac.Id == id);
            if (config == null)
            {
                throw new Exception($"AutomationConfig with ID {id} not found.");
            }

            await _automationConfigRepo.DeleteAsync(config);
        }
    }
}