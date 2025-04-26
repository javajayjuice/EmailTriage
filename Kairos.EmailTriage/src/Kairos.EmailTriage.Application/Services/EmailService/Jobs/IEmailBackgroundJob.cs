using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.EmailService.Jobs
{
    public interface IEmailBackgroundJob
    {
        bool IsRunning();
    }
}
