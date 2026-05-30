using System.Text.Json;
using WeatherApp.Api.Middleware;
using WeatherApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient<IWeatherService, WeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddHttpClient<IGeocodingService, GeocodingService>(client =>
{
    client.BaseAddress = new Uri("https://nominatim.openstreetmap.org/");
    client.Timeout = TimeSpan.FromSeconds(5);
    var userAgent = builder.Configuration["Nominatim:UserAgent"] ?? "WeatherApp/1.0";
    client.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
    client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en");
});

var app = builder.Build();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("AllowFrontend");

app.MapGet("/api/weather", async (
    double lat,
    double lon,
    IWeatherService weatherService,
    IGeocodingService geocodingService,
    CancellationToken ct) =>
{
    if (lat < -90 || lat > 90)
        return Results.BadRequest(new { error = "invalid_parameter", message = "Invalid latitude." });
    if (lon < -180 || lon > 180)
        return Results.BadRequest(new { error = "invalid_parameter", message = "Invalid longitude." });

    var weatherTask = weatherService.GetCurrentWeatherAsync(lat, lon, ct);
    var locationTask = geocodingService.GetLocationNameAsync(lat, lon, ct);

    await Task.WhenAll(weatherTask, locationTask);

    var result = weatherTask.Result; // safe: Task.WhenAll guarantees completion
    result.LocationName = locationTask.Result;
    return Results.Ok(result);
});

app.Run();
