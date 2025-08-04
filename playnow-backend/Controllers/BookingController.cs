using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayNow.API.DTOs;
using PlayNow.API.Services;
using System.Security.Claims;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<ActionResult<BookingResponse>> CreateBooking(CreateBookingRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var response = await _bookingService.CreateBookingAsync(request, userId);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{bookingId}")]
        public async Task<ActionResult<BookingResponse>> GetBooking(int bookingId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var response = await _bookingService.GetBookingAsync(bookingId, userId);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-bookings")]
        public async Task<ActionResult<List<BookingResponse>>> GetMyBookings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var bookings = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(bookings);
        }

        [HttpPost("{bookingId}/cancel")]
        public async Task<ActionResult> CancelBooking(int bookingId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                await _bookingService.CancelBookingAsync(bookingId, userId);
                return Ok(new { message = "Booking cancelled successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("turfs")]
        [AllowAnonymous]
        public async Task<ActionResult<List<TurfResponse>>> GetAvailableTurfs(
            [FromQuery] string? sportType = null,
            [FromQuery] string? city = null)
        {
            var turfs = await _bookingService.GetAvailableTurfsAsync(sportType, city);
            return Ok(turfs);
        }
    }
} 