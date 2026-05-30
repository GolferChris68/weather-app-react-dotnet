using System.Net.Http.Json;
using WeatherApp.Api.Models;

namespace WeatherApp.Api.Services;

public class GeocodingService : IGeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeocodingService> _logger;

    public GeocodingService(HttpClient httpClient, ILogger<GeocodingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string?> GetLocationNameAsync(double lat, double lon, CancellationToken ct)
    {
        try
        {
            var url = $"reverse?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1";
            var response = await _httpClient.GetAsync(url, ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Nominatim returned HTTP {Status} for ({Lat}, {Lon}).",
                    (int)response.StatusCode, Math.Round(lat, 2), Math.Round(lon, 2));
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<NominatimResponse>(cancellationToken: ct);
            return FormatLocationName(result?.Address);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Reverse geocoding failed for ({Lat}, {Lon}).",
                Math.Round(lat, 2), Math.Round(lon, 2));
            return null;
        }
    }

    private static string? FormatLocationName(NominatimAddress? address)
    {
        if (address is null) return null;

        var place = address.City
            ?? address.Town
            ?? address.Village
            ?? address.County;

        if (place is null) return null;

        if (string.Equals(address.CountryCode, "us", StringComparison.OrdinalIgnoreCase))
        {
            // Prefer explicit state_code; fall back to parsing ISO3166-2-lvl4 ("US-PA" → "PA")
            var stateAbbr = address.StateCode
                ?? address.Iso31662Lvl4?.Split('-').LastOrDefault();

            if (stateAbbr is not null)
                return $"{place}, {stateAbbr.ToUpperInvariant()}";
        }

        if (address.Country is not null)
            return $"{place}, {address.Country}";

        return place;
    }
}
