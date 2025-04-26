using Abp.Dependency;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using RestSharp;
using Kairos.EmailTriage.Services.TrainingDataService.Dtos;

namespace Kairos.EmailTriage.Services.Helpers
{
    class HttpHelper
    {
    }

    public class ClassificationModel: ITransientDependency
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<ClassificationModel> _logger;

        public ClassificationModel (IConfiguration configuration, ILogger<ClassificationModel> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> PerformTraining()
        {
            // fix here
            var url = _configuration.GetSection("KairosModel")["BaseUrl"];
            var endpoint = _configuration.GetSection("KairosModel:Endpoint")["Train"];
            url = "http://127.0.0.1:5000/";
            endpoint = "api/train";

            var options = new RestClientOptions(url);
            using (var client = new RestClient(options))
            {
                var request = new RestRequest($"{endpoint}", Method.Post);
                request.AddJsonBody("");

                try
                {
                    var response = await client.ExecuteAsync(request);

                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        var content = response.Content;
                        var result = JsonConvert.DeserializeObject<string>(content);
                        return result;
                    }
                    else
                    {
                        _logger.LogError($"{response.ErrorMessage}");
                        return "Failed";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"{ex.Message}");
                    return "Error";
                }
            }
        }

        public class OperationResult<T>
        {
            public bool IsSuccess { get; set; }
            public string ErrorMessage { get; set; }
            public T Data { get; set; }

            public static OperationResult<T> Success(T data) => new OperationResult<T> { IsSuccess = true, Data = data };
            public static OperationResult<T> Failure(string errorMessage) => new OperationResult<T> { IsSuccess = false, ErrorMessage = errorMessage };
        }

        public async Task<OperationResult<PredictionResultsDto>> PerformPrediction(PredictTicketDto input)
        {
            var url = _configuration.GetSection("KairosModel")["BaseUrl"];
            var endpoint = _configuration.GetSection("KairosModel:Endpoint")["Predict"];
            url = "http://127.0.0.1:5000/";
            endpoint = "api/predict";

            var options = new RestClientOptions(url);
            using (var client = new RestClient(options))
            {
                var request = new RestRequest($"{endpoint}", Method.Post);
                request.AddJsonBody(input);

                try
                {
                    var response = await client.ExecuteAsync(request);

                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        var content = response.Content;
                        var result = JsonConvert.DeserializeObject<PredictionResultsDto>(content);
                        return OperationResult<PredictionResultsDto>.Success(result);
                    }
                    else
                    {
                        _logger.LogError($"Error: {response.ErrorMessage}");
                        return OperationResult<PredictionResultsDto>.Failure(response.ErrorMessage);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Exception: {ex.Message}");
                    return OperationResult<PredictionResultsDto>.Failure(ex.Message);
                }
            }
        }
    }
}
