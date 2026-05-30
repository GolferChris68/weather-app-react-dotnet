# Skill: Reverse Geocoding (Nominatim / OpenStreetMap)

Use this skill when implementing `GeocodingService` or any feature that
converts a latitude/longitude pair into a human-readable location name.

---

## Overview

Nominatim is OpenStreetMap's free geocoding service. It supports reverse
geocoding (coordinates → place name) with no API key. It is the correct
choice for this project because:
- No API key or account required
- Global coverage
- Attribution-only license (display "© OpenStreetMap contributors")
- Adequate rate limits for on-demand, user-triggered requests

**Base URL:** `https://nominatim.openstreetmap.org`

---

## Request

```
GET /reverse?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1
```

| Parameter | Value | Notes |
|---|---|---|
| `format` | `json` | Always JSON |
| `lat` | `{lat}` | Full decimal precision from client |
| `lon` | `{lon}` | Full decimal precision from client |
| `zoom` | `10` | City-level granularity. Do not use finer values. |
| `addressdetails` | `1` | Required to get the structured `address` object |

**Required headers — both must be sent on every request:**

| Header | Value | Notes |
|---|---|---|
| `User-Agent` | `WeatherApp/1.0` | Nominatim ToS requires this. Read from config. |
| `Accept-Language` | `en` | Ensures English place names regardless of server locale |

Configure `User-Agent` in `appsettings.json`:
```json
{
  "Nominatim": {
    "UserAgent": "WeatherApp/1.0"
  }
}
```

---

## Response Structure

```json
{
  "place_id": 282608082,
  "display_name": "Philadelphia, Philadelphia County, Pennsylvania, United States",
  "address": {
    "city": "Philadelphia",
    "county": "Philadelphia County",
    "state": "Pennsylvania",
    "state_code": "PA",
    "country": "United States",
    "country_code": "us"
  }
}
```

The `address` object fields vary by location. Always use the fallback chain
below rather than assuming `city` is present.

---

## C# Deserialization Models

```csharp
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

    // Nominatim typically returns the subdivision here instead of state_code (e.g. "US-PA")
    [JsonPropertyName("ISO3166-2-lvl4")]
    public string? Iso31662Lvl4 { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("country_code")]
    public string? CountryCode { get; set; }
}
```

---

## Location Name Formatting

Apply this logic in order to produce a display string:

```csharp
public static string? FormatLocationName(NominatimAddress? address)
{
    if (address is null) return null;

    // Fallback chain for the place name
    var place = address.City
        ?? address.Town
        ?? address.Village
        ?? address.County;

    if (place is null) return null;

    // US: use state abbreviation (e.g. "PA")
    if (string.Equals(address.CountryCode, "us", StringComparison.OrdinalIgnoreCase)
        && address.StateCode is not null)
    {
        return $"{place}, {address.StateCode.ToUpperInvariant()}";
    }

    // International: use country name
    if (address.Country is not null)
        return $"{place}, {address.Country}";

    return place;
}
```

Output examples:
- `"Philadelphia, PA"` — US city
- `"London, United Kingdom"` — international city
- `"Yellowstone County"` — rural US fallback when city/town/village absent
- `null` — no usable fields (caller treats as non-fatal)

---

## HttpClient Registration

Register as a **separate** typed client from the Open-Meteo client in `Program.cs`:

```csharp
builder.Services.AddHttpClient<IGeocodingService, GeocodingService>(client =>
{
    client.BaseAddress = new Uri("https://nominatim.openstreetmap.org/");
    client.Timeout = TimeSpan.FromSeconds(5); // shorter — geocoding failure is non-fatal
    var userAgent = builder.Configuration["Nominatim:UserAgent"] ?? "WeatherApp/1.0";
    client.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
    client.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en");
});
```

Use a 5-second timeout (shorter than Open-Meteo's 10 s) because a
geocoding failure is non-fatal and should not hold up the response.

---

## Calling in Parallel with Weather Fetch

In the route handler, run both calls concurrently:

```csharp
var weatherTask = weatherService.GetCurrentWeatherAsync(lat, lon, ct);
var locationTask = geocodingService.GetLocationNameAsync(lat, lon, ct);

await Task.WhenAll(weatherTask, locationTask);

var result = weatherTask.Result; // .Result safe here — task is guaranteed complete
result.LocationName = locationTask.Result; // null if geocoding failed
return Results.Ok(result);
```

Never use `.Result` or `.Wait()` on a running task — only after
`Task.WhenAll` confirms both are complete.

---

## Error Handling

Geocoding failures are **non-fatal**. `GeocodingService` must never throw:

```csharp
public async Task<string?> GetLocationNameAsync(double lat, double lon, CancellationToken ct)
{
    try
    {
        var response = await _httpClient.GetAsync(
            $"reverse?format=json&lat={lat}&lon={lon}&zoom=10&addressdetails=1", ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Nominatim returned HTTP {Status} for ({Lat}, {Lon}).",
                (int)response.StatusCode, Math.Round(lat, 2), Math.Round(lon, 2));
            return null;
        }

        var result = await response.Content.ReadFromJsonAsync<NominatimResponse>(
            cancellationToken: ct);
        return FormatLocationName(result?.Address);
    }
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Reverse geocoding failed for ({Lat}, {Lon}).",
            Math.Round(lat, 2), Math.Round(lon, 2));
        return null; // weather data is still returned to the client
    }
}
```

---

## Frontend: Coordinate Fallback

When `locationName` is `null` in the API response, display formatted
coordinates instead. Add `src/utils/coordinates.ts`:

```typescript
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}
```

Display in `WeatherCard` as: `locationName ?? formatCoordinates(lat, lon)`.

---

## Attribution

OpenStreetMap attribution is required whenever Nominatim data is displayed.
Add a small line below the location name, shown only when `locationName` is
non-null:

```tsx
<p className={styles.attribution}>
  ©{' '}
  <a
    href="https://www.openstreetmap.org/copyright"
    target="_blank"
    rel="noopener noreferrer"
  >
    OpenStreetMap contributors
  </a>
</p>
```

---

## Rate Limiting

Nominatim policy: **maximum 1 request per second** from a single IP.

For this app that is acceptable because:
- Requests are user-triggered (button click), not automated
- No polling or batch requests are made
- Each user session makes at most one geocoding call per refresh

Do not implement automatic retry — if the request fails, return `null`.
