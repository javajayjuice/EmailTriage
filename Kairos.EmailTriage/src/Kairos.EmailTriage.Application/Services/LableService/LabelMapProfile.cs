using AutoMapper;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.LableService.Dtos;

namespace Kairos.EmailTriage.Services.LableService
{
    /// <summary>
    /// Provides mapping configurations for Label-related DTOs and entities.
    /// </summary>
    public class LabelMapProfile : Profile
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="LabelMapProfile"/> class.
        /// Configures mappings between Label entities and DTOs.
        /// </summary>
        public LabelMapProfile()
        {
            CreateMap<Label, CreateLableInput>()
                .ForMember(x => x.Id, m => m.MapFrom(x => x.Id))
                .ForMember(x => x.Name, m => m.MapFrom(x => x.Name))
                .ForMember(x => x.Description, m => m.MapFrom(x => x.Description));

            CreateMap<CreateLableInput, Label>()
                .ForMember(x => x.Id, m => m.MapFrom(x => x.Id))
                .ForMember(x => x.Name, m => m.MapFrom(x => x.Name))
                .ForMember(x => x.Description, m => m.MapFrom(x => x.Description));

            CreateMap<Label, UpdateLableInput>()
                .ForMember(x => x.Id, m => m.MapFrom(x => x.Id))
                .ForMember(x => x.Name, m => m.MapFrom(x => x.Name))
                .ForMember(x => x.Description, m => m.MapFrom(x => x.Description));

            CreateMap<UpdateLableInput, Label>()
                .ForMember(x => x.Id, m => m.MapFrom(x => x.Id))
                .ForMember(x => x.Name, m => m.MapFrom(x => x.Name))
                .ForMember(x => x.Description, m => m.MapFrom(x => x.Description));
        }
    }
}