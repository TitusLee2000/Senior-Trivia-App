namespace TriviaApi.DTOs;

public record QuizSummaryDto(int Id, string Title, string Description, int QuestionCount);

public record PlayChoiceDto(int Slot, string Text);

public record PlayQuestionDto(int Id, string Text, string? MediaUrl, string? MediaType, IReadOnlyList<PlayChoiceDto> Choices);

public record PlayQuizDto(int Id, string Title, string Description, IReadOnlyList<PlayQuestionDto> Questions);

public record AdminQuestionDto(
    int Id,
    string Text,
    string? MediaUrl,
    string? MediaType,
    string? Option1,
    string? Option2,
    string? Option3,
    string? Option4,
    int CorrectAnswerIndex);

public record AdminQuizDetailDto(int Id, string Title, string Description, IReadOnlyList<AdminQuestionDto> Questions);

public record QuizWriteDto(string Title, string Description);

public record QuestionWriteDto(
    string Text,
    string? MediaUrl,
    string? MediaType,
    string? Option1,
    string? Option2,
    string? Option3,
    string? Option4,
    int CorrectAnswerIndex);

/// <param name="SelectedSlot">0–3 matching Option1–Option4.</param>
public record AnswerRequest(int SelectedSlot);

public record AnswerResponse(bool Correct);
