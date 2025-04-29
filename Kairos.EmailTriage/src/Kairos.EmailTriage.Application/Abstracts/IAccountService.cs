using Kairos.EmailTriage.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Abstracts
{
    public interface IAccountService
    {
        Task RegisterAsync(RegisterRequest registerRequest);
        Task LoginAsync(LoginRequest loginRequest);
        Task RefreshTokenAsync(string? refreshToken);
        Task LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal);
    }
}
