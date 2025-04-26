using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace Kairos.EmailTriage.Controllers
{
    public abstract class EmailTriageControllerBase: AbpController
    {
        protected EmailTriageControllerBase()
        {
            LocalizationSourceName = EmailTriageConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
