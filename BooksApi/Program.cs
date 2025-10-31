using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using BooksApi;
using Microsoft.OpenApi.Models;

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
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// CORS –  Angular dev
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("web", p => p
        .WithOrigins("http://localhost:4200", "https://bookbreeze-rust.vercel.app")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var books = new Dictionary<int, BookDto>();
var nextId = 1;

// In-memory users
var users = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase); 
// key: username, value: passwordHash

// In-memory quotes
var quotes = new Dictionary<int, QuoteDto>();
var nextQuoteId = 1;

var app = builder.Build();

app.UseCors("web");
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

// register-endpoint
app.MapPost("/api/auth/register", (LoginDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
        return Results.BadRequest("Username and password are required");

    if (users.ContainsKey(dto.Username))
        return Results.Conflict("Username already exists");

    // Hash password
    var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
    users[dto.Username] = hash;

    // Auto-login on success (return token)
    var token = CreateToken(dto.Username, signingKey);
    return Results.Ok(new { token, username = dto.Username });
});

// Login endpoint that works with both "admin/pass123" and registered users
app.MapPost("/api/auth/login", (LoginDto dto) =>
{
    // allow the original demo account
    var isDemo = dto.Username == "admin" && dto.Password == "pass123";

    // or a registered user (if exists + hash ok)
    var isUser = users.TryGetValue(dto.Username, out var hash) && BCrypt.Net.BCrypt.Verify(dto.Password, hash);

    if (isDemo || isUser)
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

// ========== QUOTES ENDPOINTS (RequireAuthorization) ==========

// List my quotes
app.MapGet("/api/quotes", (ClaimsPrincipal user) =>
{
    var me = user.Identity?.Name ?? "";
    var mine = quotes.Values.Where(q => q.Owner.Equals(me, StringComparison.OrdinalIgnoreCase))
                            .OrderBy(q => q.Id);
    return Results.Ok(mine);
}).RequireAuthorization();

// Get single (only if owner)
app.MapGet("/api/quotes/{id:int}", (int id, ClaimsPrincipal user) =>
{
    if (!quotes.TryGetValue(id, out var q)) return Results.NotFound();
    var me = user.Identity?.Name ?? "";
    if (!q.Owner.Equals(me, StringComparison.OrdinalIgnoreCase)) return Results.Forbid();
    return Results.Ok(q);
}).RequireAuthorization();

// Create
app.MapPost("/api/quotes", (QuoteCreateDto dto, ClaimsPrincipal user) =>
{
    var text = (dto.Text ?? "").Trim();
    if (string.IsNullOrWhiteSpace(text)) return Results.BadRequest("Text is required");

    var me = user.Identity?.Name ?? "";
    var q = new QuoteDto { Id = nextQuoteId++, Text = text, Owner = me };
    quotes[q.Id] = q;
    return Results.Created($"/api/quotes/{q.Id}", q);
}).RequireAuthorization();

// Update (only if owner)
app.MapPut("/api/quotes/{id:int}", (int id, QuoteUpdateDto dto, ClaimsPrincipal user) =>
{
    if (!quotes.TryGetValue(id, out var existing)) return Results.NotFound();

    var me = user.Identity?.Name ?? "";
    if (!existing.Owner.Equals(me, StringComparison.OrdinalIgnoreCase)) return Results.Forbid();

    var text = (dto.Text ?? "").Trim();
    if (string.IsNullOrWhiteSpace(text)) return Results.BadRequest("Text is required");

    var updated = existing with { Text = text };
    quotes[id] = updated;
    return Results.Ok(updated);
}).RequireAuthorization();

// Delete (only if owner)
app.MapDelete("/api/quotes/{id:int}", (int id, ClaimsPrincipal user) =>
{
    if (!quotes.TryGetValue(id, out var existing)) return Results.NotFound();

    var me = user.Identity?.Name ?? "";
    if (!existing.Owner.Equals(me, StringComparison.OrdinalIgnoreCase)) return Results.Forbid();

    quotes.Remove(id);
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

// Quote DTOs
record QuoteDto
{
    public int Id { get; init; }
    public string Text { get; init; } = "";
    public string Owner { get; init; } = ""; // username from JWT
}

record QuoteCreateDto(string Text);
record QuoteUpdateDto(string Text);