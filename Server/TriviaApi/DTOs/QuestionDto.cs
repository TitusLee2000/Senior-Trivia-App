namespace TriviaApi.DTOs;

public record QuestionDto(
    int Id,
    int CategoryId,
    string Text,
    string? MediaUrl,
    string? MediaType,
    string Option1,
    string Option2,
    string Option3,
    string Option4,
    int CorrectAnswerIndex
);

public record CreateQuestionDto(
    int CategoryId,
    string Text,
    string? MediaUrl,
    string? MediaType,
    string Option1,
    string Option2,
    string Option3,
    string Option4,
    int CorrectAnswerIndex
);
