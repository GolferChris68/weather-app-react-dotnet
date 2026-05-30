using WeatherApp.Api.Models;

namespace WeatherApp.Api.Services;

public interface IWeatherService
{
    Task<WeatherResponse> GetCurrentWeatherAsync(double lat, double lon, CancellationToken ct);
}
