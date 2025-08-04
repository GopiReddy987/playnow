using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PlayNow.API.Models;

namespace PlayNow.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Turf> Turfs { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<MatchParticipant> MatchParticipants { get; set; }
        public DbSet<TurfAmenity> TurfAmenities { get; set; }
        public DbSet<TurfTiming> TurfTimings { get; set; }
        public DbSet<StadiumImage> StadiumImages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships and constraints
            builder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Booking>()
                .HasOne(b => b.Turf)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TurfId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithOne(b => b.Payment)
                .HasForeignKey<Payment>(p => p.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TeamMember>()
                .HasOne(tm => tm.Team)
                .WithMany(t => t.TeamMembers)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TeamMember>()
                .HasOne(tm => tm.User)
                .WithMany()
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Match>()
                .HasOne(m => m.Turf)
                .WithMany()
                .HasForeignKey(m => m.TurfId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Match>()
                .HasOne(m => m.Team1)
                .WithMany()
                .HasForeignKey(m => m.Team1Id)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Match>()
                .HasOne(m => m.Team2)
                .WithMany()
                .HasForeignKey(m => m.Team2Id)
                .OnDelete(DeleteBehavior.NoAction); // 🔥 FIX applied here



            builder.Entity<MatchParticipant>()
                .HasOne(mp => mp.Match)
                .WithMany(m => m.Participants)
                .HasForeignKey(mp => mp.MatchId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MatchParticipant>()
                .HasOne(mp => mp.User)
                .WithMany()
                .HasForeignKey(mp => mp.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TurfAmenity>()
                .HasOne(ta => ta.Turf)
                .WithMany(t => t.TurfAmenities)
                .HasForeignKey(ta => ta.TurfId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<TurfTiming>()
                .HasOne(tt => tt.Turf)
                .WithMany(t => t.TurfTimings)
                .HasForeignKey(tt => tt.TurfId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure indexes
            builder.Entity<Booking>()
                .HasIndex(b => new { b.TurfId, b.BookingDate, b.StartTime });

            builder.Entity<Match>()
                .HasIndex(m => new { m.TurfId, m.MatchDate });

            builder.Entity<MatchParticipant>()
                .HasIndex(mp => new { mp.MatchId, mp.UserId })
                .IsUnique();
        }
    }
} 