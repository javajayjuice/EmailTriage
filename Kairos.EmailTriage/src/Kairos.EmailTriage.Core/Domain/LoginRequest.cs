using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Domain
{
    public record LoginRequest
    {
        public required string Email { get; init; }
        public required string Password { get; init; }
    }
}
