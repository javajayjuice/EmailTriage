using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.FeedbackService.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.FeedbackService
{
    /// <summary>
    /// Application service for managing feedbacks.
    /// </summary>
    public class FeedbackAppService : ApplicationService, IFeedbackAppService, ITransientDependency
    {
        private readonly IRepository<Feedback, Guid> _feedbackRepo;
        private readonly IRepository<Ticket, Guid> _ticketRepo;
        private readonly IObjectMapper _objectMapper;

        /// <summary>
        /// Logger instance for logging operations.
        /// </summary>
        public new ILogger Logger { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="FeedbackAppService"/> class.
        /// </summary>
        /// <param name="feedbackRepo">Repository for managing feedback entities.</param>
        /// <param name="objectMapper">Object mapper for mapping DTOs and entities.</param>
        public FeedbackAppService(IRepository<Feedback, Guid> feedbackRepo, IObjectMapper objectMapper, IRepository<Ticket, Guid> ticketRepo)
        {
            _feedbackRepo = feedbackRepo;
            _objectMapper = objectMapper;
            Logger = NullLogger.Instance;
            _ticketRepo = ticketRepo;
        }

        /// <summary>
        /// Retrieves all feedbacks.
        /// </summary>
        /// <returns>A list of feedbacks.</returns>
        public async Task<List<Feedback>> GetAllFeedbacksAsync()
        {
            var feedbacks = await _feedbackRepo.GetAllListAsync();

            foreach (var feedback in feedbacks)
            {
                feedback.Ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == feedback.TicketId);
            }

            return feedbacks;
        }

        /// <summary>
        /// Retrieves a specific feedback by its ID.
        /// </summary>
        /// <param name="id">The ID of the feedback to retrieve.</param>
        /// <returns>The feedback entity.</returns>
        /// <exception cref="Exception">Thrown when the feedback is not found.</exception>
        public async Task<Feedback> GetFeedbackByIdAsync(Guid id)
        {
            var feedback = await _feedbackRepo.FirstOrDefaultAsync(f => f.Id == id);
            if (feedback == null)
            {
                throw new Exception($"Feedback with ID {id} not found.");
            }
            var ticket = await _ticketRepo.FirstOrDefaultAsync(t => t.Id == feedback.TicketId);
            feedback.Ticket = ticket;

            return feedback;
        }

        /// <summary>
        /// Creates a new feedback.
        /// </summary>
        /// <param name="input">The input data for creating the feedback.</param>
        /// <returns>The created feedback entity.</returns>
        public async Task<Feedback> CreateFeedbackAsync(CreateFeedbackInput input)
        {
            if (input == null)
            {
                throw new ArgumentNullException(nameof(input), "Input cannot be null.");
            }

            if (input.TicketId == Guid.Empty)
            {
                throw new ArgumentException("TicketId cannot be empty.", nameof(input.TicketId));
            }

            var ticket = await _ticketRepo.FirstOrDefaultAsync(x => x.Id == input.TicketId);
            if (ticket == null)
            {
                throw new Exception($"Ticket with ID {input.TicketId} not found.");
            }

            var feedback = _objectMapper.Map<Feedback>(input);
            feedback.Ticket = ticket;

            try
            {
                await _feedbackRepo.InsertOrUpdateAsync(feedback);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "An error occurred while creating feedback.");
                throw new Exception("An error occurred while creating feedback. Please try again later.");
            }

            return feedback;
        }

        /// <summary>
        /// Deletes a feedback by its ID.
        /// </summary>
        /// <param name="id">The ID of the feedback to delete.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        /// <exception cref="Exception">Thrown when the feedback is not found.</exception>
        public async Task DeleteFeedbackAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ArgumentException("Feedback ID cannot be empty.", nameof(id));
            }

            var feedback = await _feedbackRepo.FirstOrDefaultAsync(f => f.Id == id);
            if (feedback == null)
            {
                throw new Exception($"Feedback with ID {id} not found.");
            }

            try
            {
                await _feedbackRepo.DeleteAsync(feedback);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, $"An error occurred while deleting feedback with ID {id}.");
                throw new Exception("An error occurred while deleting feedback. Please try again later.");
            }
        }
    }
}