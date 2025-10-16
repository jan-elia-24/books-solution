namespace BooksApi;

public record LoginDto(string Username, string Password);

public record BookDto
{
    public int Id { get; init; }
    public string Title { get; init; } = "";
    public string Author { get; init; } = "";
    public DateOnly? PublishedDate { get; init; }
}

public record BookCreateDto(string Title, string Author, DateOnly? PublishedDate);
public record BookUpdateDto(string Title, string Author, DateOnly? PublishedDate);
