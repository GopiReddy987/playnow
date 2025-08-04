using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class TeamMember
    {
        public int Id { get; set; }

        [Required]
        public int TeamId { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Player"; // Captain, Player, Coach, etc.

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Team Team { get; set; } = null!;
        public virtual ApplicationUser User { get; set; } = null!;
    }
} 