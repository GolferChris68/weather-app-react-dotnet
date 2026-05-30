# Standards: Error Handling

---

## Principles

1. **No silent failures** — every error path must surface a user-facing message
2. **No technical details to users** — never expose exception messages, stack traces, or API internals
3. **Recoverable errors get a retry** — if the user can reasonably try again, give them a button
4. **Non-recoverable errors get guidance** — explain what went wrong and what they can do

---

## Error Categories

### Geolocation Errors (Frontend)

| Condition | User Message | Action Offered |
|---|---|---|
| API unavailable (non-HTTPS / unsupported browser) | "Location access is not available in this browser. Please try a supported browser over HTTPS." | None |
| Permission denied (code 1) | "Location access was denied. To use this app, please enable location permissions in your browser settings." | Link to browser help (optional) |
| Position unavailable (code 2) | "Your location could not be determined. Please check your device's location settings and try again." | Retry button |
| Timeout (code 3) | "The location request timed out. Please try again." | Retry button |

### Network / Backend Errors (Frontend)

| Condition | User Message | Action Offered |
|---|---|---|
| Fetch failed (no network) | "Unable to retrieve weather. Please check your internet connection and try again." | Retry button |
| Backend returned error (4xx/5xx) | "Unable to retrieve weather at this time. Please try again." | Retry button |
| Response parse error | "An unexpected error occurred. Please try again." | Retry button |

### Backend Errors (C# — what to return to client)

The backend always returns one of two HTTP responses:
- `200 OK` with a valid `WeatherResponse`
- `500 Internal Server Error` with:
  ```json
  { "error": "unable_to_retrieve_weather", "message": "Weather data could not be retrieved at this time." }
  ```

The backend must never return Open-Meteo error details, raw exception messages, or stack traces.

---

## Frontend Error State Pattern

Use a discriminated union for error state in hooks:

```typescript
type WeatherError =
  | { type: 'geolocation'; code: 1 | 2 | 3 }
  | { type: 'network' }
  | { type: 'api' }
  | { type: 'parse' };
```

The `ErrorMessage` component maps these to the user-facing strings above.

---

## Retry Behavior

- Retry is always **manual** (user clicks a button) — never automatic in v1
- Retrying geolocation re-calls `navigator.geolocation.getCurrentPosition()`
- Retrying a network/API error re-calls the backend with the same coordinates
- The loading state is shown immediately on retry

---

## Logging (Backend)

Log errors server-side with context, but sanitize before logging:
- Round coordinates to 2 decimal places before logging
- Log the Open-Meteo HTTP status code, not the response body
- Use `ILogger.LogError(exception, "message")` — not `LogError(message + exception.Message)`
