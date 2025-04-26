using System.ComponentModel.DataAnnotations;

namespace Kairos.EmailTriage.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}