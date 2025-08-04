using Microsoft.AspNetCore.Mvc;
using PlayNow.API.DTOs;
using PlayNow.API.Services;

namespace PlayNow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly OtpService _otpService;

        public AuthController(IAuthService authService, OtpService otpService)
        {
            _authService = authService;
            _otpService = otpService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var response = await _authService.RefreshTokenAsync(request.RefreshToken);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("revoke-token")]
        public async Task<ActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            var result = await _authService.RevokeTokenAsync(request.RefreshToken);
            if (!result)
            {
                return BadRequest(new { message = "Invalid refresh token." });
            }

            return Ok(new { message = "Token revoked successfully." });
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] string phone)
        {
            var otp = new Random().Next(100000, 999999).ToString();
            HttpContext.Session.SetString(phone, otp); // Or use Redis/DB for production
            await _otpService.SendOtp(phone, otp);
            return Ok("OTP sent");
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] OtpModel model)
        {
            var storedOtp = HttpContext.Session.GetString(model.Phone);
            if (storedOtp == model.Otp)
            {
                // Success, generate JWT or session
                return Ok("OTP verified");
            }
            return BadRequest("Invalid OTP");
        }

        public class RefreshTokenRequest
        {
            public string RefreshToken { get; set; } = string.Empty;
        }

        public class OtpModel
        {
            public string Phone { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
        }
    }
} 