namespace TriviaApi.DTOs;

public record CategoryDto(int Id, string Name, string Description, int QuestionCount);
public record CreateCategoryDto(string Name, string Description);
