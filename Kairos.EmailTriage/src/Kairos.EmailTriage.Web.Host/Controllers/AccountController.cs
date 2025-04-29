using Kairos.EmailTriage.Abstracts;
using Kairos.EmailTriage.Authorization.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Web.Host.Controllers
{
    //[Route("api/[controller]")]
    //[ApiController]
    //public class AccountController : ControllerBase
    //{
    //    private readonly IAccountService _accountService;
    //    private readonly LinkGenerator _linkGenerator;

    //    public AccountController(IAccountService accountService, LinkGenerator linkGenerator)
    //    {
    //        _accountService = accountService;
    //        _linkGenerator = linkGenerator;
    //    }

    //    [HttpGet("login/google")]
    //    public IActionResult GoogleLogin(string returnUrl = "/")
    //    {
    //        var properties = ((GoogleAuthAppService)_accountService).GoogleAuthAsync(
    //            returnUrl,
    //            _linkGenerator,
    //            HttpContext.RequestServices.GetService(typeof(Microsoft.AspNetCore.Identity.SignInManager<User>)) as Microsoft.AspNetCore.Identity.SignInManager<User>,
    //            HttpContext).Result;

    //        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    //    }

    //    [HttpGet("login/google/callback")]
    //    public async Task<IActionResult> GoogleCallback(string returnUrl = "/")
    //    {
    //        var result = await ((GoogleAuthAppService)_accountService).GoogleCallbackAsync(returnUrl, HttpContext);

    //        if (!result.succeeded)
    //        {
    //            return Unauthorized();
    //        }

    //        return Redirect(result.redirectUrl);
    //    }
    //}
}