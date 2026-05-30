# Skill: Wind Display

Use this skill when implementing any component or utility that displays wind speed or direction.

---

## Wind Direction: Degrees to Cardinal

The Open-Meteo API returns wind direction in meteorological degrees (0–360, where 0/360 = North, 90 = East, 180 = South, 270 = West).

Convert to 16-point cardinal labels using this lookup:

```typescript
export function degreesToCardinal(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
```

This gives 16-point precision (every 22.5°). Do not use 8-point (45° buckets) — it's too coarse.

---

## Display Format

Show wind as:

```
8 mph WSW (247°)
```

- Speed first, then cardinal label, then degrees in parentheses
- Always show degrees — useful for users who want precision
- If wind speed is 0 (or < 0.5 mph after rounding), show `"Calm"` and omit direction entirely

---

## Wind Speed Labels (Optional Descriptive Layer)

If a descriptive label is desired alongside mph, use the Beaufort scale thresholds:

| mph range | Label |
|---|---|
| 0–1 | Calm |
| 1–7 | Light Breeze |
| 8–12 | Gentle Breeze |
| 13–18 | Moderate Breeze |
| 19–24 | Fresh Breeze |
| 25–31 | Strong Breeze |
| 32–38 | Near Gale |
| 39+ | Gale or stronger |

These are **optional** in v1. Include only if the `WindDisplay` component has space without crowding.

---

## Component Interface

```typescript
interface WindDisplayProps {
  speedMph: number;
  directionDegrees: number;
}
```

The component handles all formatting internally. Callers pass raw numbers only.

---

## Accessibility

- The wind display must include an `aria-label` with the full readable string:
  `aria-label="Wind: 8 miles per hour, west-southwest"`
- Do not rely solely on abbreviations or icons for screen reader users
