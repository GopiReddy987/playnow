using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PlayNow.API.Models;
using PlayNow.API.Services;
using PlayNow.API.DTOs;
using System.Security.Claims;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IRoleService _roleService;

        public AdminController(UserManager<ApplicationUser> userManager, IRoleService roleService)
        {
            _userManager = userManager;
            _roleService = roleService;
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    ProfilePictureUrl = user.ProfilePictureUrl,
                    DateOfBirth = user.DateOfBirth,
                    Address = user.Address,
                    Roles = roles.ToList()
                });
            }

            return Ok(userDtos);
        }

        [HttpGet("users/{userId}/roles")]
        public async Task<ActionResult<List<string>>> GetUserRoles(string userId)
        {
            var roles = await _roleService.GetUserRolesAsync(userId);
            return Ok(roles);
        }

        [HttpPost("users/{userId}/roles")]
        public async Task<ActionResult> AssignRoleToUser(string userId, [FromBody] AssignRoleRequest request)
        {
            var result = await _roleService.AssignRoleToUserAsync(userId, request.RoleName);
            if (result)
            {
                return Ok(new { message = $"Role {request.RoleName} assigned to user successfully." });
            }
            return BadRequest(new { message = "Failed to assign role to user." });
        }

        [HttpDelete("users/{userId}/roles/{roleName}")]
        public async Task<ActionResult> RemoveRoleFromUser(string userId, string roleName)
        {
            var result = await _roleService.RemoveRoleFromUserAsync(userId, roleName);
            if (result)
            {
                return Ok(new { message = $"Role {roleName} removed from user successfully." });
            }
            return BadRequest(new { message = "Failed to remove role from user." });
        }

        [HttpPost("users/{userId}/activate")]
        public async Task<ActionResult> ActivateUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.IsActive = true;
            var result = await _userManager.UpdateAsync(user);
            
            if (result.Succeeded)
            {
                return Ok(new { message = "User activated successfully." });
            }
            return BadRequest(new { message = "Failed to activate user." });
        }

        [HttpPost("users/{userId}/deactivate")]
        public async Task<ActionResult> DeactivateUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);
            
            if (result.Succeeded)
            {
                return Ok(new { message = "User deactivated successfully." });
            }
            return BadRequest(new { message = "Failed to deactivate user." });
        }

        [HttpGet("stats")]
        public async Task<ActionResult<AdminStatsDto>> GetAdminStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var activeUsers = await _userManager.Users.CountAsync(u => u.IsActive);
            var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
            var managerUsers = await _userManager.GetUsersInRoleAsync("Manager");

            return Ok(new AdminStatsDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                AdminUsers = adminUsers.Count,
                ManagerUsers = managerUsers.Count,
                InactiveUsers = totalUsers - activeUsers
            });
        }
    }

    public class AssignRoleRequest
    {
        public string RoleName { get; set; } = string.Empty;
    }

    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int AdminUsers { get; set; }
        public int ManagerUsers { get; set; }
        public int InactiveUsers { get; set; }
    }
} 