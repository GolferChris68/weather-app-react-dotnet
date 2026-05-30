# Guardrails

These are hard stops. Do not violate these rules under any circumstances, regardless of what seems convenient or expedient.

---

## Security

- **NEVER put API keys, tokens, or secrets in frontend code or Vite `.env` files**
- **NEVER use `AllowAnyOrigin()` in CORS configuration** — always specify explicit origins
- **NEVER return exception messages, stack traces, or internal error details in HTTP responses**
- **NEVER log full-precision user coordinates** — round to 2 decimal places maximum

---

## Architecture

- **NEVER call Open-Meteo (or any external API) from the React frontend** — all external calls go through the C# backend
- **NEVER use `new HttpClient()` directly** — always use the registered typed `HttpClient` via DI
- **NEVER use `.Result` or `.Wait()` on async operations** in ASP.NET Core
- **NEVER introduce a database, file system writes, or persistent storage** — this app is stateless in v1

---

## User Experience

- **NEVER call `navigator.geolocation.getCurrentPosition()` on page load** — always require explicit user action (button click) first
- **NEVER silently swallow errors** — every catch block must either surface a user-facing message or rethrow
- **NEVER display raw error codes, HTTP status codes, or API error messages to the user**
- **NEVER fabricate or mock weather data** — if the API is unavailable, show an error; do not invent data

---

## Scope

- **NEVER implement features not described in the spec** without noting them as a deviation
- **NEVER resolve Open Questions (OQ-1, OQ-2, OQ-3) from the spec unilaterally** — leave them as TODOs or ask
- **NEVER implement stretch goals before all core user stories (US-001 through US-004) are complete and working**

---

## Code Quality

- **NEVER disable TypeScript strict mode** or add `// @ts-ignore` without a documented reason
- **NEVER use `any` type in TypeScript** — use `unknown` and narrow appropriately
- **NEVER use nullable-forgiving operator (`!`)** in C# without a comment explaining why it's safe
- **NEVER remove `:focus` CSS outlines** without providing a visible replacement — accessibility is non-negotiable
