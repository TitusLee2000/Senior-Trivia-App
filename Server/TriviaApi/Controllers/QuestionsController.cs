using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriviaApi.Data;
using TriviaApi.DTOs;
using TriviaApi.Services;

namespace TriviaApi.Controllers;

[ApiController]
[Route("api/quizzes/{quizId:int}/[controller]")]
[Authorize(Roles = DbSeeder.RoleAdmin)]
public class QuestionsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<AdminQuestionDto>> Create(int quizId, [FromBody] QuestionWriteDto dto)
    {
        if (!QuizMapping.TryValidateOptions(dto, out var error))
            return BadRequest(error);

        var quizExists = await db.Quizzes.AnyAsync(q => q.Id == quizId);
        if (!quizExists)
            return NotFound();

        var question = new Models.Question { QuizId = quizId };
        QuizMapping.Apply(question, dto);
        db.Questions.Add(question);
        await db.SaveChangesAsync();

        return Created($"/api/quizzes/{quizId}/questions/{question.Id}", new AdminQuestionDto(
            question.Id,
            question.Text,
            question.MediaUrl,
            question.MediaType,
            question.Option1,
            question.Option2,
            question.Option3,
            question.Option4,
            question.CorrectAnswerIndex));
    }

    [HttpPut("{questionId:int}")]
    public async Task<IActionResult> Update(int quizId, int questionId, [FromBody] QuestionWriteDto dto)
    {
        if (!QuizMapping.TryValidateOptions(dto, out var error))
            return BadRequest(error);

        var question = await db.Questions.FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);
        if (question is null)
            return NotFound();

        QuizMapping.Apply(question, dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{questionId:int}")]
    public async Task<IActionResult> Delete(int quizId, int questionId)
    {
        var question = await db.Questions.FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);
        if (question is null)
            return NotFound();

        db.Questions.Remove(question);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
