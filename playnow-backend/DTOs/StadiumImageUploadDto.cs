using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace PlayNow.API.DTOs
{
    public class StadiumImageUploadDto
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        [MaxLength(50)]
        public string Sport { get; set; } = string.Empty;

        [Required]
        public IFormFile Image { get; set; } = null!;
    }
} 