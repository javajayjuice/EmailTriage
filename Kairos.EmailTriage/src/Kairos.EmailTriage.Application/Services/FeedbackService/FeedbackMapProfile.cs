using AutoMapper;
using Kairos.EmailTriage.Domain;
using Kairos.EmailTriage.Services.FeedbackService.Dtos;

namespace Kairos.EmailTriage.Services.FeedbackService
{
    /// <summary>
    /// Provides mapping configurations for Feedback and CreateFeedbackInput objects.
    /// </summary>
    public class FeedbackMapProfile : Profile
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="FeedbackMapProfile"/> class.
        /// Configures mappings between Feedback and CreateFeedbackInput.
        /// </summary>
        public FeedbackMapProfile()
        {
            //CreateMap<Feedback, CreateFeedbackInput>()
            //    .ForMember(x => x.Ticket, m => m.MapFrom(x => x.Ticket))
            //    .ForMember(x => x.OldLabel, m => m.MapFrom(x => x.OldLabel))
            //    .ForMember(x => x.NewLabel, m => m.MapFrom(x => x.NewLabel))
            //    .ForMember(x => x.CreatedAt, m => m.MapFrom(x => x.CreatedAt));

            //CreateMap<CreateFeedbackInput, Feedback>()
            //    .ForMember(x => x.Ticket, m => m.MapFrom(x => x.Ticket));

            CreateMap<Feedback, CreateFeedbackInput>()
                .ForMember(dest => dest.TicketId, opt => opt.MapFrom(src => src.TicketId));

            CreateMap<CreateFeedbackInput, Feedback>()
                .ForMember(dest => dest.TicketId, opt => opt.MapFrom(src => src.TicketId));

        }
    }
}