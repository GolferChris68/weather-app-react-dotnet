# AGENTS.md — Weather App

This is the entry point for any AI agent working in this repository. Read this file first, then navigate to the relevant spec, skills, and standards before writing any code.

---

## Project Overview

A full-stack weather application with:
- **Frontend**: React (TypeScript)
- **Backend**: C# / ASP.NET Core Minimal API

The app detects the user's current location via the browser Geolocation API, calls a backend endpoint, which in turn queries the Open-Meteo API for current weather conditions, and displays temperature (°F and °C) and wind speed/direction.

---

## Repository Structure

```
/
├── AGENTS.md                          ← You are here
├── specs/
│   └── weather-app.spec.md            ← Primary feature spec (start here)
├── skills/
│   ├── geolocation.skill.md           ← How to use the browser Geolocation API
│   ├── weather-api-integration.skill.md ← How to call Open-Meteo from the backend
│   └── wind-display.skill.md          ← Wind direction/speed display conventions
├── standards/
│   ├── backend.md                     ← C# / ASP.NET Core conventions
│   ├── frontend.md                    ← React / TypeScript conventions
│   ├── error-handling.md              ← Error categories, messaging, retry rules
│   ├── ui-ux.md                       ← Visual standards, units, accessibility
│   └── api-usage.md                   ← External API usage rules
└── guardrails/
    └── guardrails.md                  ← Hard stops — read before writing any code
```

---

## Agent Workflow

1. **Read `guardrails/guardrails.md` first** — non-negotiable constraints
2. **Read `specs/weather-app.spec.md`** — your primary work order
3. **Read all relevant skills** before implementing any feature they cover
4. **Follow all standards** in `/standards/` throughout implementation
5. **Do not invent architecture** not described in the spec — open questions are listed; leave them as TODOs or ask before deciding

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18+, TypeScript, Vite |
| Backend | C# 12, ASP.NET Core 8 Minimal API |
| Weather API | Open-Meteo (no API key required) |
| Styling | CSS Modules or Tailwind CSS |
| Testing | xUnit (backend), Vitest (frontend) |

---

## Definition of Done

- [ ] User can grant location permission and see current weather
- [ ] Temperature displays in both °F and °C simultaneously
- [ ] Wind speed and cardinal direction display correctly
- [ ] All error states (permission denied, API failure, network failure) show user-friendly messages
- [ ] Backend never exposes internal error details to the client
- [ ] No API keys or secrets exist in frontend code
- [ ] App builds and runs locally with `dotnet run` (backend) and `npm run dev` (frontend)
