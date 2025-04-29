using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Domain
{
    public class MsUser : IdentityUser<Guid>
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiresAtUtc { get; set; }

        public static MsUser Create(string email, string firstName, string lastName)
        {
            return new MsUser
            {
                Email = email,
                UserName = email,
                FirstName = firstName,
                LastName = lastName
            };
        }

        public override string ToString()
        {
            return FirstName + " " + LastName;
        }
    }
}
