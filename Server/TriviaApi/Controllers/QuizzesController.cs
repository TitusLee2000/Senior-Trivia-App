using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriviaApi.Data;
using TriviaApi.DTOs;
using TriviaApi.Services;

namespace TriviaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuizzesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<QuizSummaryDto>>> GetAll()
    {
        var list = await db.Quizzes
            .AsNoTracking()
            .OrderBy(q => q.Title)
            .Select(q => new QuizSummaryDto(q.Id, q.Title, q.Description, q.Questions.Count))
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id:int}/play")]
    public async Task<ActionResult<PlayQuizDto>> GetForPlay(int id)
    {
        var quiz = await db.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz is null)
            return NotFound();

        var questions = quiz.Questions
            .OrderBy(q => q.Id)
            .Select(q => new PlayQuestionDto(
                q.Id,
                q.Text,
                q.MediaUrl,
                q.MediaType,
                QuizMapping.ToChoices(q)))
            .ToList();

        return Ok(new PlayQuizDto(quiz.Id, quiz.Title, quiz.Description, questions));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = DbSeeder.RoleAdmin)]
    public async Task<ActionResult<AdminQuizDetailDto>> GetForAdmin(int id)
    {
        var quiz = await db.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz is null)
            return NotFound();

        var questions = quiz.Questions
            .OrderBy(q => q.Id)
            .Select(q => new AdminQuestionDto(
                q.Id,
                q.Text,
                q.MediaUrl,
                q.MediaType,
                q.Option1,
                q.Option2,
                q.Option3,
                q.Option4,
                q.CorrectAnswerIndex))
            .ToList();

        return Ok(new AdminQuizDetailDto(quiz.Id, quiz.Title, quiz.Description, questions));
    }

    [HttpPost]
    [Authorize(Roles = DbSeeder.RoleAdmin)]
    public async Task<ActionResult<QuizSummaryDto>> Create([FromBody] QuizWriteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        var quiz = new Models.Quiz { Title = dto.Title.Trim(), Description = dto.Description?.Trim() ?? "" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetForAdmin), new { id = quiz.Id },
            new QuizSummaryDto(quiz.Id, quiz.Title, quiz.Description, 0));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = DbSeeder.RoleAdmin)]
    public async Task<IActionResult> Update(int id, [FromBody] QuizWriteDto dto)
    {
        var quiz = await db.Quizzes.FirstOrDefaultAsync(q => q.Id == id);
        if (quiz is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest("Title is required.");

        quiz.Title = dto.Title.Trim();
        quiz.Description = dto.Description?.Trim() ?? "";
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = DbSeeder.RoleAdmin)]
    public async Task<IActionResult> Delete(int id)
    {
        var quiz = await db.Quizzes.Include(q => q.Questions).FirstOrDefaultAsync(q => q.Id == id);
        if (quiz is null)
            return NotFound();

        db.Quizzes.Remove(quiz);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{quizId:int}/questions/{questionId:int}/answer")]
    public async Task<ActionResult<AnswerResponse>> SubmitAnswer(int quizId, int questionId, [FromBody] AnswerRequest request)
    {
        var question = await db.Questions
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);

        if (question is null)
            return NotFound();

        if (request.SelectedSlot is < 0 or > 3)
            return BadRequest("SelectedSlot must be 0–3.");

        var slots = new[] { question.Option1, question.Option2, question.Option3, question.Option4 };
        if (string.IsNullOrWhiteSpace(slots[request.SelectedSlot]))
            return BadRequest("Invalid option slot.");

        var correct = question.CorrectAnswerIndex == request.SelectedSlot;
        return Ok(new AnswerResponse(correct));
    }
}
