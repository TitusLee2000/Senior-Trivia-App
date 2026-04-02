namespace TriviaApi.DTOs;

public record RegisterDto(string Email, string Password, string DisplayName);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Email, string Role);
