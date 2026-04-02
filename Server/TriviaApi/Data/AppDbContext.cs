using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TriviaApi.Models;

namespace TriviaApi.Data;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<GameSession> GameSessions { get; set; }
    public DbSet<PlayerScore> PlayerScores { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Question>()
            .HasOne(q => q.Category)
            .WithMany(c => c.Questions)
            .HasForeignKey(q => q.CategoryId);

        builder.Entity<PlayerScore>()
            .HasOne(ps => ps.GameSession)
            .WithMany(gs => gs.PlayerScores)
            .HasForeignKey(ps => ps.GameSessionId);

        builder.Entity<GameSession>()
            .HasIndex(gs => gs.GameCode)
            .IsUnique();

        SeedData(builder);
    }

    private static void SeedData(ModelBuilder builder)
    {
        builder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "40's Movies", Description = "Classic films from the 1940s golden era of Hollywood" },
            new Category { Id = 2, Name = "50's Politics", Description = "Political events and figures of the 1950s" },
            new Category { Id = 3, Name = "60's Products", Description = "Iconic products and brands from the 1960s" },
            new Category { Id = 4, Name = "70's Music", Description = "Hit songs and artists from the 1970s" },
            new Category { Id = 5, Name = "80's TV Shows", Description = "Popular television shows from the 1980s" },
            new Category { Id = 6, Name = "General Knowledge", Description = "A mix of trivia from all decades" }
        );

        builder.Entity<Question>().HasData(
            // 40's Movies
            new Question { Id = 1, CategoryId = 1, Text = "Which 1942 film features the line 'Here's looking at you, kid'?", Option1 = "Casablanca", Option2 = "The Maltese Falcon", Option3 = "Citizen Kane", Option4 = "It's a Wonderful Life", CorrectAnswerIndex = 0 },
            new Question { Id = 2, CategoryId = 1, Text = "Who directed 'Citizen Kane' (1941)?", Option1 = "Alfred Hitchcock", Option2 = "Orson Welles", Option3 = "John Ford", Option4 = "Billy Wilder", CorrectAnswerIndex = 1 },
            new Question { Id = 3, CategoryId = 1, Text = "Which Disney animated film was released in 1940?", Option1 = "Snow White", Option2 = "Dumbo", Option3 = "Pinocchio", Option4 = "Bambi", CorrectAnswerIndex = 2 },
            new Question { Id = 4, CategoryId = 1, Text = "Who starred in 'The Philadelphia Story' (1940)?", Option1 = "Bette Davis", Option2 = "Ingrid Bergman", Option3 = "Judy Garland", Option4 = "Katharine Hepburn", CorrectAnswerIndex = 3 },
            new Question { Id = 5, CategoryId = 1, Text = "What 1946 film is considered one of the greatest Christmas movies ever?", Option1 = "It's a Wonderful Life", Option2 = "Miracle on 34th Street", Option3 = "White Christmas", Option4 = "A Christmas Carol", CorrectAnswerIndex = 0 },

            // 50's Politics
            new Question { Id = 6, CategoryId = 2, Text = "Who was the U.S. President at the start of the 1950s?", Option1 = "Dwight D. Eisenhower", Option2 = "Harry S. Truman", Option3 = "John F. Kennedy", Option4 = "Franklin D. Roosevelt", CorrectAnswerIndex = 1 },
            new Question { Id = 7, CategoryId = 2, Text = "What senator led anti-communist hearings in the early 1950s?", Option1 = "Richard Nixon", Option2 = "Barry Goldwater", Option3 = "Joseph McCarthy", Option4 = "Robert Taft", CorrectAnswerIndex = 2 },
            new Question { Id = 8, CategoryId = 2, Text = "In what year did the Korean War begin?", Option1 = "1948", Option2 = "1949", Option3 = "1951", Option4 = "1950", CorrectAnswerIndex = 3 },
            new Question { Id = 9, CategoryId = 2, Text = "What was the name of the U.S. policy to contain communism?", Option1 = "Containment", Option2 = "Détente", Option3 = "Isolationism", Option4 = "Appeasement", CorrectAnswerIndex = 0 },
            new Question { Id = 10, CategoryId = 2, Text = "Which 1954 Supreme Court case declared school segregation unconstitutional?", Option1 = "Roe v. Wade", Option2 = "Brown v. Board of Education", Option3 = "Plessy v. Ferguson", Option4 = "Miranda v. Arizona", CorrectAnswerIndex = 1 },

            // 60's Products
            new Question { Id = 11, CategoryId = 3, Text = "What toy, introduced in 1964, lets kids create pictures with a magnetic pen?", Option1 = "Etch A Sketch", Option2 = "Magna Doodle", Option3 = "Lite-Brite", Option4 = "Spirograph", CorrectAnswerIndex = 0 },
            new Question { Id = 12, CategoryId = 3, Text = "Which soft drink introduced its 'It's the real thing' slogan in the 1960s?", Option1 = "Pepsi", Option2 = "Coca-Cola", Option3 = "Dr Pepper", Option4 = "7-Up", CorrectAnswerIndex = 1 },
            new Question { Id = 13, CategoryId = 3, Text = "What popular fashion doll was introduced by Mattel in 1959 and boomed in the 60s?", Option1 = "Raggedy Ann", Option2 = "Cabbage Patch Kid", Option3 = "Barbie", Option4 = "American Girl", CorrectAnswerIndex = 2 },
            new Question { Id = 14, CategoryId = 3, Text = "Which car, known as the 'pony car', debuted in 1964?", Option1 = "Chevrolet Camaro", Option2 = "Dodge Charger", Option3 = "Pontiac GTO", Option4 = "Ford Mustang", CorrectAnswerIndex = 3 },
            new Question { Id = 15, CategoryId = 3, Text = "What instant camera brand was hugely popular in the 1960s?", Option1 = "Polaroid", Option2 = "Kodak", Option3 = "Canon", Option4 = "Nikon", CorrectAnswerIndex = 0 },

            // 70's Music
            new Question { Id = 16, CategoryId = 4, Text = "Which band released 'Stairway to Heaven' in 1971?", Option1 = "Led Zeppelin", Option2 = "Pink Floyd", Option3 = "The Rolling Stones", Option4 = "The Who", CorrectAnswerIndex = 0 },
            new Question { Id = 17, CategoryId = 4, Text = "Who was known as the 'Queen of Disco'?", Option1 = "Diana Ross", Option2 = "Donna Summer", Option3 = "Gloria Gaynor", Option4 = "Cher", CorrectAnswerIndex = 1 },
            new Question { Id = 18, CategoryId = 4, Text = "Which band released 'Bohemian Rhapsody' in 1975?", Option1 = "The Beatles", Option2 = "Led Zeppelin", Option3 = "Queen", Option4 = "ABBA", CorrectAnswerIndex = 2 },
            new Question { Id = 19, CategoryId = 4, Text = "What 1977 movie popularized disco music worldwide?", Option1 = "Grease", Option2 = "Rocky", Option3 = "Star Wars", Option4 = "Saturday Night Fever", CorrectAnswerIndex = 3 },
            new Question { Id = 20, CategoryId = 4, Text = "Which Pink Floyd album features a prism on its cover?", Option1 = "The Dark Side of the Moon", Option2 = "The Wall", Option3 = "Wish You Were Here", Option4 = "Animals", CorrectAnswerIndex = 0 },

            // 80's TV Shows
            new Question { Id = 21, CategoryId = 5, Text = "What TV show featured the Ewing family and their oil empire?", Option1 = "Dallas", Option2 = "Dynasty", Option3 = "Falcon Crest", Option4 = "Knots Landing", CorrectAnswerIndex = 0 },
            new Question { Id = 22, CategoryId = 5, Text = "Which sitcom was set in a Boston bar 'where everybody knows your name'?", Option1 = "Seinfeld", Option2 = "Cheers", Option3 = "Friends", Option4 = "The Cosby Show", CorrectAnswerIndex = 1 },
            new Question { Id = 23, CategoryId = 5, Text = "What show followed the adventures of a red Ferrari-driving private investigator in Hawaii?", Option1 = "Miami Vice", Option2 = "The A-Team", Option3 = "Magnum, P.I.", Option4 = "Knight Rider", CorrectAnswerIndex = 2 },
            new Question { Id = 24, CategoryId = 5, Text = "Which 1980s show featured Mr. T as B.A. Baracus?", Option1 = "Miami Vice", Option2 = "MacGyver", Option3 = "Knight Rider", Option4 = "The A-Team", CorrectAnswerIndex = 3 },
            new Question { Id = 25, CategoryId = 5, Text = "What was the name of the robot maid in 'The Jetsons'?", Option1 = "Rosie", Option2 = "Daisy", Option3 = "Dot", Option4 = "Mabel", CorrectAnswerIndex = 0 },

            // General Knowledge
            new Question { Id = 26, CategoryId = 6, Text = "What year did man first walk on the Moon?", Option1 = "1967", Option2 = "1968", Option3 = "1970", Option4 = "1969", CorrectAnswerIndex = 3 },
            new Question { Id = 27, CategoryId = 6, Text = "Who was the first woman to fly solo across the Atlantic?", Option1 = "Amelia Earhart", Option2 = "Bessie Coleman", Option3 = "Harriet Quimby", Option4 = "Jacqueline Cochran", CorrectAnswerIndex = 0 },
            new Question { Id = 28, CategoryId = 6, Text = "What board game, first sold in 1935, involves buying and trading properties?", Option1 = "Risk", Option2 = "Monopoly", Option3 = "Clue", Option4 = "Scrabble", CorrectAnswerIndex = 1 },
            new Question { Id = 29, CategoryId = 6, Text = "Which president gave the 'I Have a Dream' speech... just kidding! Who actually gave it?", Option1 = "Malcolm X", Option2 = "John F. Kennedy", Option3 = "Martin Luther King Jr.", Option4 = "Rosa Parks", CorrectAnswerIndex = 2 },
            new Question { Id = 30, CategoryId = 6, Text = "What was the name of the first artificial satellite launched into space in 1957?", Option1 = "Explorer 1", Option2 = "Vanguard 1", Option3 = "Luna 1", Option4 = "Sputnik", CorrectAnswerIndex = 3 }
        );
    }
}
