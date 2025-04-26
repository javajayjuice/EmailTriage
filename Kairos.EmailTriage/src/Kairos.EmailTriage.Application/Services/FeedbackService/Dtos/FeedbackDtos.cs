using System;
using Abp.AutoMapper;
using Kairos.EmailTriage.Domain;

namespace Kairos.EmailTriage.Services.FeedbackService.Dtos
{
    /// <summary>
    /// Represents the input data required to create a feedback entry.
    /// </summary>
    [AutoMapTo(typeof(Feedback))]
    public class CreateFeedbackInput
    {
        /// <summary>
        /// Gets or sets the unique identifier of the ticket associated with the feedback.
        /// </summary>
        public Guid TicketId { get; set; }

        /// <summary>
        /// Gets or sets the old label of the ticket before the feedback.
        /// </summary>
        public string OldLabel { get; set; }

        /// <summary>
        /// Gets or sets the new label of the ticket after the feedback.
        /// </summary>
        public string NewLabel { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the feedback was created.
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}