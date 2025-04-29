using Kairos.EmailTriage.Abstracts;
using Kairos.EmailTriage.Authorization.Users;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Exceptions;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services
{
    public class AccountService:IAccountService
    {
        private readonly IAuthTokenProcessor _authTokenProcessor;
        private readonly UserManager<User> _userManager;
        private readonly IUserRepository _userRepository;

        public AccountService(IAuthTokenProcessor authTokenProcessor, UserManager<User> userManager,
            IUserRepository userRepository)
        {
            _authTokenProcessor = authTokenProcessor;
            _userManager = userManager;
            _userRepository = userRepository;
        }


        ///// <summary>
        ///// Callback handler for Google authentication
        ///// </summary>
        //public async Task<(bool succeeded, string redirectUrl)> GoogleCallbackAsync(string returnUrl, HttpContext context)
        //{
        //    var result = await context.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
        //    if (!result.Succeeded)
        //    {
        //        return (false, string.Empty);
        //    }

        //    await LoginWithGoogleAsync(result.Principal);
        //    return (true, returnUrl ?? "/");
        //}

        //public Task LoginAsync(LoginRequest loginRequest)
        //{
        //    throw new NotImplementedException();
        //}

        //public Task LoginWithGoogleAsync(ClaimsPrincipal claimsPrincipal)
        //{
        //    throw new NotImplementedException();
        //}

        //public Task RefreshTokenAsync(string refreshToken)
        //{
        //    throw new NotImplementedException();
        //}

        //public Task RegisterAsync(RegisterRequest registerRequest)
        //{
        //    throw new NotImplementedException();
        //}

        public async Task RegisterAsync(RegisterRequest registerRequest)
        {
            var userExists = await _userManager.FindByEmailAsync(registerRequest.Email) != null;

            if (userExists)
            {
                throw new UserAlreadyExistsException(email: registerRequest.Email);
            }

            var user = User.CreateTenantAdminUser(1234, registerRequest.Email);
            //user.PasswordHash = _userManager.PasswordHasher.HashPassword(user, registerRequest.Password);

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                throw new RegistrationFailedException(result.Errors.Select(x => x.Description));
            }
        }

        public async Task LoginAsync(LoginRequest loginRequest)
        {
            var user = await _userManager.FindByEmailAsync(loginRequest.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
            {
                throw new LoginFailedException(loginRequest.Email);
            }

            var (jwtToken, expirationDateInUtc) = _authTokenProcessor.GenerateJwtToken(user);
            var refreshTokenValue = _authTokenProcessor.GenerateRefreshToken();

            var refreshTokenExpirationDateInUtc = DateTime.UtcNow.AddDays(7);

            //user.RefreshToken = refreshTokenValue;
            //user.RefreshTokenExpiresAtUtc = refreshTokenExpirationDateInUtc;
            await _userManager.UpdateAsync(user);

            _authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("ACCESS_TOKEN", jwtToken, expirationDateInUtc);
            //_authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("REFRESH_TOKEN", user.RefreshToken, refreshTokenExpirationDateInUtc);
        }

        public async Task RefreshTokenAsync(string? refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new RefreshTokenException("Refresh token is missing.");
            }

            var user = await _userRepository.GetUserByRefreshTokenAsync(refreshToken);

            if (user == null)
            {
                throw new RefreshTokenException("Unable to retrieve user for refresh token");
            }

            //if (user.RefreshTokenExpiresAtUtc < DateTime.UtcNow)
            //{
            //    throw new RefreshTokenException("Refresh token is expired.");
            //}

            var (jwtToken, expirationDateInUtc) = _authTokenProcessor.GenerateJwtToken(user);
            var refreshTokenValue = _authTokenProcessor.GenerateRefreshToken();

            var refreshTokenExpirationDateInUtc = DateTime.UtcNow.AddDays(7);

            //user.RefreshToken = refreshTokenValue;
            //user.RefreshTokenExpiresAtUtc = refreshTokenExpirationDateInUtc;
            await _userManager.UpdateAsync(user);

            _authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("ACCESS_TOKEN", jwtToken, expirationDateInUtc);
            //_authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("REFRESH_TOKEN", user.RefreshToken, refreshTokenExpirationDateInUtc);
        }

        public async Task LoginWithGoogleAsync(ClaimsPrincipal? claimsPrincipal)
        {
            if (claimsPrincipal == null)
            {
                throw new ExternalLoginProviderException("Google", "ClaimsPrincipal is null");
            }

            var email = claimsPrincipal.FindFirstValue(ClaimTypes.Email);

            if (email == null)
            {
                throw new ExternalLoginProviderException("Google", "Email is null");
            }

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                var newUser = new User
                {
                    UserName = email,
                    EmailAddress = email,
                    Name = claimsPrincipal.FindFirstValue(ClaimTypes.GivenName) ?? string.Empty,
                    Surname = claimsPrincipal.FindFirstValue(ClaimTypes.Surname) ?? string.Empty,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(newUser);

                if (!result.Succeeded)
                {
                    throw new ExternalLoginProviderException("Google",
                        $"Unable to create user: {string.Join(", ",
                            result.Errors.Select(x => x.Description))}");
                }



                user = newUser;
            }

            var info = new UserLoginInfo("Google",
                claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty,
                "Google");

            var loginResult = await _userManager.AddLoginAsync(user, info);

            if (!loginResult.Succeeded)
            {
                throw new ExternalLoginProviderException("Google",
                    $"Unable to login user: {string.Join(", ",
                        loginResult.Errors.Select(x => x.Description))}");
            }

            var (jwtToken, expirationDateInUtc) = _authTokenProcessor.GenerateJwtToken(user);
            var refreshTokenValue = _authTokenProcessor.GenerateRefreshToken();

            var refreshTokenExpirationDateInUtc = DateTime.UtcNow.AddDays(7);

            //user.RefreshToken = refreshTokenValue;
            //user.RefreshTokenExpiresAtUtc = refreshTokenExpirationDateInUtc;
            await _userManager.UpdateAsync(user);

            _authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("ACCESS_TOKEN", jwtToken, expirationDateInUtc);
            //_authTokenProcessor.WriteAuthTokenAsHttpOnlyCookie("REFRESH_TOKEN", user.RefreshToken, refreshTokenExpirationDateInUtc);
        }
    }
}
