using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class Payment
    {
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty; // Credit Card, Debit Card, UPI, etc.

        [Required]
        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Success, Failed, Refunded

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Booking Booking { get; set; } = null!;
    }
} 