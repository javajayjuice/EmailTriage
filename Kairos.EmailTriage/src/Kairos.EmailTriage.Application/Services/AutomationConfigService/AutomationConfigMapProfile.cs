using AutoMapper;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.AutomationConfigService.Dtos;

namespace Kairos.EmailTriage.Services.AutomationConfigService
{
    public class AutomationConfigMapProfile : Profile
    {
        public AutomationConfigMapProfile()
        {
            CreateMap<AutomationConfig, CreateAutomationConfigInput>()
                .ForMember(dest => dest.LabelId, opt => opt.MapFrom(src => src.LabelId))
                .ForMember(dest => dest.AutoRespond, opt => opt.MapFrom(src => src.AutoRespond))
                .ForMember(dest => dest.ResponseTemplate, opt => opt.MapFrom(src => src.ResponseTemplate))
                .ForMember(dest => dest.NotifyEmail, opt => opt.MapFrom(src => src.NotifyEmail));

            CreateMap<CreateAutomationConfigInput, AutomationConfig>();

            CreateMap<AutomationConfig, UpdateAutomationConfigInput>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.LabelId, opt => opt.MapFrom(src => src.LabelId))
                .ForMember(dest => dest.AutoRespond, opt => opt.MapFrom(src => src.AutoRespond))
                .ForMember(dest => dest.ResponseTemplate, opt => opt.MapFrom(src => src.ResponseTemplate))
                .ForMember(dest => dest.NotifyEmail, opt => opt.MapFrom(src => src.NotifyEmail));

            CreateMap<UpdateAutomationConfigInput, AutomationConfig>();
        }
    }
}