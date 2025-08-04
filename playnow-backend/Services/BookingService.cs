using Microsoft.EntityFrameworkCore;
using PlayNow.API.Data;
using PlayNow.API.DTOs;
using PlayNow.API.Models;

namespace PlayNow.API.Services
{
    public interface IBookingService
    {
        Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, string userId);
        Task<BookingResponse> GetBookingAsync(int bookingId, string userId);
        Task<List<BookingResponse>> GetUserBookingsAsync(string userId);
        Task<bool> CancelBookingAsync(int bookingId, string userId);
        Task<List<TurfResponse>> GetAvailableTurfsAsync(string? sportType = null, string? city = null);
    }

    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;

        public BookingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<BookingResponse> CreateBookingAsync(CreateBookingRequest request, string userId)
        {
            // Check if turf exists and is available
            var turf = await _context.Turfs
                .FirstOrDefaultAsync(t => t.Id == request.TurfId && t.IsAvailable && t.IsActive);

            if (turf == null)
            {
                throw new InvalidOperationException("Turf not found or not available.");
            }

            // Check for booking conflicts
            var conflictingBooking = await _context.Bookings
                .AnyAsync(b => b.TurfId == request.TurfId &&
                              b.BookingDate == request.BookingDate &&
                              b.Status != "Cancelled" &&
                              ((b.StartTime <= request.StartTime && b.EndTime > request.StartTime) ||
                               (b.StartTime < request.EndTime && b.EndTime >= request.EndTime) ||
                               (b.StartTime >= request.StartTime && b.EndTime <= request.EndTime)));

            if (conflictingBooking)
            {
                throw new InvalidOperationException("Selected time slot is already booked.");
            }

            // Calculate duration and total amount
            var duration = request.EndTime - request.StartTime;
            var durationHours = (int)Math.Ceiling(duration.TotalHours);
            var totalAmount = turf.PricePerHour * durationHours;

            var booking = new Booking
            {
                UserId = userId,
                TurfId = request.TurfId,
                BookingDate = request.BookingDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                DurationHours = durationHours,
                TotalAmount = totalAmount,
                Status = "Pending",
                SpecialRequests = request.SpecialRequests
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return await GetBookingAsync(booking.Id, userId);
        }

        public async Task<BookingResponse> GetBookingAsync(int bookingId, string userId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Turf)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found.");
            }

            return new BookingResponse
            {
                Id = booking.Id,
                TurfId = booking.TurfId,
                TurfName = booking.Turf.Name,
                BookingDate = booking.BookingDate,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                DurationHours = booking.DurationHours,
                TotalAmount = booking.TotalAmount,
                Status = booking.Status,
                SpecialRequests = booking.SpecialRequests,
                CreatedAt = booking.CreatedAt,
                Payment = booking.Payment != null ? new PaymentResponse
                {
                    Id = booking.Payment.Id,
                    PaymentMethod = booking.Payment.PaymentMethod,
                    TransactionId = booking.Payment.TransactionId,
                    Amount = booking.Payment.Amount,
                    Status = booking.Payment.Status,
                    PaymentDate = booking.Payment.PaymentDate
                } : null
            };
        }

        public async Task<List<BookingResponse>> GetUserBookingsAsync(string userId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Turf)
                .Include(b => b.Payment)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return bookings.Select(b => new BookingResponse
            {
                Id = b.Id,
                TurfId = b.TurfId,
                TurfName = b.Turf.Name,
                BookingDate = b.BookingDate,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                DurationHours = b.DurationHours,
                TotalAmount = b.TotalAmount,
                Status = b.Status,
                SpecialRequests = b.SpecialRequests,
                CreatedAt = b.CreatedAt,
                Payment = b.Payment != null ? new PaymentResponse
                {
                    Id = b.Payment.Id,
                    PaymentMethod = b.Payment.PaymentMethod,
                    TransactionId = b.Payment.TransactionId,
                    Amount = b.Payment.Amount,
                    Status = b.Payment.Status,
                    PaymentDate = b.Payment.PaymentDate
                } : null
            }).ToList();
        }

        public async Task<bool> CancelBookingAsync(int bookingId, string userId)
        {
            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

            if (booking == null)
            {
                throw new InvalidOperationException("Booking not found.");
            }

            if (booking.Status == "Cancelled")
            {
                throw new InvalidOperationException("Booking is already cancelled.");
            }

            if (booking.Status == "Completed")
            {
                throw new InvalidOperationException("Cannot cancel completed booking.");
            }

            booking.Status = "Cancelled";
            booking.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TurfResponse>> GetAvailableTurfsAsync(string? sportType = null, string? city = null)
        {
            var query = _context.Turfs
                .Include(t => t.TurfAmenities)
                .Where(t => t.IsAvailable && t.IsActive);

            if (!string.IsNullOrEmpty(sportType))
            {
                query = query.Where(t => t.SportType == sportType);
            }

            if (!string.IsNullOrEmpty(city))
            {
                query = query.Where(t => t.City == city);
            }

            var turfs = await query.ToListAsync();

            return turfs.Select(t => new TurfResponse
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                Address = t.Address,
                City = t.City,
                SportType = t.SportType,
                Capacity = t.Capacity,
                PricePerHour = t.PricePerHour,
                ImageUrl = t.ImageUrl,
                IsAvailable = t.IsAvailable,
                Amenities = t.TurfAmenities.Select(ta => ta.Name).ToList()
            }).ToList();
        }
    }
} 