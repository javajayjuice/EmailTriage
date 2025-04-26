using Abp.Application.Services;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.TicketService.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.TicketService
{
    /// <summary>
    /// Provides application services for managing tickets.
    /// </summary>
    public interface ITicketAppService : IApplicationService
    {
        /// <summary>
        /// Retrieves all tickets asynchronously.
        /// </summary>
        /// <returns>A list of all tickets.</returns>
        Task<List<Ticket>> GetAllTicketsAsync();

        /// <summary>
        /// Retrieves a ticket by its unique identifier asynchronously.
        /// </summary>
        /// <param name="id">The unique identifier of the ticket.</param>
        /// <returns>The ticket with the specified identifier.</returns>
        Task<Ticket> GetTicketByIdAsync(Guid id);

        /// <summary>
        /// Creates a new ticket asynchronously.
        /// </summary>
        /// <param name="input">The input data for creating the ticket.</param>
        /// <returns>The created ticket.</returns>
        Task<Ticket> CreateTicketAsync(CreateTicketInput input);

        /// <summary>
        /// Classifies tickets asynchronously.
        /// </summary>
        /// <returns>A string indicating the result of the classification process.</returns>
        Task<string> ClassifyTicketsAsync();
    }
}
