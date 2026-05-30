namespace WeatherApp.Api.Models;

public class WeatherResponse
{
    public double TemperatureCelsius { get; set; }
    public double TemperatureFahrenheit { get; set; }
    public double WindSpeedMph { get; set; }
    public double WindDirectionDegrees { get; set; }
    public string WindDirectionCardinal { get; set; } = string.Empty;
    public int WeatherCode { get; set; }
    public string WeatherLabel { get; set; } = string.Empty;
    public string? LocationName { get; set; }
    public bool IsDay { get; set; }
    public DateTime FetchedAtUtc { get; set; }
}
