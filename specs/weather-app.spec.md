# Spec: Weather App

**Version**: 1.2
**Status**: Ready for implementation
**Stack**: React (TypeScript) + ASP.NET Core 8 Minimal API + Open-Meteo + Nominatim

---

## 1. Overview

A single-page weather application that:
1. Requests the user's location via the browser Geolocation API
2. Sends coordinates to a C# backend API
3. Backend fetches current conditions from Open-Meteo and reverse-geocodes
   the coordinates to a human-readable location name via Nominatim
4. Frontend displays temperature (°F and °C), wind speed, wind direction,
   and the location name

There is no user authentication. No data is persisted. The app is stateless.

---

## 2. User Stories

### US-001 — Location Permission
> As a user, I want to grant location access so that the app can show weather for where I actually am.

**Acceptance Criteria:**
- On load, the app displays a prompt explaining why location is needed and a "Get My Weather" button
- Clicking the button triggers `navigator.geolocation.getCurrentPosition()`
- If permission is granted, the app proceeds to fetch weather
- If permission is denied, a clear error message is shown with instructions to enable location in their browser
- If geolocation is unavailable (non-HTTPS, unsupported browser), a fallback message is shown

### US-002 — Weather Display
> As a user, I want to see current weather conditions at my location.

**Acceptance Criteria:**
- Temperature is displayed in both °F and °C simultaneously (e.g. "72°F / 22°C")
- Wind speed is displayed in mph
- Wind direction is displayed as a cardinal or intercardinal label (N, NE, E, SE, S, SW, W, NW) alongside the degrees value
- A weather condition label is shown (e.g. "Clear", "Partly Cloudy", "Rain") derived from Open-Meteo's WMO weather code
- An animated weather icon is displayed alongside the condition label, sized and animated per the
  split-layout described in §6 and `skills/weather-icons.skill.md`
- Location name is displayed as "City, State" for US locations or "City, Country" for international
  locations (e.g. "Philadelphia, PA" or "London, United Kingdom"), derived from Nominatim reverse geocoding
- If reverse geocoding fails, display the coordinates as a fallback (e.g. "39.95°N, 75.16°W") —
  weather data must still render
- A "Refresh" button allows the user to re-fetch without reloading the page

### US-003 — Loading State
> As a user, I want to see feedback while the app is retrieving my weather.

**Acceptance Criteria:**
- A loading indicator appears after location is granted and while the backend call is in progress
- The loading state is accessible (not just a spinner with no label)

### US-004 — Error Handling
> As a user, I want clear messages when something goes wrong, not a broken page.

**Acceptance Criteria:**
- Location denied → message explaining how to re-enable location access
- Location unavailable → message indicating the device can't determine location
- Location timeout → message with a retry button
- Backend/network error → generic "unable to retrieve weather" message with a retry button
- No silent failures; every error path surfaces a user-facing message

---

## 3. Architecture

### 3.1 Frontend (React / TypeScript)

```
/frontend
  /src
    /components
      WeatherCard.tsx         # Main display component — split layout
      WeatherIcon.tsx         # Animated condition icon (pure CSS, no external deps)
      WindDisplay.tsx         # Wind speed + direction
      TemperatureDisplay.tsx  # Dual °F / °C display
      LoadingIndicator.tsx
      ErrorMessage.tsx
      LocationPrompt.tsx      # Initial CTA before permission granted
    /hooks
      useGeolocation.ts       # Encapsulates navigator.geolocation
      useWeather.ts           # Calls backend API, manages loading/error state
    /types
      weather.ts              # Shared TypeScript interfaces
    /utils
      windDirection.ts        # Degrees → cardinal conversion
      weatherCode.ts          # WMO code → label mapping
      coordinates.ts          # Coordinate fallback formatting
    App.tsx
    main.tsx
```

**State machine (high level):**
```
idle → requesting_location → fetching_weather → displaying | error
```

### 3.2 Backend (ASP.NET Core 8 Minimal API)

