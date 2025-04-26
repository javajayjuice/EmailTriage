using Abp.Application.Services;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.FeedbackService.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.FeedbackService
{
    /// <summary>
    /// Provides methods to manage feedbacks in the system.
    /// </summary>
    public interface IFeedbackAppService : IApplicationService
    {
        /// <summary>
        /// Retrieves all feedbacks.
        /// </summary>
        /// <returns>A list of feedbacks.</returns>
        Task<List<Feedback>> GetAllFeedbacksAsync();

        /// <summary>
        /// Retrieves a feedback by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the feedback.</param>
        /// <returns>The feedback with the specified identifier.</returns>
        Task<Feedback> GetFeedbackByIdAsync(Guid id);

        /// <summary>
        /// Creates a new feedback.
        /// </summary>
        /// <param name="input">The input data for creating the feedback.</param>
        /// <returns>The created feedback.</returns>
        Task<Feedback> CreateFeedbackAsync(CreateFeedbackInput input);

        /// <summary>
        /// Deletes a feedback by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the feedback to delete.</param>
        Task DeleteFeedbackAsync(Guid id);
    }
}