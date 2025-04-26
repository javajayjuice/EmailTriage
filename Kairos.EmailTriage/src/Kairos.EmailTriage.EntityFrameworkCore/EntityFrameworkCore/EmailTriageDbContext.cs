using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using Kairos.EmailTriage.Authorization.Roles;
using Kairos.EmailTriage.Authorization.Users;
using Kairos.EmailTriage.MultiTenancy;
using Kairos.EmailTriage.Domain;

namespace Kairos.EmailTriage.EntityFrameworkCore
{
    public class EmailTriageDbContext : AbpZeroDbContext<Tenant, Role, Authorization.Users.User, EmailTriageDbContext>
    {
        /* Define a DbSet for each entity of the application */
        public DbSet<Ticket> Tickets { get; set; }
        //public DbSet<CustomUser> Users { get; set; }
        public DbSet<Label> Labels { get; set; }
        public DbSet<TrainingData> TrainingData { get; set; }
        public DbSet<AutomationConfig> AutomationConfigs { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }


        public EmailTriageDbContext(DbContextOptions<EmailTriageDbContext> options)
            : base(options)
        {
        }
    }
}
