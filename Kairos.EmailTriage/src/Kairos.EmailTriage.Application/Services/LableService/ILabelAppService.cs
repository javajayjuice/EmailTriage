using Abp.Application.Services;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.LableService.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.LableService
{
    /// <summary>
    /// Provides application services for managing labels.
    /// </summary>
    public interface ILabelAppService : IApplicationService
    {
        /// <summary>
        /// Retrieves all labels asynchronously.
        /// </summary>
        /// <returns>A list of all labels.</returns>
        Task<List<CreateLableInput>> GetAllLablesAsync();

        /// <summary>
        /// Retrieves a label by its unique identifier asynchronously.
        /// </summary>
        /// <param name="id">The unique identifier of the label.</param>
        /// <returns>The label with the specified identifier.</returns>
        Task<Label> GetLableByIdAsync(Guid id);

        /// <summary>
        /// Creates a new label asynchronously.
        /// </summary>
        /// <param name="input">The input data for creating the label.</param>
        /// <returns>The created label.</returns>
        Task<Label> CreateLableAsync(CreateLableInput input);

        /// <summary>
        /// Deletes a label by its unique identifier asynchronously.
        /// </summary>
        /// <param name="id">The unique identifier of the label to delete.</param>
        Task DeleteLableAsync(Guid id);

        /// <summary>
        /// Updates an existing label asynchronously.
        /// </summary>
        /// <param name="input">The input data for updating the label.</param>
        Task UpdateLableAsync(UpdateLableInput input);
    }
}
