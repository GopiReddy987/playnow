using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class Match
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public int TurfId { get; set; }

        public int? Team1Id { get; set; }
        public int? Team2Id { get; set; }

        [Required]
        public DateTime MatchDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Scheduled"; // Scheduled, In Progress, Completed, Cancelled

        [MaxLength(20)]
        public string? Result { get; set; } // Team1 Won, Team2 Won, Draw

        public int? Team1Score { get; set; }
        public int? Team2Score { get; set; }

        public decimal EntryFee { get; set; }

        public int MaxPlayers { get; set; }

        public int CurrentPlayers { get; set; }

        public bool IsPublic { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Turf Turf { get; set; } = null!;
        public virtual Team? Team1 { get; set; }
        public virtual Team? Team2 { get; set; }
        public virtual ICollection<MatchParticipant> Participants { get; set; } = new List<MatchParticipant>();
    }
} 