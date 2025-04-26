using Abp.AutoMapper;
using Kairos.EmailTriage.Domain;
using System;

namespace Kairos.EmailTriage.Services.LableService.Dtos
{
    /// <summary>
    /// Input DTO for creating a new label.
    /// </summary>
    [AutoMapTo(typeof(Label))]
    public class CreateLableInput
    {
        /// <summary>
        /// Gets or sets the name of the label.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets the description of the label.
        /// </summary>
        public string? Description { get; set; }

        public Guid? Id { get; set; }
    }

    /// <summary>
    /// Input DTO for updating an existing label.
    /// </summary>
    [AutoMapTo(typeof(Label))]
    public class UpdateLableInput
    {
        /// <summary>
        /// Gets or sets the unique identifier of the label.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the label.
        /// </summary>
        public string? Name { get; set; }

        /// <summary>
        /// Gets or sets the description of the label.
        /// </summary>
        public string? Description { get; set; }
    }


}
