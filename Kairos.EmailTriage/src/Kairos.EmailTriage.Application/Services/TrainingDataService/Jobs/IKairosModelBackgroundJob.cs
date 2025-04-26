using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TrainingDataService.Jobs
{
    public interface IKairosModelBackgroundJob
    {
        Task<string> PerformTraining();
    }
}
