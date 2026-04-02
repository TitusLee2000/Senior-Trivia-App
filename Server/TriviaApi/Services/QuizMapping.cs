using TriviaApi.DTOs;
using TriviaApi.Models;

namespace TriviaApi.Services;

public static class QuizMapping
{
    private static string?[] Slots(Question q) => [q.Option1, q.Option2, q.Option3, q.Option4];

    public static IReadOnlyList<PlayChoiceDto> ToChoices(Question q)
    {
        var o = Slots(q);
        var list = new List<PlayChoiceDto>();
        for (var i = 0; i < 4; i++)
        {
            if (!string.IsNullOrWhiteSpace(o[i]))
                list.Add(new PlayChoiceDto(i, o[i]!));
        }
        return list;
    }

    public static bool TryValidateOptions(QuestionWriteDto dto, out string? error)
    {
        var opts = new[] { dto.Option1, dto.Option2, dto.Option3, dto.Option4 };
        var count = opts.Count(s => !string.IsNullOrWhiteSpace(s));
        if (count < 2 || count > 4)
        {
            error = "Provide between 2 and 4 non-empty options.";
            return false;
        }

        if (dto.CorrectAnswerIndex is < 0 or > 3)
        {
            error = "CorrectAnswerIndex must be 0–3 (Option1–Option4).";
            return false;
        }

        if (string.IsNullOrWhiteSpace(opts[dto.CorrectAnswerIndex]))
        {
            error = "CorrectAnswerIndex must point to a non-empty option.";
            return false;
        }

        error = null;
        return true;
    }

    public static void Apply(Question q, QuestionWriteDto dto)
    {
        q.Text = dto.Text;
        q.MediaUrl = dto.MediaUrl;
        q.MediaType = dto.MediaType;
        q.Option1 = dto.Option1;
        q.Option2 = dto.Option2;
        q.Option3 = dto.Option3;
        q.Option4 = dto.Option4;
        q.CorrectAnswerIndex = dto.CorrectAnswerIndex;
    }
}
