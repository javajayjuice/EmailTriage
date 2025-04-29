using Kairos.EmailTriage.Abstracts;
using Kairos.EmailTriage.Authorization.Users;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services
{
    //[Route("api/[controller]")]
    //[ApiController]
    //public class GoogleController : ControllerBase
    //{
    //        private readonly IAccountService _accountService;
    //    private readonly LinkGenerator _linkGenerator;

    //    public GoogleController(IAccountService accountService, LinkGenerator linkGenerator)
    //    {
    //        _accountService = accountService;
    //        _linkGenerator = linkGenerator;
    //    }

    //    [HttpGet("login/google")]
    //    public IActionResult GoogleLogin(
    //        [FromQuery] string returnUrl, 
    //        [FromServices] SignInManager<User> signManager)
    //    {
    //        try
    //        {
    //            var properties = signManager.ConfigureExternalAuthenticationProperties("Google",
    //                _linkGenerator.GetUriByAction(HttpContext, 
    //                action: "GoogleCallback", 
    //                controller: "Google",
    //                values: new { returnUrl = returnUrl })
    //            );

    //            return Challenge(properties, "Google");
    //        }
    //        catch (Exception ex)
    //        {
    //            Console.WriteLine("Error: " + ex.Message);
    //            return BadRequest(ex.Message);
    //        }
    //    }

    //    [HttpGet("login/google/callback")]
    //    public async Task<IActionResult> GoogleCallback([FromQuery] string returnUrl)
    //    {
    //        try
    //        {
    //            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
    //            if (!result.Succeeded)
    //            {
    //                return Unauthorized();
    //            }

    //            await _accountService.LoginWithGoogleAsync(result.Principal);

    //            return Redirect(returnUrl ?? "/");
    //        }
    //        catch (Exception ex)
    //        {
    //            return BadRequest(ex.Message);
    //        }

    //    }
    //}
}
