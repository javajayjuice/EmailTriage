using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Kairos.EmailTriage.Configuration;
using Kairos.EmailTriage.Services.EmailService.Jobs;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;
using System.Threading;
using Abp.Threading.BackgroundWorkers;

namespace Kairos.EmailTriage.Web.Host.Startup
{
    [DependsOn(
       typeof(EmailTriageWebCoreModule))]
    public class EmailTriageWebHostModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public EmailTriageWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(EmailTriageWebHostModule).GetAssembly());
        }

        public override void PostInitialize()
        {
            // Register EmailBackgroundJob as a hosted service through ABP's IocManager
            //var backgroundJob = IocManager.Resolve<EmailBackgroundJob>();

            var backgroundWorkerManager = IocManager.Resolve<IBackgroundWorkerManager>();
            backgroundWorkerManager.Add(IocManager.Resolve<EmailBackgroundWorkerAdapter>());
        }
    }
}
