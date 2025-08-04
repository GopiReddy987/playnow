using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class Turf
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string PostalCode { get; set; } = string.Empty;

        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }

        [Required]
        [MaxLength(50)]
        public string SportType { get; set; } = string.Empty; // Football, Cricket, Tennis, etc.

        public int Capacity { get; set; }

        public decimal PricePerHour { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; } = true;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<TurfAmenity> TurfAmenities { get; set; } = new List<TurfAmenity>();
        public virtual ICollection<TurfTiming> TurfTimings { get; set; } = new List<TurfTiming>();
    }
} 