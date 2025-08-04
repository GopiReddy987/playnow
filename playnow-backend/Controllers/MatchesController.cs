using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Allow anonymous access to prevent authentication redirects
    public class MatchesController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetMatches()
        {
            // Mock data for now
            var matches = new List<object>
            {
                new {
                    id = 1,
                    title = "Weekend Football 5v5",
                    sport = "Football",
                    date = "2024-07-06",
                    time = "17:00",
                    duration = "2 hours",
                    maxPlayers = 10,
                    pricePerPlayer = 200,
                    skillLevel = "Any",
                    turf = new { name = "Elite Turf", location = "City Center" },
                    host = new { name = "John Doe", rating = 4.8 },
                    playersJoined = 6,
                    status = "Open",
                    description = "Friendly weekend match. All skill levels welcome."
                },
                new {
                    id = 2,
                    title = "Morning Cricket",
                    sport = "Cricket",
                    date = "2024-07-07",
                    time = "08:00",
                    duration = "3 hours",
                    maxPlayers = 22,
                    pricePerPlayer = 150,
                    skillLevel = "Intermediate",
                    turf = new { name = "Sunrise Ground", location = "North Park" },
                    host = new { name = "Jane Smith", rating = 4.5 },
                    playersJoined = 14,
                    status = "Open",
                    description = "Intermediate level cricket match."
                }
            };
            return Ok(matches);
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "CORS test successful", timestamp = DateTime.UtcNow });
        }

        [HttpPost("{id}/join")]
        public IActionResult JoinMatch(int id)
        {
            // TODO: Implement join logic (add user to match, check capacity, etc.)
            return Ok(new { message = $"Joined match {id}" });
        }
    }
} 