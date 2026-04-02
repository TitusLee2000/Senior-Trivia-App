using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TriviaApi.Data;
using TriviaApi.DTOs;
using TriviaApi.Models;

namespace TriviaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public QuestionsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<QuestionDto>>> GetAll([FromQuery] int? categoryId)
    {
        var query = _db.Questions.AsQueryable();
        if (categoryId.HasValue)
            query = query.Where(q => q.CategoryId == categoryId.Value);

        var questions = await query.Select(q => new QuestionDto(
            q.Id, q.CategoryId, q.Text, q.MediaUrl, q.MediaType,
            q.Option1, q.Option2, q.Option3, q.Option4, q.CorrectAnswerIndex
        )).ToListAsync();

        return Ok(questions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuestionDto>> Get(int id)
    {
        var q = await _db.Questions.FindAsync(id);
        if (q == null) return NotFound();
        return Ok(new QuestionDto(
            q.Id, q.CategoryId, q.Text, q.MediaUrl, q.MediaType,
            q.Option1, q.Option2, q.Option3, q.Option4, q.CorrectAnswerIndex));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<QuestionDto>> Create(CreateQuestionDto dto)
    {
        var question = new Question
        {
            CategoryId = dto.CategoryId,
            Text = dto.Text,
            MediaUrl = dto.MediaUrl,
            MediaType = dto.MediaType,
            Option1 = dto.Option1,
            Option2 = dto.Option2,
            Option3 = dto.Option3,
            Option4 = dto.Option4,
            CorrectAnswerIndex = dto.CorrectAnswerIndex
        };
        _db.Questions.Add(question);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = question.Id },
            new QuestionDto(question.Id, question.CategoryId, question.Text,
                question.MediaUrl, question.MediaType,
                question.Option1, question.Option2, question.Option3, question.Option4,
                question.CorrectAnswerIndex));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateQuestionDto dto)
    {
        var question = await _db.Questions.FindAsync(id);
        if (question == null) return NotFound();

        question.CategoryId = dto.CategoryId;
        question.Text = dto.Text;
        question.MediaUrl = dto.MediaUrl;
        question.MediaType = dto.MediaType;
        question.Option1 = dto.Option1;
        question.Option2 = dto.Option2;
        question.Option3 = dto.Option3;
        question.Option4 = dto.Option4;
        question.CorrectAnswerIndex = dto.CorrectAnswerIndex;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var question = await _db.Questions.FindAsync(id);
        if (question == null) return NotFound();
        _db.Questions.Remove(question);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
