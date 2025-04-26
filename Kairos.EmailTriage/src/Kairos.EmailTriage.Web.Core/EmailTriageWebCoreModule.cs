using System;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AspNetCore.SignalR;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Abp.Zero.Configuration;
using Kairos.EmailTriage.Authentication.JwtBearer;
using Kairos.EmailTriage.Configuration;
using Kairos.EmailTriage.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Abp.Hangfire.Configuration;
using Abp.Runtime.Caching.Redis;
using Abp.Threading.BackgroundWorkers;
using Kairos.EmailTriage.Services.TrainingDataService.Jobs;

namespace Kairos.EmailTriage
{
    [DependsOn(
         typeof(EmailTriageApplicationModule),
         typeof(EmailTriageEntityFrameworkModule),
         typeof(AbpAspNetCoreModule)
        ,typeof(AbpAspNetCoreSignalRModule),
        typeof(AbpRedisCacheModule)
     )]
    public class EmailTriageWebCoreModule : AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public EmailTriageWebCoreModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void PreInitialize()
        {
            Configuration.DefaultNameOrConnectionString = _appConfiguration.GetConnectionString(
                EmailTriageConsts.ConnectionStringName
            );

            // Use database for language management
            Configuration.Modules.Zero().LanguageManagement.EnableDbLocalization();

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(EmailTriageApplicationModule).GetAssembly()
                 );

            ConfigureTokenAuth();

            // Configure Hangfire
            Configuration.BackgroundJobs.UseHangfire();



            // Configure Redis
            Configuration.Caching.UseRedis();
            Configuration.Caching.UseRedis(options =>
            {
                options.ConnectionString = _appConfiguration["Redis:Configuration"];
                options.DatabaseId = _appConfiguration.GetValue<int>("RedisCache:DatabaseId");
            });

            //Configuration for all caches
            Configuration.Caching.ConfigureAll(cache =>
            {
                cache.DefaultSlidingExpireTime = TimeSpan.FromHours(2);
            });

            //Configuration for a specific cache
            Configuration.Caching.Configure("MyCache", cache =>
            {
                cache.DefaultSlidingExpireTime = TimeSpan.FromHours(8);
            });
        }

        private void ConfigureTokenAuth()
        {
            IocManager.Register<TokenAuthConfiguration>();
            var tokenAuthConfig = IocManager.Resolve<TokenAuthConfiguration>();

            tokenAuthConfig.SecurityKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appConfiguration["Authentication:JwtBearer:SecurityKey"]));
            tokenAuthConfig.Issuer = _appConfiguration["Authentication:JwtBearer:Issuer"];
            tokenAuthConfig.Audience = _appConfiguration["Authentication:JwtBearer:Audience"];
            tokenAuthConfig.SigningCredentials = new SigningCredentials(tokenAuthConfig.SecurityKey, SecurityAlgorithms.HmacSha256);
            tokenAuthConfig.Expiration = TimeSpan.FromDays(1);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(EmailTriageWebCoreModule).GetAssembly());
        }

        public override void PostInitialize()
        {
            IocManager.Resolve<ApplicationPartManager>()
                .AddApplicationPartsIfNotAddedBefore(typeof(EmailTriageWebCoreModule).Assembly);
        }
    }
}
