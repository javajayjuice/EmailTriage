using Abp.Application.Services;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.LableService.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Kairos.EmailTriage.Services.LableService
{
    /// <summary>
    /// Application service for managing labels.
    /// </summary>
    public class LabelAppService : ApplicationService, ILabelAppService, ITransientDependency
    {
        private readonly IRepository<Label, Guid> _labelRepo;
        private readonly IObjectMapper _objectMapper;

        /// <summary>
        /// Logger instance for logging operations.
        /// </summary>
        public new ILogger Logger { get; set; } // Use 'new' keyword to explicitly hide the inherited member.

        /// <summary>
        /// Initializes a new instance of the <see cref="LabelAppService"/> class.
        /// </summary>
        /// <param name="labelRepo">Repository for label entities.</param>
        /// <param name="objectMapper">Object mapper for mapping DTOs and entities.</param>
        public LabelAppService(IRepository<Label, Guid> labelRepo, IObjectMapper objectMapper)
        {
            _labelRepo = labelRepo;
            _objectMapper = objectMapper;
            Logger = NullLogger.Instance;
        }

        /// <summary>
        /// Retrieves all labels asynchronously.
        /// </summary>
        /// <returns>A list of all labels.</returns>
        public async Task<List<CreateLableInput>> GetAllLablesAsync()
        {
            var allLabels = await _labelRepo.GetAllListAsync();
            List<CreateLableInput> resultLabels = new List<CreateLableInput>();
            foreach (var item in allLabels)
            {
                resultLabels.Add(_objectMapper.Map<CreateLableInput>(item));
            }
            
            return  resultLabels;
        }

        /// <summary>
        /// Retrieves a label by its ID asynchronously.
        /// </summary>
        /// <param name="id">The ID of the label.</param>
        /// <returns>The label with the specified ID.</returns>
        public async Task<Label> GetLableByIdAsync(Guid id)
        {
            return await _labelRepo.FirstOrDefaultAsync(id);
        }

        /// <summary>
        /// Creates a new label asynchronously.
        /// </summary>
        /// <param name="input">The input data for creating the label.</param>
        /// <returns>The created label.</returns>
        public async Task<Label> CreateLableAsync(CreateLableInput input)
        {
            var label = _objectMapper.Map<Label>(input);
            return await _labelRepo.InsertAsync(label);
        }

        /// <summary>
        /// Deletes a label by its ID asynchronously.
        /// </summary>
        /// <param name="id">The ID of the label to delete.</param>
        public async Task DeleteLableAsync(Guid id)
        {
            await _labelRepo.DeleteAsync(id);
        }

        /// <summary>
        /// Updates an existing label asynchronously.
        /// </summary>
        /// <param name="input">The input data for updating the label.</param>
        public async Task UpdateLableAsync(UpdateLableInput input)
        {
            var label = await _labelRepo.GetAsync(input.Id);
            _objectMapper.Map(input, label);
            await _labelRepo.UpdateAsync(label);
        }
    }
}