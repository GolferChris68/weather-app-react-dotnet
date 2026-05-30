# Standards: Backend (C# / ASP.NET Core)

---

## Framework

- ASP.NET Core 8 Minimal API (not MVC controllers)
- Target framework: `net8.0`
- C# 12 language features are permitted

---

## Project Setup

```bash
dotnet new webapi -n WeatherApp.Api --use-minimal-apis
```

Remove the default `WeatherForecast` example endpoints before implementing anything.

---

## Nullable Reference Types

Enable nullable reference types in the `.csproj`:

```xml
<Nullable>enable</Nullable>
```

All reference types must be explicitly nullable (`string?`) or initialized. No `!` (null-forgiving) operators without a comment explaining why.

---

## Async/Await

- All I/O operations (HttpClient calls) must be `async`/`await`
- Never use `.Result` or `.Wait()` — these cause deadlocks in ASP.NET Core
- Use `CancellationToken` on all async endpoints and service methods

```csharp
app.MapGet("/api/weather", async (double lat, double lon, IWeatherService weatherService, CancellationToken ct) =>
{
    var result = await weatherService.GetCurrentWeatherAsync(lat, lon, ct);
    return Results.Ok(result);
});
```

---

## Dependency Injection

- Register all services in `Program.cs` using `builder.Services`
- Use interface-based DI (`IWeatherService` / `WeatherService`)
- Do not use `static` classes for services

---

## Error Handling

Use a middleware class `ErrorHandlingMiddleware` to catch unhandled exceptions and return a consistent error response:

```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred."
}
```

Never let stack traces or internal exception messages reach the HTTP response body.

Define a `WeatherApiException` for expected failure cases (e.g. Open-Meteo timeout).

---

## JSON Serialization

Use `System.Text.Json` (built-in). Configure camelCase output:

```csharp
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});
```

---

## CORS

Configure named CORS policy in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite dev server
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

app.UseCors("AllowFrontend");
```

In production, replace with the actual frontend origin via configuration — never use `AllowAnyOrigin()`.

---

## Configuration / Secrets

- Use `appsettings.Development.json` for local dev config
- Never hardcode URLs or secrets in source code
- Open-Meteo requires no API key, so no secrets are needed in v1
- If a secret is ever needed, use `dotnet user-secrets` locally and environment variables in production

---

## Logging

Use the built-in `ILogger<T>`. Log at appropriate levels:
- `Information` — successful weather fetch (with lat/lon rounded to 2 decimal places for privacy)
- `Warning` — Open-Meteo returned unexpected data
- `Error` — unhandled exceptions (caught by middleware)

Never log full coordinates at precision beyond 2 decimal places.

---

## Testing

- Use xUnit for unit tests
- Test `WeatherService` with a mocked `HttpClient` using `HttpMessageHandler` substitution
- Test the degrees-to-cardinal conversion and Fahrenheit conversion as pure unit tests
- Do not test ASP.NET Core infrastructure — test service logic only
