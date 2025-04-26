using System.Threading.Tasks;
using Kairos.EmailTriage.Configuration.Dto;

namespace Kairos.EmailTriage.Configuration
{
    public interface IConfigurationAppService
    {
        Task ChangeUiTheme(ChangeUiThemeInput input);
    }
}
