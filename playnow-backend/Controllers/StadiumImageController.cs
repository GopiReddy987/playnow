using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PlayNow.API.Data;
using PlayNow.API.Models;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using PlayNow.API.DTOs;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StadiumImageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _env;

        public StadiumImageController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IWebHostEnvironment env)
        {
            _context = context;
            _userManager = userManager;
            _env = env;
        }

        // POST: api/stadiumimage/upload
        [HttpPost("upload")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Upload([FromForm] StadiumImageUploadDto dto)
        {
            if (dto.Image == null || dto.Image.Length == 0)
                return BadRequest("No image uploaded.");

            var allowedSports = new[] { "Football", "Cricket", "Basketball", "Badminton" };
            if (!allowedSports.Contains(dto.Sport))
                return BadRequest("Invalid sport type.");

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var stadiumImage = new StadiumImage
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Sport = dto.Sport,
                ImageUrl = $"/uploads/{fileName}",
                UploaderId = userId,
                UploadDate = DateTime.UtcNow
            };
            _context.StadiumImages.Add(stadiumImage);
            await _context.SaveChangesAsync();
            return Ok(stadiumImage);
        }

        // GET: api/stadiumimage
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var images = await _context.StadiumImages.ToListAsync();
            return Ok(images);
        }

        // GET: api/stadiumimage/admin
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByAdmin()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var images = await _context.StadiumImages.Where(i => i.UploaderId == userId).ToListAsync();
            return Ok(images);
        }
    }
} 