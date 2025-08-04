using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.DTOs
{
    public class CreateTurfRequest
    {
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
        public string SportType { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public decimal PricePerHour { get; set; }

        public string? ImageUrl { get; set; }

        public List<TurfTimingRequest> Timings { get; set; } = new();
        public List<TurfAmenityRequest> Amenities { get; set; } = new();
    }

    public class UpdateTurfRequest
    {
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
        public string SportType { get; set; } = string.Empty;

        public int Capacity { get; set; }

        public decimal PricePerHour { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; } = true;

        public bool IsActive { get; set; } = true;

        public List<TurfTimingRequest> Timings { get; set; } = new();
        public List<TurfAmenityRequest> Amenities { get; set; } = new();
    }

    public class TurfTimingRequest
    {
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public decimal PricePerHour { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public class TurfAmenityRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsAvailable { get; set; } = true;

        public decimal? AdditionalCost { get; set; }
    }

    public class TurfDetailResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string SportType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal PricePerHour { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<TurfTimingResponse> Timings { get; set; } = new();
        public List<TurfAmenityResponse> Amenities { get; set; } = new();
    }

    public class TurfTimingResponse
    {
        public int Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public decimal PricePerHour { get; set; }
        public bool IsAvailable { get; set; }
    }

    public class TurfAmenityResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsAvailable { get; set; }
        public decimal? AdditionalCost { get; set; }
    }
} 