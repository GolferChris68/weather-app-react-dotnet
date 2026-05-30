using System.Text.Json.Serialization;

namespace WeatherApp.Api.Models;

public class NominatimResponse
{
    [JsonPropertyName("address")]
    public NominatimAddress? Address { get; set; }
}

public class NominatimAddress
{
    [JsonPropertyName("city")]
    public string? City { get; set; }

    [JsonPropertyName("town")]
    public string? Town { get; set; }

    [JsonPropertyName("village")]
    public string? Village { get; set; }

    [JsonPropertyName("county")]
    public string? County { get; set; }

    [JsonPropertyName("state")]
    public string? State { get; set; }

    [JsonPropertyName("state_code")]
    public string? StateCode { get; set; }

    // Nominatim often returns the subdivision code here instead of state_code (e.g. "US-PA")
    [JsonPropertyName("ISO3166-2-lvl4")]
    public string? Iso31662Lvl4 { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("country_code")]
    public string? CountryCode { get; set; }
}
