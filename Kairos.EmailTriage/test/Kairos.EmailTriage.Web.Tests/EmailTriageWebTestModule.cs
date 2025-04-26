using Abp.AspNetCore;
using Abp.AspNetCore.TestBase;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Kairos.EmailTriage.EntityFrameworkCore;
using Kairos.EmailTriage.Web.Startup;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

namespace Kairos.EmailTriage.Web.Tests
{
    [DependsOn(
        typeof(EmailTriageWebMvcModule),
        typeof(AbpAspNetCoreTestBaseModule)
    )]
    public class EmailTriageWebTestModule : AbpModule
    {
        public EmailTriageWebTestModule(EmailTriageEntityFrameworkModule abpProjectNameEntityFrameworkModule)
        {
            abpProjectNameEntityFrameworkModule.SkipDbContextRegistration = true;
        } 
        
        public override void PreInitialize()
        {
            Configuration.UnitOfWork.IsTransactional = false; //EF Core InMemory DB does not support transactions.
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(EmailTriageWebTestModule).GetAssembly());
        }
        
        public override void PostInitialize()
        {
            IocManager.Resolve<ApplicationPartManager>()
                .AddApplicationPartsIfNotAddedBefore(typeof(EmailTriageWebMvcModule).Assembly);
        }
    }
}