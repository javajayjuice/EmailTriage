using Abp.Authorization;
using Kairos.EmailTriage.Authorization.Roles;
using Kairos.EmailTriage.Authorization.Users;

namespace Kairos.EmailTriage.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {
        }
    }
}
