using System.Net.Http.Json;
using WeatherApp.Api.Exceptions;
using WeatherApp.Api.Models;

namespace WeatherApp.Api.Services;

public class WeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WeatherService> _logger;

    private static readonly string[] CardinalDirections =
    [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW"
    ];

    public WeatherService(HttpClient httpClient, ILogger<WeatherService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<WeatherResponse> GetCurrentWeatherAsync(double lat, double lon, CancellationToken ct)
    {
        var url = $"v1/forecast?latitude={lat}&longitude={lon}" +
                  "&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code" +
                  "&temperature_unit=celsius&wind_speed_unit=mph&timezone=auto";

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.GetAsync(url, ct);
        }
        catch (TaskCanceledException ex) when (!ct.IsCancellationRequested)
        {
            _logger.LogError(ex, "Open-Meteo request timed out for coordinates ({Lat}, {Lon}).",
                Math.Round(lat, 2), Math.Round(lon, 2));
            throw new WeatherApiException("Open-Meteo request timed out.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Open-Meteo returned HTTP {StatusCode} for coordinates ({Lat}, {Lon}).",
                (int)response.StatusCode, Math.Round(lat, 2), Math.Round(lon, 2));
            throw new WeatherApiException($"Open-Meteo returned status {(int)response.StatusCode}.");
        }

        OpenMeteoResponse? openMeteo;
        try
        {
            openMeteo = await response.Content.ReadFromJsonAsync<OpenMeteoResponse>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize Open-Meteo response.");
            throw new WeatherApiException("Failed to parse weather data.", ex);
        }

        if (openMeteo is null)
        {
            _logger.LogError("Open-Meteo returned null response for coordinates ({Lat}, {Lon}).",
                Math.Round(lat, 2), Math.Round(lon, 2));
            throw new WeatherApiException("Received empty response from weather service.");
        }

        var current = openMeteo.Current;
        var celsius = current.Temperature2m;
        var fahrenheit = Math.Round((celsius * 9.0 / 5.0) + 32, 1);

        _logger.LogInformation("Weather fetched successfully for coordinates ({Lat}, {Lon}).",
            Math.Round(lat, 2), Math.Round(lon, 2));

        return new WeatherResponse
        {
            TemperatureCelsius = Math.Round(celsius, 1),
            TemperatureFahrenheit = fahrenheit,
            WindSpeedMph = Math.Round(current.WindSpeed10m, 1),
            WindDirectionDegrees = current.WindDirection10m,
            WindDirectionCardinal = DegreesToCardinal(current.WindDirection10m),
            WeatherCode = current.WeatherCode,
            WeatherLabel = GetWeatherLabel(current.WeatherCode),
            FetchedAtUtc = DateTime.UtcNow
        };
    }

    private static string DegreesToCardinal(double degrees)
    {
        var index = (int)Math.Round(degrees / 22.5) % 16;
        return CardinalDirections[index];
    }

    private static string GetWeatherLabel(int code) => code switch
    {
        0 => "Clear Sky",
        1 => "Mainly Clear",
        2 => "Partly Cloudy",
        3 => "Overcast",
        45 or 48 => "Foggy",
        51 or 53 or 55 => "Drizzle",
        61 or 63 or 65 => "Rain",
        71 or 73 or 75 => "Snow",
        77 => "Snow Grains",
        80 or 81 or 82 => "Rain Showers",
        85 or 86 => "Snow Showers",
        95 => "Thunderstorm",
        96 or 99 => "Thunderstorm with Hail",
        _ => "Unknown"
    };
}
