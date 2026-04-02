using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TriviaApi.Data;
using TriviaApi.Models;

namespace TriviaApi.Hubs;

public class GameHub : Hub
{
    private readonly AppDbContext _db;

    // In-memory game state (for simplicity; production would use Redis or similar)
    private static readonly Dictionary<string, GameState> Games = new();

    public GameHub(AppDbContext db) => _db = db;

    // Host creates a new game with a category
    public async Task CreateGame(int categoryId)
    {
        var questions = await _db.Questions
            .Where(q => q.CategoryId == categoryId)
            .OrderBy(q => Guid.NewGuid()) // shuffle
            .Take(10)
            .ToListAsync();

        if (questions.Count == 0)
        {
            await Clients.Caller.SendAsync("Error", "No questions found for this category.");
            return;
        }

        var gameCode = GenerateGameCode();
        var state = new GameState
        {
            GameCode = gameCode,
            HostConnectionId = Context.ConnectionId,
            CategoryId = categoryId,
            Questions = questions,
            Status = GameStatus.Lobby
        };

        Games[gameCode] = state;
        await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);
        await Clients.Caller.SendAsync("GameCreated", gameCode);
    }

    // Player joins an existing game
    public async Task JoinGame(string gameCode, string playerName)
    {
        if (!Games.TryGetValue(gameCode, out var state))
        {
            await Clients.Caller.SendAsync("Error", "Game not found.");
            return;
        }

        if (state.Status != GameStatus.Lobby)
        {
            await Clients.Caller.SendAsync("Error", "Game already in progress.");
            return;
        }

        var player = new PlayerInfo
        {
            ConnectionId = Context.ConnectionId,
            Name = playerName,
            Score = 0,
            CorrectAnswers = 0
        };

        state.Players[Context.ConnectionId] = player;
        await Groups.AddToGroupAsync(Context.ConnectionId, gameCode);

        var playerList = state.Players.Values.Select(p => new { p.Name, p.Score }).ToList();
        await Clients.Group(gameCode).SendAsync("PlayerJoined", playerName, playerList);
    }

    // Host starts the game
    public async Task StartGame(string gameCode)
    {
        if (!Games.TryGetValue(gameCode, out var state)) return;
        if (Context.ConnectionId != state.HostConnectionId) return;
        if (state.Players.Count == 0)
        {
            await Clients.Caller.SendAsync("Error", "Need at least one player to start.");
            return;
        }

        state.Status = GameStatus.InProgress;
        state.CurrentQuestionIndex = 0;
        state.AnswersReceived.Clear();

        await Clients.Group(gameCode).SendAsync("GameStarted", state.Questions.Count);
        await SendQuestion(gameCode, state);
    }

    // Player submits an answer
    public async Task SubmitAnswer(string gameCode, int answerIndex)
    {
        if (!Games.TryGetValue(gameCode, out var state)) return;
        if (state.Status != GameStatus.InProgress) return;
        if (state.AnswersReceived.Contains(Context.ConnectionId)) return;

        state.AnswersReceived.Add(Context.ConnectionId);

        var question = state.Questions[state.CurrentQuestionIndex];
        if (answerIndex == question.CorrectAnswerIndex && state.Players.TryGetValue(Context.ConnectionId, out var player))
        {
            // Bonus points for answering quickly (earlier = more points)
            var bonus = Math.Max(0, 100 - (state.AnswersReceived.Count - 1) * 10);
            player.Score += 100 + bonus;
            player.CorrectAnswers++;
        }

        // Notify host of answer count
        await Clients.Client(state.HostConnectionId).SendAsync("AnswerReceived",
            state.AnswersReceived.Count, state.Players.Count);

        // If all players answered, auto-advance
        if (state.AnswersReceived.Count >= state.Players.Count)
        {
            await ShowResults(gameCode);
        }
    }

    // Host manually shows results (or called automatically when all answer)
    public async Task ShowResults(string gameCode)
    {
        if (!Games.TryGetValue(gameCode, out var state)) return;

        var question = state.Questions[state.CurrentQuestionIndex];
        var leaderboard = state.Players.Values
            .OrderByDescending(p => p.Score)
            .Select(p => new { p.Name, p.Score, p.CorrectAnswers })
            .ToList();

        await Clients.Group(gameCode).SendAsync("QuestionResults",
            question.CorrectAnswerIndex, leaderboard);
    }

    // Host advances to next question
    public async Task NextQuestion(string gameCode)
    {
        if (!Games.TryGetValue(gameCode, out var state)) return;
        if (Context.ConnectionId != state.HostConnectionId) return;

        state.CurrentQuestionIndex++;
        state.AnswersReceived.Clear();

        if (state.CurrentQuestionIndex >= state.Questions.Count)
        {
            await EndGame(gameCode, state);
            return;
        }

        await SendQuestion(gameCode, state);
    }

    private async Task SendQuestion(string gameCode, GameState state)
    {
        var q = state.Questions[state.CurrentQuestionIndex];
        await Clients.Group(gameCode).SendAsync("NewQuestion", new
        {
            index = state.CurrentQuestionIndex,
            total = state.Questions.Count,
            text = q.Text,
            options = new[] { q.Option1, q.Option2, q.Option3, q.Option4 },
            mediaUrl = q.MediaUrl,
            mediaType = q.MediaType
        });
    }

    private async Task EndGame(string gameCode, GameState state)
    {
        state.Status = GameStatus.Finished;
        var finalLeaderboard = state.Players.Values
            .OrderByDescending(p => p.Score)
            .Select(p => new { p.Name, p.Score, p.CorrectAnswers })
            .ToList();

        await Clients.Group(gameCode).SendAsync("GameOver", finalLeaderboard);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Clean up: remove player from any active games
        foreach (var (code, state) in Games.ToList())
        {
            if (state.Players.Remove(Context.ConnectionId))
            {
                var playerList = state.Players.Values.Select(p => new { p.Name, p.Score }).ToList();
                await Clients.Group(code).SendAsync("PlayerLeft", playerList);
            }

            // If host disconnects, end the game
            if (state.HostConnectionId == Context.ConnectionId)
            {
                await Clients.Group(code).SendAsync("GameOver",
                    state.Players.Values.OrderByDescending(p => p.Score)
                        .Select(p => new { p.Name, p.Score, p.CorrectAnswers }).ToList());
                Games.Remove(code);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    private static string GenerateGameCode()
    {
        var random = new Random();
        string code;
        do
        {
            code = random.Next(100000, 999999).ToString();
        } while (Games.ContainsKey(code));
        return code;
    }
}

// In-memory game state classes
public class GameState
{
    public string GameCode { get; set; } = string.Empty;
    public string HostConnectionId { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public GameStatus Status { get; set; }
    public List<Question> Questions { get; set; } = new();
    public Dictionary<string, PlayerInfo> Players { get; set; } = new();
    public int CurrentQuestionIndex { get; set; }
    public HashSet<string> AnswersReceived { get; set; } = new();
}

public class PlayerInfo
{
    public string ConnectionId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
}
