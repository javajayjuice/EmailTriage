using System.Threading.Tasks;
using Abp.Application.Services;
using Kairos.EmailTriage.Authorization.Accounts.Dto;

namespace Kairos.EmailTriage.Authorization.Accounts
{
    public interface IAccountAppService : IApplicationService
    {
        Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

        Task<RegisterOutput> Register(RegisterInput input);
    }
}
