using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace Kairos.EmailTriage.EntityFrameworkCore
{
    public static class EmailTriageDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<EmailTriageDbContext> builder, string connectionString)
        {
            builder.UseSqlServer(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<EmailTriageDbContext> builder, DbConnection connection)
        {
            builder.UseSqlServer(connection);
        }
    }
}
