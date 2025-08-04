using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayNow.API.DTOs;
using PlayNow.API.Services;
using System.Security.Claims;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TurfController : ControllerBase
    {
        private readonly ITurfService _turfService;

        public TurfController(ITurfService turfService)
        {
            _turfService = turfService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TurfDetailResponse>>> GetAllTurfs()
        {
            try
            {
                var turfs = await _turfService.GetAllTurfsAsync();
                return Ok(turfs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving turfs.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<TurfDetailResponse>> GetTurfById(int id)
        {
            try
            {
                var turf = await _turfService.GetTurfByIdAsync(id);
                return Ok(turf);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the turf.", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TurfDetailResponse>> CreateTurf(CreateTurfRequest request)
        {
            try
            {
                var turf = await _turfService.CreateTurfAsync(request);
                return CreatedAtAction(nameof(GetTurfById), new { id = turf.Id }, turf);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the turf.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TurfDetailResponse>> UpdateTurf(int id, UpdateTurfRequest request)
        {
            try
            {
                var turf = await _turfService.UpdateTurfAsync(id, request);
                return Ok(turf);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the turf.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteTurf(int id)
        {
            try
            {
                var result = await _turfService.DeleteTurfAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Turf not found." });
                }

                return Ok(new { message = "Turf deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the turf.", error = ex.Message });
            }
        }

        [HttpGet("sport/{sportType}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<TurfDetailResponse>>> GetTurfsBySportType(string sportType)
        {
            try
            {
                var turfs = await _turfService.GetTurfsBySportTypeAsync(sportType);
                return Ok(turfs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving turfs.", error = ex.Message });
            }
        }

        [HttpGet("city/{city}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<TurfDetailResponse>>> GetTurfsByCity(string city)
        {
            try
            {
                var turfs = await _turfService.GetTurfsByCityAsync(city);
                return Ok(turfs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving turfs.", error = ex.Message });
            }
        }
    }
} 