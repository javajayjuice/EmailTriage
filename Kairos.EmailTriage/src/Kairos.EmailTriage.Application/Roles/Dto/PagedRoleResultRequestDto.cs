using Abp.Application.Services.Dto;

namespace Kairos.EmailTriage.Roles.Dto
{
    public class PagedRoleResultRequestDto : PagedResultRequestDto
    {
        public string Keyword { get; set; }
    }
}

