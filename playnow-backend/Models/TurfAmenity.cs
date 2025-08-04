using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class TurfAmenity
    {
        public int Id { get; set; }

        [Required]
        public int TurfId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        public decimal? AdditionalCost { get; set; }

        // Navigation properties
        public virtual Turf Turf { get; set; } = null!;
    }
} 