```
/backend
  Program.cs                  # App entry point, route definitions
  /Models
    WeatherResponse.cs        # Normalized response returned to frontend
    OpenMeteoResponse.cs      # Deserialization model for Open-Meteo
    NominatimResponse.cs      # Deserialization model for Nominatim
  /Services
    IWeatherService.cs
    WeatherService.cs         # Calls Open-Meteo, maps response
    IGeocodingService.cs      # Interface for reverse geocoding
    GeocodingService.cs       # Calls Nominatim, formats location name
  /Middleware
    ErrorHandlingMiddleware.cs
  appsettings.json
  appsettings.Development.json
```

**Single endpoint:**
```
GET /api/weather?lat={latitude}&lon={longitude}
```

Response schema:
```json
{
  "temperatureCelsius": 22.4,
  "temperatureFahrenheit": 72.3,
  "windSpeedMph": 8.1,
  "windDirectionDegrees": 247,
  "windDirectionCardinal": "WSW",
  "weatherCode": 2,
  "weatherLabel": "Partly Cloudy",
  "isDay": true,
  "locationName": "Philadelphia, PA",
  "fetchedAtUtc": "2026-05-29T14:23:00Z"
}
```

`locationName` is `null` if reverse geocoding fails; the frontend falls back
to formatted coordinates in that case.

Error response schema:
```json
{
  "error": "unable_to_retrieve_weather",
  "message": "Weather data could not be retrieved at this time."
}
```

### 3.3 Data Flow

```
Browser
  └─ navigator.geolocation.getCurrentPosition()
       └─ { lat, lon }
            └─ GET /api/weather?lat=X&lon=Y  (to C# backend)
                  ├─ GET https://api.open-meteo.com/v1/forecast?...          ─┐
                  └─ GET https://nominatim.openstreetmap.org/reverse?...      ┘ Task.WhenAll
                        └─ WeatherResponse (normalized, includes locationName)
                              └─ WeatherCard renders result
```

Both upstream calls are made in parallel via `Task.WhenAll`. A Nominatim
failure is non-fatal: log a warning and set `locationName` to `null`.

---

## 4. Open-Meteo Integration

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Required parameters:**
```
latitude={lat}
longitude={lon}
current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day
temperature_unit=celsius
wind_speed_unit=mph
```

**No API key required.**

Temperature conversion: backend receives Celsius from Open-Meteo and computes Fahrenheit as `(C × 9/5) + 32`, rounded to one decimal place.

WMO weather code mapping lives in `/frontend/src/utils/weatherCode.ts` (display concern) and is documented in `skills/weather-api-integration.skill.md`.

---

## 5. Nominatim Reverse Geocoding Integration

**Endpoint:** `https://nominatim.openstreetmap.org/reverse`

**Required parameters:**
```
format=json
lat={lat}
lon={lon}
zoom=10
addressdetails=1
```

`zoom=10` returns city-level granularity. Do not request finer detail.

**Required headers:**
```
User-Agent: WeatherApp/1.0
Accept-Language: en
```

Nominatim's Terms of Use require a descriptive `User-Agent`. Configure this
in `appsettings.json` as `"Nominatim:UserAgent"`.

**No API key required.** Rate limit: 1 request/second (acceptable for on-demand usage).

**Location name formatting:**
- US locations: `{city}, {state_code}` → `"Philadelphia, PA"`
- International: `{city}, {country}` → `"London, United Kingdom"`
- Fallback chain for place name: `city` → `town` → `village` → `county`
- If the call fails or returns no usable fields: set `locationName` to `null`

**Attribution:** The frontend must display "© OpenStreetMap contributors" when
a location name is shown. A small line below the location name is sufficient.

**Error handling:** Nominatim failure is non-fatal. Log a `Warning`, set
`locationName = null`, and return weather data normally.

See `skills/reverse-geocoding.skill.md` for full implementation details.

---

## 6. Weather Icon Display

### 6.1 Split Layout

The `WeatherCard` uses a three-zone layout:

```
┌──────────────────────────────────────┐
│           Philadelphia, PA           │  ← full-width location header
│         © OpenStreetMap…             │
├─────────────────┬────────────────────┤
│                 │  Clear Sky         │  ← left: icon  right: condition data
│   [  icon  ]   │  69.4°F / 20.8°C  │
│   (animated)   │  12.7 mph SSW      │
│                 │  (206°)            │
├─────────────────┴────────────────────┤
│    Updated at 10:54 PM   [Refresh]  │  ← full-width footer
└──────────────────────────────────────┘
```

