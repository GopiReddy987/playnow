using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class TurfTiming
    {
        public int Id { get; set; }

        [Required]
        public int TurfId { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        public decimal PricePerHour { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Turf Turf { get; set; } = null!;
    }
} 