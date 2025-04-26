using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Kairos.EmailTriage.Authorization;

namespace Kairos.EmailTriage
{
    [DependsOn(
        typeof(EmailTriageCoreModule), 
        typeof(AbpAutoMapperModule))]
    public class EmailTriageApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Authorization.Providers.Add<EmailTriageAuthorizationProvider>();
        }

        public override void Initialize()
        {
            var thisAssembly = typeof(EmailTriageApplicationModule).GetAssembly();

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
