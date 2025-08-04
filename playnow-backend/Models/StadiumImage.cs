using System;
using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.Models
{
    public class StadiumImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(50)]
        public string Sport { get; set; } = string.Empty; // Football, Cricket, Basketball, Badminton

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        public string UploaderId { get; set; } = string.Empty;

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    }
} 