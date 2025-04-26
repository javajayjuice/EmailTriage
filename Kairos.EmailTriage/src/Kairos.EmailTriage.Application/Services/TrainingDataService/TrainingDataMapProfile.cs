using AutoMapper;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.TrainingDataService.Dtos;

namespace Kairos.EmailTriage.Services.TrainingDataService
{
    public class TrainingDataMapProfile : Profile
    {
        public TrainingDataMapProfile()
        {
            CreateMap<TrainingData, CreateTrainingDataInput>()
                .ForMember(dest => dest.TicketId, opt => opt.MapFrom(src => src.TicketId))
                .ForMember(dest => dest.LabelId, opt => opt.MapFrom(src => src.LabelId))
                .ForMember(dest => dest.IsUsed, opt => opt.MapFrom(src => src.IsUsed))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));

            CreateMap<CreateTrainingDataInput, TrainingData>();
        }
    }
}