namespace TriviaApi.Models;

public class GameSession
{
    public int Id { get; set; }
    public string GameCode { get; set; } = string.Empty;
    public string HostConnectionId { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public GameStatus Status { get; set; } = GameStatus.Lobby;
    public int CurrentQuestionIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<PlayerScore> PlayerScores { get; set; } = new();
}

public enum GameStatus
{
    Lobby,
    InProgress,
    ShowingResults,
    Finished
}
