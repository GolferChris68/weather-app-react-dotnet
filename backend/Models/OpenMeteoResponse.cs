using System.Text.Json.Serialization;

namespace WeatherApp.Api.Models;

public class OpenMeteoResponse
{
    [JsonPropertyName("current")]
    public OpenMeteoCurrent Current { get; set; } = new();
}

public class OpenMeteoCurrent
{
    [JsonPropertyName("temperature_2m")]
    public double Temperature2m { get; set; }

    [JsonPropertyName("wind_speed_10m")]
    public double WindSpeed10m { get; set; }

    [JsonPropertyName("wind_direction_10m")]
    public double WindDirection10m { get; set; }

    [JsonPropertyName("weather_code")]
    public int WeatherCode { get; set; }

    [JsonPropertyName("is_day")]
    public int IsDay { get; set; }
}
