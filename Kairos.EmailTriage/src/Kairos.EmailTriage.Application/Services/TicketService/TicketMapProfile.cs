using AutoMapper;
using Kairos.EmailTriage.Authorization.Users;
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
    /// Provides mapping configurations for Ticket and CreateTicketInput objects.
    /// </summary>
    public class TicketMapProfile : Profile
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TicketMapProfile"/> class.
        /// Configures mappings between <see cref="Ticket"/> and <see cref="CreateTicketInput"/>.
        /// </summary>
        public TicketMapProfile()
        {
            CreateMap<Ticket, CreateTicketInput>()
                .ForMember(a => a.Subject, b => b.MapFrom(c => c.Subject))
                .ForMember(a => a.Body, b => b.MapFrom(c => c.Body))
                .ForMember(a => a.CleanedBody, b => b.MapFrom(c => c.CleanedBody))
                .ForMember(a => a.LabelId, b => b.MapFrom(c => c.LabelId))
                .ForMember(a => a.ConfidenceScore, b => b.MapFrom(c => c.ConfidenceScore))
                .ForMember(a => a.IsFAQ, b => b.MapFrom(c => c.IsFAQ))
                .ForMember(a => a.Answer, b => b.MapFrom(c => c.Answer));

            CreateMap<CreateTicketInput, Ticket>()
                .ForMember(x => x.Subject, m => m.MapFrom(x => x.Subject))
                .ForMember(x => x.Body, m => m.MapFrom(x => x.Body))
                .ForMember(x => x.CleanedBody, m => m.MapFrom(x => x.CleanedBody))
                .ForMember(x => x.LabelId, m => m.MapFrom(x => x.LabelId))
                .ForMember(x => x.ConfidenceScore, m => m.MapFrom(x => x.ConfidenceScore))
                .ForMember(x => x.IsFAQ, m => m.MapFrom(x => x.IsFAQ))
                .ForMember(x => x.Answer, m => m.MapFrom(x => x.Answer));
        }
    }
}
