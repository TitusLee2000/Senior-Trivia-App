namespace TriviaApi.Models;
public class Question
{
    // Primary key 
    public int Id { get; set; }
    // Foreign key
    public int QuizId { get; set; }
    public string Text { get; set; } = string.Empty;

    public string? MediaUrl { get; set; }
    // Image, video, or audio
    public string? MediaType { get; set; }

    public string? Option1 { get; set; }
    public string? Option2 { get; set; }
    public string? Option3 { get; set; }
    public string? Option4 { get; set; }
    /// <summary>0-based index into the non-empty options list (Option1..Option4).</summary>
    public int CorrectAnswerIndex { get; set; }
}