using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using Kairos.EmailTriage.Configuration.Dto;

namespace Kairos.EmailTriage.Configuration
{
    [AbpAuthorize]
    public class ConfigurationAppService : EmailTriageAppServiceBase, IConfigurationAppService
    {
        public async Task ChangeUiTheme(ChangeUiThemeInput input)
        {
            await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
        }
    }
}
