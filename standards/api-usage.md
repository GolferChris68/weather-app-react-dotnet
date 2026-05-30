# Standards: API Usage

---

## General Rules

- External API calls are made **only from the backend** — never from the React frontend directly
- The frontend calls only the C# backend (`/api/weather`)
- The backend calls Open-Meteo — this is the only external API in v1

---

## No API Keys in Frontend

- No API keys, tokens, or secrets of any kind belong in frontend code
- This includes `.env` files that get bundled by Vite — anything prefixed `VITE_` is visible in the browser
- Open-Meteo requires no key, so this is not a risk in v1, but the pattern must be established correctly

---

## HttpClient

- Use ASP.NET Core's `IHttpClientFactory` / typed `HttpClient` — never `new HttpClient()`
- Register in `Program.cs` (see `standards/backend.md`)
- Set explicit timeouts — never rely on the default (infinite)
- Timeout: **10 seconds** for Open-Meteo calls

---

## Request Validation (Backend)

Validate incoming query parameters before calling Open-Meteo:

```csharp
if (lat < -90 || lat > 90) return Results.BadRequest("Invalid latitude.");
if (lon < -180 || lon > 180) return Results.BadRequest("Invalid longitude.");
```

Return `400 Bad Request` for invalid inputs — do not pass invalid coordinates to Open-Meteo.

---

## Response Handling

- Always check the HTTP status code before deserializing
- If Open-Meteo returns non-2xx, throw a `WeatherApiException` (caught by middleware)
- Use `response.EnsureSuccessStatusCode()` or an explicit check
- Deserialize with `System.Text.Json` — see `standards/backend.md`

---

## Retries

- Do not implement automatic retries in v1
- On failure, return an error response and let the user retry manually
- Automatic retry logic is a stretch goal

---

## Privacy

- Coordinates are user location data — treat them with care
- Do not log full-precision coordinates (round to 2 decimal places in logs)
- Do not store coordinates anywhere — requests are stateless
- Do not pass coordinates to any service other than Open-Meteo
