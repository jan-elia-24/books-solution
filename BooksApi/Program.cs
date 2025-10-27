using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BooksApi; // för våra record-typer i Dtos.cs

var builder = WebApplication.CreateBuilder(args);

// ===== JWT =====
var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-super-secret-key-change-me-32-chars-long!";
if (jwtKey.Length < 32)
    throw new ArgumentException("JWT Key must be at least 32 characters long for security");

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS – tillåt Angular dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", p => p
        .AllowAnyOrigin() // OBS: I produktion, specificera exakta origin
        .AllowAnyHeader()
        .AllowAnyMethod());
    // OBS: .AllowCredentials() kräver specifik origin och särskild hantering.
});

var books = new Dictionary<int, BookDto>();
var nextId = 1;

var app = builder.Build();

app.UseCors("dev");
// app.UseHttpsRedirection(); 

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapMethods("/api/{**any}", new[] { "OPTIONS" }, () => Results.Ok())
   .AllowAnonymous();

app.MapGet("/", () => "Books API up");

// ===== Auth =====
app.MapPost("/api/auth/login", (LoginDto dto) =>
{
    if (dto.Username == "admin" && dto.Password == "pass123")
    {
        var token = CreateToken(dto.Username, signingKey);
        return Results.Ok(new { token, username = dto.Username });
    }
    return Results.Unauthorized();
});

// ===== Books (skyddat) =====
app.MapGet("/api/books", () => books.Values.OrderBy(b => b.Id))
    .RequireAuthorization();

app.MapGet("/api/books/{id:int}", (int id) =>
    books.TryGetValue(id, out var book) ? Results.Ok(book) : Results.NotFound())
    .RequireAuthorization();

app.MapPost("/api/books", (BookCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title)) return Results.BadRequest("Title is required");
    if (string.IsNullOrWhiteSpace(dto.Author)) return Results.BadRequest("Author is required");

    var newBook = new BookDto
    {
        Id = nextId++,
        Title = dto.Title.Trim(),
        Author = dto.Author.Trim(),
        PublishedDate = dto.PublishedDate
    };
    books[newBook.Id] = newBook;
    return Results.Created($"/api/books/{newBook.Id}", newBook);
}).RequireAuthorization();

app.MapPut("/api/books/{id:int}", (int id, BookUpdateDto dto) =>
{
    if (!books.ContainsKey(id)) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(dto.Title)) return Results.BadRequest("Title is required");
    if (string.IsNullOrWhiteSpace(dto.Author)) return Results.BadRequest("Author is required");

    var updated = new BookDto
    {
        Id = id,
        Title = dto.Title.Trim(),
        Author = dto.Author.Trim(),
        PublishedDate = dto.PublishedDate
    };
    books[id] = updated;
    return Results.Ok(updated);
}).RequireAuthorization();

app.MapDelete("/api/books/{id:int}", (int id) =>
{
    if (!books.Remove(id)) return Results.NotFound();
    return Results.NoContent();
}).RequireAuthorization();

app.Run();

// ===== Helper =====
static string CreateToken(string username, SymmetricSecurityKey key)
{
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim(ClaimTypes.Name, username),
        new Claim(JwtRegisteredClaimNames.Sub, username),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var jwt = new JwtSecurityToken(
        claims: claims,
        expires: DateTime.UtcNow.AddHours(8),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(jwt);
}
