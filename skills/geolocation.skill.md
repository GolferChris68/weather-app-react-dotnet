# Skill: Geolocation

Use this skill when implementing any feature that uses `navigator.geolocation`.

---

## Overview

The browser Geolocation API is asynchronous, permission-gated, and has three distinct failure modes. Agents frequently conflate these or handle only the happy path. This skill documents correct usage.

---

## API Usage

Always use `getCurrentPosition` (not `watchPosition`) for this app, since we fetch on demand.

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // proceed with { latitude, longitude }
  },
  (error) => {
    // handle error by error.code — see below
  },
  {
    enableHighAccuracy: false,  // false is fine for weather; faster + less battery
    timeout: 10000,             // 10 seconds
    maximumAge: 60000           // accept a cached position up to 1 minute old
  }
);
```

---

## Error Codes

The `GeolocationPositionError` object has a `code` property. Handle all three:

| Code | Constant | Meaning | User Message |
|------|----------|---------|--------------|
| 1 | `PERMISSION_DENIED` | User denied the request | "Location access was denied. Please enable location permissions in your browser settings and try again." |
| 2 | `POSITION_UNAVAILABLE` | Device can't determine location | "Your location could not be determined. Please check your device's location settings." |
| 3 | `TIMEOUT` | Took longer than `timeout` ms | "Location request timed out. Please try again." |

Never expose raw error codes or technical messages to the user.

---

## Availability Check

Always check for API availability before calling it:

```typescript
if (!navigator.geolocation) {
  // Show unavailable message — likely non-HTTPS or unsupported browser
  return;
}
```

---

## Hook Pattern

Encapsulate in a custom hook `useGeolocation`:

```typescript
type GeolocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'success'; latitude: number; longitude: number }
  | { status: 'error'; code: 1 | 2 | 3; message: string };
```

The hook should expose `{ state, requestLocation }` where `requestLocation` is called on user action (button click), not on mount. Never call `getCurrentPosition` automatically on page load — always require explicit user action.

---

## HTTPS Requirement

`navigator.geolocation` only works on secure origins (HTTPS or localhost). The app will be served over HTTPS in production. In development, `localhost` is treated as secure by all major browsers.

---

## Output Format

Pass coordinates downstream as:
```typescript
{ latitude: number; longitude: number }
```

Both are standard decimal degrees. Do not round or truncate — pass the full precision from the Geolocation API to the backend.
