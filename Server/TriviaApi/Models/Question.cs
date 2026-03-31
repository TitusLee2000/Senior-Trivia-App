namespace TriviaApi.Models;
public class Question
{
    // Primary key 
    public int Id { get; set; }
    // Foreign key
    public int QuizId { get; set; }
    public string Text { get; set; }

    public string? MediaUrl { get; set; }
    // Image, video, or audio
    public string? MediaType { get; set; }

    public string? Option1 { get; set; }
    public string? Option2 { get; set; }
    public string? Option3 { get; set; }
    public string? Option4 { get; set; }
    public int CorrectAnswereIndex { get; set; }
}