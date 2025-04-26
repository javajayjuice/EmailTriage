using System.Threading.Tasks;
using Kairos.EmailTriage.Models.TokenAuth;
using Kairos.EmailTriage.Web.Controllers;
using Shouldly;
using Xunit;

namespace Kairos.EmailTriage.Web.Tests.Controllers
{
    public class HomeController_Tests: EmailTriageWebTestBase
    {
        [Fact]
        public async Task Index_Test()
        {
            await AuthenticateAsync(null, new AuthenticateModel
            {
                UserNameOrEmailAddress = "admin",
                Password = "123qwe"
            });

            //Act
            var response = await GetResponseAsStringAsync(
                GetUrl<HomeController>(nameof(HomeController.Index))
            );

            //Assert
            response.ShouldNotBeNullOrEmpty();
        }
    }
}