using Abp.Application.Services;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.TrainingDataService.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TrainingDataService
{
    public interface ITrainingDataAppService : IApplicationService
    {
        Task<List<TrainingData>> GetAllTrainingDataAsync();
        Task<TrainingData> GetTrainingDataByIdAsync(Guid id);
        Task<TrainingData> CreateTrainingDataAsync(CreateTrainingDataInput input);
        Task DeleteTrainingDataAsync(Guid id);
    }
}