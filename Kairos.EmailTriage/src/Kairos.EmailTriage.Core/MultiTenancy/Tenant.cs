using Abp.MultiTenancy;
using Kairos.EmailTriage.Authorization.Users;

namespace Kairos.EmailTriage.MultiTenancy
{
    public class Tenant : AbpTenant<User>
    {
        public Tenant()
        {            
        }

        public Tenant(string tenancyName, string name)
            : base(tenancyName, name)
        {
        }
    }
}
