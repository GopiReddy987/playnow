using Microsoft.EntityFrameworkCore;
using PlayNow.API.Data;
using PlayNow.API.DTOs;
using PlayNow.API.Models;

namespace PlayNow.API.Services
{
    public interface ITurfService
    {
        Task<List<TurfDetailResponse>> GetAllTurfsAsync();
        Task<TurfDetailResponse> GetTurfByIdAsync(int id);
        Task<TurfDetailResponse> CreateTurfAsync(CreateTurfRequest request);
        Task<TurfDetailResponse> UpdateTurfAsync(int id, UpdateTurfRequest request);
        Task<bool> DeleteTurfAsync(int id);
        Task<List<TurfDetailResponse>> GetTurfsBySportTypeAsync(string sportType);
        Task<List<TurfDetailResponse>> GetTurfsByCityAsync(string city);
    }

    public class TurfService : ITurfService
    {
        private readonly ApplicationDbContext _context;

        public TurfService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TurfDetailResponse>> GetAllTurfsAsync()
        {
            var turfs = await _context.Turfs
                .Include(t => t.TurfAmenities)
                .Include(t => t.TurfTimings)
                .OrderBy(t => t.Name)
                .ToListAsync();

            return turfs.Select(MapToTurfDetailResponse).ToList();
        }

        public async Task<TurfDetailResponse> GetTurfByIdAsync(int id)
        {
            var turf = await _context.Turfs
                .Include(t => t.TurfAmenities)
                .Include(t => t.TurfTimings)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (turf == null)
            {
                throw new InvalidOperationException("Turf not found.");
            }

            return MapToTurfDetailResponse(turf);
        }

        public async Task<TurfDetailResponse> CreateTurfAsync(CreateTurfRequest request)
        {
            var turf = new Turf
            {
                Name = request.Name,
                Description = request.Description,
                Address = request.Address,
                City = request.City,
                PostalCode = request.PostalCode,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                SportType = request.SportType,
                Capacity = request.Capacity,
                PricePerHour = request.PricePerHour,
                ImageUrl = request.ImageUrl,
                IsAvailable = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Turfs.Add(turf);
            await _context.SaveChangesAsync();

            // Add timings
            if (request.Timings.Any())
            {
                var timings = request.Timings.Select(t => new TurfTiming
                {
                    TurfId = turf.Id,
                    DayOfWeek = t.DayOfWeek,
                    StartTime = t.StartTime,
                    EndTime = t.EndTime,
                    PricePerHour = t.PricePerHour,
                    IsAvailable = t.IsAvailable,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                _context.TurfTimings.AddRange(timings);
            }

            // Add amenities
            if (request.Amenities.Any())
            {
                var amenities = request.Amenities.Select(a => new TurfAmenity
                {
                    TurfId = turf.Id,
                    Name = a.Name,
                    Description = a.Description,
                    IsAvailable = a.IsAvailable,
                    AdditionalCost = a.AdditionalCost
                }).ToList();

                _context.TurfAmenities.AddRange(amenities);
            }

            await _context.SaveChangesAsync();

            return await GetTurfByIdAsync(turf.Id);
        }

        public async Task<TurfDetailResponse> UpdateTurfAsync(int id, UpdateTurfRequest request)
        {
            var turf = await _context.Turfs
                .Include(t => t.TurfAmenities)
                .Include(t => t.TurfTimings)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (turf == null)
            {
                throw new InvalidOperationException("Turf not found.");
            }

            // Update turf properties
            turf.Name = request.Name;
            turf.Description = request.Description;
            turf.Address = request.Address;
            turf.City = request.City;
            turf.PostalCode = request.PostalCode;
            turf.Latitude = request.Latitude;
            turf.Longitude = request.Longitude;
            turf.SportType = request.SportType;
            turf.Capacity = request.Capacity;
            turf.PricePerHour = request.PricePerHour;
            turf.ImageUrl = request.ImageUrl;
            turf.IsAvailable = request.IsAvailable;
            turf.IsActive = request.IsActive;
            turf.UpdatedAt = DateTime.UtcNow;

            // Update timings
            _context.TurfTimings.RemoveRange(turf.TurfTimings);
            if (request.Timings.Any())
            {
                var timings = request.Timings.Select(t => new TurfTiming
                {
                    TurfId = turf.Id,
                    DayOfWeek = t.DayOfWeek,
                    StartTime = t.StartTime,
                    EndTime = t.EndTime,
                    PricePerHour = t.PricePerHour,
                    IsAvailable = t.IsAvailable,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }).ToList();

                _context.TurfTimings.AddRange(timings);
            }

            // Update amenities
            _context.TurfAmenities.RemoveRange(turf.TurfAmenities);
            if (request.Amenities.Any())
            {
                var amenities = request.Amenities.Select(a => new TurfAmenity
                {
                    TurfId = turf.Id,
                    Name = a.Name,
                    Description = a.Description,
                    IsAvailable = a.IsAvailable,
                    AdditionalCost = a.AdditionalCost
                }).ToList();

                _context.TurfAmenities.AddRange(amenities);
            }

            await _context.SaveChangesAsync();

            return await GetTurfByIdAsync(turf.Id);
        }

        public async Task<bool> DeleteTurfAsync(int id)
        {
            var turf = await _context.Turfs.FindAsync(id);
            if (turf == null)
            {
                return false;
            }

            _context.Turfs.Remove(turf);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TurfDetailResponse>> GetTurfsBySportTypeAsync(string sportType)
        {
            var turfs = await _context.Turfs
                .Include(t => t.TurfAmenities)
                .Include(t => t.TurfTimings)
                .Where(t => t.SportType == sportType && t.IsActive)
                .OrderBy(t => t.Name)
                .ToListAsync();

            return turfs.Select(MapToTurfDetailResponse).ToList();
        }

        public async Task<List<TurfDetailResponse>> GetTurfsByCityAsync(string city)
        {
            var turfs = await _context.Turfs
                .Include(t => t.TurfAmenities)
                .Include(t => t.TurfTimings)
                .Where(t => t.City == city && t.IsActive)
                .OrderBy(t => t.Name)
                .ToListAsync();

            return turfs.Select(MapToTurfDetailResponse).ToList();
        }

        private static TurfDetailResponse MapToTurfDetailResponse(Turf turf)
        {
            return new TurfDetailResponse
            {
                Id = turf.Id,
                Name = turf.Name,
                Description = turf.Description,
                Address = turf.Address,
                City = turf.City,
                PostalCode = turf.PostalCode,
                Latitude = turf.Latitude,
                Longitude = turf.Longitude,
                SportType = turf.SportType,
                Capacity = turf.Capacity,
                PricePerHour = turf.PricePerHour,
                ImageUrl = turf.ImageUrl,
                IsAvailable = turf.IsAvailable,
                IsActive = turf.IsActive,
                CreatedAt = turf.CreatedAt,
                UpdatedAt = turf.UpdatedAt,
                Timings = turf.TurfTimings?.Select(t => new TurfTimingResponse
                {
                    Id = t.Id,
                    DayOfWeek = t.DayOfWeek,
                    StartTime = t.StartTime,
                    EndTime = t.EndTime,
                    PricePerHour = t.PricePerHour,
                    IsAvailable = t.IsAvailable
                }).ToList() ?? new List<TurfTimingResponse>(),
                Amenities = turf.TurfAmenities?.Select(a => new TurfAmenityResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Description = a.Description,
                    IsAvailable = a.IsAvailable,
                    AdditionalCost = a.AdditionalCost
                }).ToList() ?? new List<TurfAmenityResponse>()
            };
        }
    }
} 