using Abp.AspNetCore.Mvc.Controllers;
using Kairos.EmailTriage.Services.EmailService.Jobs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.EmailService
{
    [Route("api/services/app/Email")]
    public class EmailController : AbpController
    {
        private readonly EmailBackgroundJob _emailBackgroundJob;
        private readonly ILogger<EmailController> _logger;

        public EmailController(
            EmailBackgroundJob emailMonitoringService,
            ILogger<EmailController> logger)
        {
            _emailBackgroundJob = emailMonitoringService;
            _logger = logger;
        }

        [HttpPost]
        [Route("MonitorEmailsV1")]
        public IActionResult MonitorEmails()
        {
            // The service is already running as a background service
            // This endpoint just returns the status
            bool isRunning = _emailBackgroundJob.IsRunning();

            _logger.LogInformation("Email monitoring status check: {0}", isRunning ? "Running" : "Not running");

            return Ok(new
            {
                success = true,
                result = new
                {
                    isRunning = isRunning,
                    message = isRunning ? "Email monitoring service is running" : "Email monitoring service is not currently running"
                }
            });
        }

        [HttpPost]
        [Route("GetMonitoringStatus")]
        public IActionResult GetMonitoringStatus()
        {
            bool isRunning = _emailBackgroundJob.IsRunning();
            return Ok(new
            {
                success = true,
                result = new { isRunning = isRunning }
            });
        }
    }
}
