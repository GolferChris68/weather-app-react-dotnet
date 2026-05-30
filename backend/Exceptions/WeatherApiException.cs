namespace WeatherApp.Api.Exceptions;

public class WeatherApiException : Exception
{
    public WeatherApiException(string message) : base(message) { }
    public WeatherApiException(string message, Exception inner) : base(message, inner) { }
}
