using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayerRequestsController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetPlayerRequests()
        {
            // Mock data for now
            var requests = new List<object>
            {
                new {
                    id = 1,
                    teamName = "City Strikers",
                    sport = "Football",
                    turf = "Elite Turf",
                    date = "2024-07-06",
                    requestedPlayers = 2,
                    description = "Looking for 2 more players for 5v5 match."
                },
                new {
                    id = 2,
                    teamName = "Morning Warriors",
                    sport = "Cricket",
                    turf = "Sunrise Ground",
                    date = "2024-07-07",
                    requestedPlayers = 4,
                    description = "Need 4 players for morning cricket."
                }
            };
            return Ok(requests);
        }
    }
} 