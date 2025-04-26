using System;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Castle.Facilities.Logging;
using Abp.AspNetCore;
using Abp.AspNetCore.Mvc.Antiforgery;
using Abp.Castle.Logging.Log4Net;
using Abp.Extensions;
using Kairos.EmailTriage.Configuration;
using Kairos.EmailTriage.Identity;
using Abp.AspNetCore.SignalR.Hubs;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.IO;
using Hangfire;
using Abp.Hangfire;
using Kairos.EmailTriage.Services.TrainingDataService.Jobs;
using Kairos.EmailTriage.Services.EmailService.Jobs;
using Kairos.EmailTriage.Services.SignalR;
using Abp.Domain.Repositories;
using Kairos.EmailTriage.Domain;
using Abp.EntityFrameworkCore.Repositories;
using Kairos.EmailTriage.EntityFrameworkCore;
using Abp.Configuration.Startup;
using Abp.Dependency;
using System.Threading.Tasks;
using System.Threading;
using Abp.Domain.Uow;

namespace Kairos.EmailTriage.Web.Host.Startup
{
    public class Startup
    {
        private const string _defaultCorsPolicyName = "localhost";

        private const string _apiVersion = "v1";

        private readonly IConfigurationRoot _appConfiguration;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public Startup(IWebHostEnvironment env)
        {
            _hostingEnvironment = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public void ConfigureServices(IServiceCollection services)
        {

            //MVC
            services.AddControllersWithViews(options =>
            {
                options.Filters.Add(new AbpAutoValidateAntiforgeryTokenAttribute());
            });

            IdentityRegistrar.Register(services);
            AuthConfigurer.Configure(services, _appConfiguration);

            services.AddSignalR(e =>
            {
                e.EnableDetailedErrors = true;
            });

            // Hangfire
            services.AddHangfire(config =>
            {
                config.UseSqlServerStorage(_appConfiguration.GetConnectionString("Default"));
            });

            services.AddHangfireServer();

            // Configure CORS for angular2 UI
            services.AddCors(
                options => options.AddPolicy(
                    _defaultCorsPolicyName,
                    builder => builder
                        .WithOrigins(
                            // App:CorsOrigins in appsettings.json can contain more than one address separated by comma.
                            _appConfiguration["App:CorsOrigins"]
                                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                                .Select(o => o.RemovePostFix("/"))
                                .ToArray()
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                )
            );

            // Swagger - Enable this line and the related lines in Configure method to enable swagger UI
            ConfigureSwagger(services);

            //Configure Abp and Dependency Injection
            services.AddAbpWithoutCreatingServiceProvider<EmailTriageWebHostModule>(
                // Configure Log4Net logging
                options => options.IocManager.IocContainer.AddFacility<LoggingFacility>(
                    f => f.UseAbpLog4Net().WithConfig(_hostingEnvironment.IsDevelopment()
                        ? "log4net.config"
                        : "log4net.Production.config"
                    )
                )
            );


            //services.AddSingleton<EmailBackgroundJob>();

            //services.AddHostedService(sp => sp.GetRequiredService<EmailBackgroundJob>());

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            app.UseAbp(options => { options.UseAbpRequestLocalization = false; }); // Initializes ABP framework.

            app.UseCors(_defaultCorsPolicyName); // Enable CORS!

            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseAbpRequestLocalization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<AbpCommonHub>("/signalr");
                endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapControllerRoute("defaultWithArea", "{area}/{controller=Home}/{action=Index}/{id?}");
            });

            // Enable middleware to serve generated Swagger as a JSON endpoint
            app.UseSwagger(c => { c.RouteTemplate = "swagger/{documentName}/swagger.json"; });

            // Enable middleware to serve swagger-ui assets (HTML, JS, CSS etc.)
            app.UseSwaggerUI(options =>
            {
                // specifying the Swagger JSON endpoint.
                options.SwaggerEndpoint($"/swagger/{_apiVersion}/swagger.json", $"EmailTriage API {_apiVersion}");
                options.IndexStream = () => Assembly.GetExecutingAssembly()
                    .GetManifestResourceStream("Kairos.EmailTriage.Web.Host.wwwroot.swagger.ui.index.html");
                options.DisplayRequestDuration(); // Controls the display of the request duration (in milliseconds) for "Try it out" requests.
            }); // URL: /swagger

            // Hangfire 
            app.UseHangfireDashboard();
            app.UseHangfireDashboard("/hangfire", new DashboardOptions
            {
                Authorization = new[] { new AbpHangfireAuthorizationFilter("MyHangFireDashboardPermissionName") },
                AppPath = null // Disables the "Back to site" link
            });

            // Hangfire Schedule
            app.ApplicationServices.GetRequiredService<IRecurringJobManager>().AddOrUpdate<IKairosModelBackgroundJob>(
                  "PerformTrainingEvery5Minutes",
                  job => job.PerformTraining(),
                    "0 5 * * *"
              );

            app.UseEndpoints(endpoints =>
            {
                //endpoints.MapControllerRoute(
                //    name: "defaultWithArea",
                //    pattern: "{area}/{controller=Home}/{action=Index}/{id?}");
                //endpoints.MapControllerRoute(
                //    name: "default",
                //    pattern: "{controller=Home}/{action=Index}/{id?}");
                //endpoints.MapHub<AbpCommonHub>("/signalr");
                endpoints.MapHub<ClientHub>("/hub");
                //endpoints.MapHub<TimelineHub>("/signalr-client");
                //endpoints.MapHub<HisAdmisSignalRHub>("/signalr-utilityManDashboardHub");
                //endpoints.MapControllers();
                //endpoints.MapHub<SignalrAppenderHub>("/signalr-appender");
            });

        }

        private void ConfigureSwagger(IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc(_apiVersion, new OpenApiInfo
                {
                    Version = _apiVersion,
                    Title = "EmailTriage API",
                    Description = "EmailTriage",
                    // uncomment if needed TermsOfService = new Uri("https://example.com/terms"),
                    Contact = new OpenApiContact
                    {
                        Name = "EmailTriage",
                        Email = string.Empty,
                        Url = new Uri("https://twitter.com/aspboilerplate"),
                    },
                    License = new OpenApiLicense
                    {
                        Name = "MIT License",
                        Url = new Uri("https://github.com/aspnetboilerplate/aspnetboilerplate/blob/dev/LICENSE"),
                    }
                });
                options.DocInclusionPredicate((docName, description) => true);

                // Define the BearerAuth scheme that's in use
                options.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme()
                {
                    Description =
                        "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey
                });

                //add summaries to swagger
                bool canShowSummaries = _appConfiguration.GetValue<bool>("Swagger:ShowSummaries");
                if (canShowSummaries)
                {
                    var hostXmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                    var hostXmlPath = Path.Combine(AppContext.BaseDirectory, hostXmlFile);
                    options.IncludeXmlComments(hostXmlPath);

                    var applicationXml = $"Kairos.EmailTriage.Application.xml";
                    var applicationXmlPath = Path.Combine(AppContext.BaseDirectory, applicationXml);
                    options.IncludeXmlComments(applicationXmlPath);

                    var webCoreXmlFile = $"Kairos.EmailTriage.Web.Core.xml";
                    var webCoreXmlPath = Path.Combine(AppContext.BaseDirectory, webCoreXmlFile);
                    options.IncludeXmlComments(webCoreXmlPath);
                }
            });
        }
    }
}
