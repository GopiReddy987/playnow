using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class MatchParticipant
    {
        public int Id { get; set; }

        [Required]
        public int MatchId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Registered"; // Registered, Confirmed, Cancelled

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        public DateTime? ConfirmedAt { get; set; }

        public bool HasPaid { get; set; } = false;

        // Navigation properties
        public virtual Match Match { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
    }
} 