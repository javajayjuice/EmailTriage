using Abp.Application.Services;
using Kairos.EmailTriage.MultiTenancy.Dto;

namespace Kairos.EmailTriage.MultiTenancy
{
    public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
    {
    }
}

