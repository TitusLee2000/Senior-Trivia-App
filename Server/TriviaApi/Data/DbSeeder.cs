using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TriviaApi.Models;

namespace TriviaApi.Data;

public static class DbSeeder
{
    public const string AdminEmail = "admin@trivia.local";
    public const string AdminPassword = "Admin123!";
    public const string RoleAdmin = "Admin";
    public const string RolePlayer = "Player";

    public static async Task SeedAsync(AppDbContext db, UserManager<ApplicationUser> users, RoleManager<IdentityRole> roles)
    {
        if (!await roles.RoleExistsAsync(RoleAdmin))
            await roles.CreateAsync(new IdentityRole(RoleAdmin));
        if (!await roles.RoleExistsAsync(RolePlayer))
            await roles.CreateAsync(new IdentityRole(RolePlayer));

        var admin = await users.FindByEmailAsync(AdminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                UserName = AdminEmail,
                Email = AdminEmail,
                EmailConfirmed = true
            };
            var created = await users.CreateAsync(admin, AdminPassword);
            if (created.Succeeded)
                await users.AddToRoleAsync(admin, RoleAdmin);
        }

        if (await db.Quizzes.AnyAsync())
            return;

        var q40 = new Quiz
        {
            Title = "40's Movies",
            Description = "Classic Hollywood films from the 1940s.",
            Questions =
            [
                new Question
                {
                    Text = "Which 1942 film features Rick and Ilsa at Café Americain?",
                    Option1 = "Casablanca",
                    Option2 = "Citizen Kane",
                    Option3 = "Double Indemnity",
                    Option4 = "The Maltese Falcon",
                    CorrectAnswerIndex = 0
                },
                new Question
                {
                    Text = "In 'It's a Wonderful Life' (1946), what is the name of George Bailey's guardian angel?",
                    Option1 = "Clarence Odbody",
                    Option2 = "Clarence Oddbody",
                    Option3 = "Charles Oddbody",
                    Option4 = "Claude Odbody",
                    CorrectAnswerIndex = 0
                }
            ]
        };

        var q50 = new Quiz
        {
            Title = "50's Politics",
            Description = "Cold War era leaders and events.",
            Questions =
            [
                new Question
                {
                    Text = "Who became U.S. President in 1953?",
                    Option1 = "Harry S. Truman",
                    Option2 = "Dwight D. Eisenhower",
                    Option3 = "John F. Kennedy",
                    Option4 = "Richard Nixon",
                    CorrectAnswerIndex = 1
                },
                new Question
                {
                    Text = "The Korean War armistice was signed in which year?",
                    Option1 = "1951",
                    Option2 = "1952",
                    Option3 = "1953",
                    Option4 = "1954",
                    CorrectAnswerIndex = 2
                }
            ]
        };

        var q60 = new Quiz
        {
            Title = "60's Products",
            Description = "Brands and gadgets from the swinging sixties.",
            Questions =
            [
                new Question
                {
                    Text = "Which toy line featured astronauts and moon exploration in the 1960s?",
                    Option1 = "Major Matt Mason",
                    Option2 = "G.I. Joe Adventure Team",
                    Option3 = "Both were space-themed lines",
                    Option4 = "Barbie Astronaut only",
                    CorrectAnswerIndex = 2
                },
                new Question
                {
                    Text = "The first generation Ford Mustang debuted in which model year?",
                    Option1 = "1963",
                    Option2 = "1964",
                    Option3 = "1965",
                    Option4 = "1966",
                    CorrectAnswerIndex = 1
                }
            ]
        };

        db.Quizzes.AddRange(q40, q50, q60);
        await db.SaveChangesAsync();
    }
}
