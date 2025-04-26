using Microsoft.Extensions.Configuration;
using Castle.MicroKernel.Registration;
using Abp.Events.Bus;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Kairos.EmailTriage.Configuration;
using Kairos.EmailTriage.EntityFrameworkCore;
using Kairos.EmailTriage.Migrator.DependencyInjection;

namespace Kairos.EmailTriage.Migrator
{
    [DependsOn(typeof(EmailTriageEntityFrameworkModule))]
    public class EmailTriageMigratorModule : AbpModule
    {
        private readonly IConfigurationRoot _appConfiguration;

        public EmailTriageMigratorModule(EmailTriageEntityFrameworkModule abpProjectNameEntityFrameworkModule)
        {
            abpProjectNameEntityFrameworkModule.SkipDbSeed = true;

            _appConfiguration = AppConfigurations.Get(
                typeof(EmailTriageMigratorModule).GetAssembly().GetDirectoryPathOrNull()
            );
        }

        public override void PreInitialize()
        {
            Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
                EmailTriageConsts.ConnectionStringName
            );

            Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
            Configuration.ReplaceService(
                typeof(IEventBus), 
                () => IocManager.IocContainer.Register(
                    Component.For<IEventBus>().Instance(NullEventBus.Instance)
                )
            );
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(EmailTriageMigratorModule).GetAssembly());
            ServiceCollectionRegistrar.Register(IocManager);
        }
    }
}
