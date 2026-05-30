namespace WeatherApp.Api.Services;

public interface IGeocodingService
{
    Task<string?> GetLocationNameAsync(double lat, double lon, CancellationToken ct);
}