- Left column: `WeatherIcon` component, fixed width ~120 px
- Right column: condition label, `TemperatureDisplay`, `WindDisplay` — all
  left-aligned within the column (`justify-content: flex-start` on the
  temperature container; no centering on any data-column child)
- Responsive: below 360 px viewport width, the two columns stack vertically
  (icon centered above data; data column switches to `align-items: center`
  and `text-align: center`)

### 6.2 WeatherIcon Component

```typescript
interface WeatherIconProps {
  weatherCode: number;
  isDay: boolean;
}
```

`isDay` is sourced from Open-Meteo's `is_day` field (1 = day, 0 = night), mapped to a boolean by the backend and passed through `WeatherData`.

The icon is **decorative** — it supplements the text label, which is the
authoritative description. Mark it `aria-hidden="true"`. Do not add an
`aria-label` to the icon itself; the adjacent condition text already
conveys the meaning.

### 6.3 Icon Categories

Map WMO codes to one of 8 visual categories. Each category has a distinct
SVG shape and CSS animation. The first three categories have day and night
variants driven by the `isDay` prop:

| Category | WMO Codes | Day shape | Night shape | Animation |
|---|---|---|---|---|
| `clear` | 0 | Sun disc + rays | Crescent moon | Rays rotate slowly (60 s); moon is static |
| `mainly-clear` | 1 | Sun + small cloud | Moon + small cloud | Day: sun pulses (4 s); Night: cloud drifts (6 s) |
| `partly-cloudy` | 2 | Sun half-behind cloud | Moon half-behind cloud | Cloud drifts left/right (6 s) |
| `overcast` | 3 | Flat cloud | — (same) | Cloud drifts left/right (8 s) |
| `foggy` | 45, 48 | Three wavy lines | — (same) | Lines fade in/out in sequence (3 s) |
| `rainy` | 51–65, 80–82 | Cloud + raindrops | — (same) | Drops fall and fade (1.2 s staggered) |
| `snowy` | 71–77, 85–86 | Cloud + snowflakes | — (same) | Flakes fall and rotate (2 s staggered) |
| `stormy` | 95, 96, 99 | Dark cloud + lightning | — (same) | Lightning flashes (3 s) |

Any unmapped code renders the `overcast` icon as a safe fallback.

### 6.4 Implementation Rules

- **No external packages** — icons are inline SVG rendered by React, animated
  with CSS `@keyframes` in a `.module.css` file
- **No `<img>` tags** for the icons — inline SVG only, so CSS animations apply
- Animations must **respect `prefers-reduced-motion`**: wrap all `@keyframes`
  usage in a `@media (prefers-reduced-motion: no-preference)` block so motion
  is opt-in, not opt-out
- Icon size: `96px × 96px` in the split layout; scales down to `72px` on
  narrow viewports
- Colors: use CSS custom properties from `index.css` so icons respect any
  future theme changes

See `skills/weather-icons.skill.md` for SVG shapes, keyframe patterns, and
the full WMO code → category mapping.

---

## 7. CORS Configuration

The backend must allow requests from the React dev server (`http://localhost:5173`) in development. In production, CORS should be restricted to the actual frontend origin.

Configure in `Program.cs` using named CORS policies.

---

## 8. Open Questions

| # | Question | Status |
|---|---|---|
| OQ-1 | Should the location name be reverse-geocoded? If so, which API? | **Resolved: Nominatim (see §5)** |
| OQ-2 | Should weather auto-refresh on a timer (e.g. every 10 min)? Or manual refresh only? | Open — manual refresh only for now |
| OQ-3 | Should the app support a manual location entry fallback (city name or zip)? | Stretch goal — implement only if US-001–004 are complete |

---

## 9. Non-Goals (Out of Scope)

- Forecast / multi-day weather
- User accounts or saved locations
- Push notifications
- Native mobile app (web only)
- Offline support

---

## 10. Stretch Goals (Do Not Implement Until Core Is Complete)

- Dark/light mode toggle
- Manual location search fallback (OQ-3)
- Auto-refresh timer (OQ-2)
