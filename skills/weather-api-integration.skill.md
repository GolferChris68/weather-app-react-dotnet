# Skill: Weather API Integration (Open-Meteo)

Use this skill when implementing the backend `WeatherService` that calls Open-Meteo.

---

## Overview

Open-Meteo is a free, open-source weather API. No API key or account is required. It returns current and forecast weather data based on latitude/longitude.

**Base URL:** `https://api.open-meteo.com/v1/forecast`

---

## Request

Build the URL with the following query parameters:

| Parameter | Value | Notes |
|---|---|---|
| `latitude` | `{lat}` | From client request, full decimal precision |
| `longitude` | `{lon}` | From client request, full decimal precision |
| `current` | `temperature_2m,wind_speed_10m,wind_direction_10m,weather_code` | Comma-separated, no spaces |
| `temperature_unit` | `celsius` | Always request Celsius; convert to °F in code |
| `wind_speed_unit` | `mph` | Request mph directly |
| `timezone` | `auto` | Let Open-Meteo determine timezone from coordinates |

**Example:**
```
https://api.open-meteo.com/v1/forecast?latitude=39.45&longitude=-77.57&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code&temperature_unit=celsius&wind_speed_unit=mph&timezone=auto
```

---

## Response Structure

Open-Meteo returns a JSON object. The relevant section is `current`:

```json
{
  "current": {
    "time": "2026-05-29T14:00",
    "temperature_2m": 22.4,
    "wind_speed_10m": 8.1,
    "wind_direction_10m": 247,
    "weather_code": 2
  }
}
```

---

## C# Deserialization Model

```csharp
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
}
```

---

## Temperature Conversion

Open-Meteo returns Celsius. Convert to Fahrenheit server-side:

```csharp
double fahrenheit = Math.Round((celsius * 9.0 / 5.0) + 32, 1);
```

Return both values in the response.

---

## WMO Weather Code Mapping

Open-Meteo uses WMO weather interpretation codes. Map these to display labels:

| Code(s) | Label |
|---|---|
| 0 | Clear Sky |
| 1 | Mainly Clear |
| 2 | Partly Cloudy |
| 3 | Overcast |
| 45, 48 | Foggy |
| 51, 53, 55 | Drizzle |
| 61, 63, 65 | Rain |
| 71, 73, 75 | Snow |
| 77 | Snow Grains |
| 80, 81, 82 | Rain Showers |
| 85, 86 | Snow Showers |
| 95 | Thunderstorm |
| 96, 99 | Thunderstorm with Hail |

For any unmapped code, use `"Unknown"`. Do not throw an exception.

This mapping lives in the **frontend** (`/src/utils/weatherCode.ts`). The backend returns the raw `weatherCode` integer. The frontend resolves the label.

---

## Error Handling

- If Open-Meteo returns a non-2xx status, throw a domain exception caught by `ErrorHandlingMiddleware`
- Set an `HttpClient` timeout of **10 seconds**
- Do not retry automatically — return an error to the client and let the user retry
- Never surface Open-Meteo error details to the client

---

## HttpClient Registration

Register as a typed `HttpClient` in `Program.cs`:

```csharp
builder.Services.AddHttpClient<IWeatherService, WeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(10);
});
```

---

## No Caching (v1)

Do not implement response caching in v1. Each request to `/api/weather` makes a fresh call to Open-Meteo. Caching is a stretch goal.
