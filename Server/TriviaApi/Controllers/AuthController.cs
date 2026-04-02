using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TriviaApi.Data;
using TriviaApi.DTOs;
using TriviaApi.Models;
using TriviaApi.Services;

namespace TriviaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(UserManager<ApplicationUser> userManager, JwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and password are required.");

        var existing = await userManager.FindByEmailAsync(request.Email.Trim());
        if (existing is not null)
            return Conflict("An account with this email already exists.");

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        await userManager.AddToRoleAsync(user, DbSeeder.RolePlayer);

        var token = await jwtTokenService.CreateTokenAsync(user, userManager);
        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AuthResponse(token, user.Email!, roles.ToList()));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and password are required.");

        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            return Unauthorized();

        var token = await jwtTokenService.CreateTokenAsync(user, userManager);
        var roles = await userManager.GetRolesAsync(user);
        return Ok(new AuthResponse(token, user.Email!, roles.ToList()));
    }
}
