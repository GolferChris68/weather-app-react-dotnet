# Weather App

A full-stack weather application that shows current conditions at your location — with an animated condition icon, dual-unit temperature, wind, and reverse-geocoded location name.

## UI

The weather card uses a three-zone layout:

```
┌─────────────────────────────────────┐
│          Philadelphia, PA           │
│        © OpenStreetMap…             │
├──────────────┬──────────────────────┤
│              │  Clear Sky           │
│   ☀ (anim) │  69.1°F / 20.6°C    │
│              │  12 mph SSW (209°)   │
├──────────────┴──────────────────────┤
│  Updated at 11:08 PM    [Refresh]  │
└─────────────────────────────────────┘
```

Eight animated SVG icons cover all WMO weather codes — rotating sun, drifting clouds, falling rain, falling snow, fading fog lines, and flashing lightning. All animations respect `prefers-reduced-motion`.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, CSS Modules |
| Backend | C# 12, ASP.NET Core Minimal API (.NET 10) |
| Weather data | [Open-Meteo](https://open-meteo.com/) (no API key required) |
| Reverse geocoding | [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org/) (no API key required) |

## Features

- Requests browser location with an explicit user action (no silent auto-request)
- Animated SVG weather icon matched to current conditions (8 categories, pure CSS — no external packages)
- Temperature in both **°F and °C** simultaneously
- Wind speed in mph with 16-point cardinal direction (e.g. `12 mph SSW (209°)`)
- Reverse-geocoded location name (e.g. `Philadelphia, PA`); falls back to coordinates if unavailable
- Full error handling for all geolocation and network failure modes
- Accessible: `aria-hidden` on decorative icons, `role="status"`, `aria-live`, visible focus styles throughout

## Project Structure

```
/
├── backend/                   # ASP.NET Core Minimal API
│   ├── Models/
│   │   ├── WeatherResponse.cs
│   │   ├── OpenMeteoResponse.cs
│   │   └── NominatimResponse.cs
│   ├── Services/
│   │   ├── WeatherService.cs      # Calls Open-Meteo
│   │   └── GeocodingService.cs    # Calls Nominatim (non-fatal on failure)
│   ├── Middleware/
│   │   └── ErrorHandlingMiddleware.cs
│   └── Program.cs
│
├── frontend/                  # React / TypeScript / Vite
│   └── src/
│       ├── components/        # WeatherCard, WeatherIcon, WindDisplay, TemperatureDisplay, …
│       ├── hooks/             # useGeolocation, useWeather
│       ├── utils/             # windDirection, weatherCode, iconCategory, coordinates
│       └── types/             # weather.ts
│
├── specs/                     # Feature spec (v1.2)
├── skills/                    # Implementation guides (geolocation, wind, geocoding, icons)
├── standards/                 # Code standards (frontend, backend, error handling, UI/UX)
└── guardrails/                # Hard constraints for AI-assisted development
```

## Running Locally

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)

### Backend

```bash
cd backend
dotnet run
# Listening on http://localhost:5044
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

The frontend is pre-configured to point at `http://localhost:5044` via `.env.local` (not committed — create it if needed):

```
VITE_API_BASE_URL=http://localhost:5044
```

## API

```
GET /api/weather?lat={latitude}&lon={longitude}
```

```json
{
  "temperatureCelsius": 21.2,
  "temperatureFahrenheit": 70.2,
  "windSpeedMph": 13.3,
  "windDirectionDegrees": 207,
  "windDirectionCardinal": "SSW",
  "weatherCode": 0,
  "weatherLabel": "Clear Sky",
  "locationName": "Philadelphia, PA",
  "fetchedAtUtc": "2026-05-30T02:39:00Z"
}
```

`locationName` is `null` if reverse geocoding fails; the frontend falls back to formatted coordinates.

## Design Decisions

- **No API keys** — both Open-Meteo and Nominatim are free and keyless
- **No external icon packages** — weather icons are inline SVG animated with CSS `@keyframes`
- **Backend-only external calls** — the frontend never calls third-party APIs directly
- **Parallel upstream requests** — weather and geocoding calls run concurrently via `Task.WhenAll`
- **Non-fatal geocoding** — a Nominatim failure logs a warning and returns `null`; weather data is always returned
- **No auto-location** — `getCurrentPosition()` is only called on explicit user action

## Attribution

Location names provided by [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors via Nominatim.
