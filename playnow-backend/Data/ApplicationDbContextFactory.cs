using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PlayNow.API.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // Use SQL Server LocalDB for design-time
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=PlayNowDB;Trusted_Connection=true;MultipleActiveResultSets=true");
            
            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
} 