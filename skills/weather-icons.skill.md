# Skill: Weather Icons (Animated, Pure CSS)

Use this skill when implementing `WeatherIcon.tsx` and its accompanying
CSS module. It covers SVG shapes, keyframe patterns, the WMO → category
mapping, the split-card layout, and accessibility rules.

---

## Overview

Icons are inline SVG elements rendered by a React component and animated
with CSS `@keyframes`. No external packages, no `<img>` tags, no icon
fonts. This keeps the bundle small and lets CSS custom properties control
colours for future theming.

---

## Component Interface

```typescript
interface WeatherIconProps {
  weatherCode: number;
  isDay: boolean;
}

export function WeatherIcon({ weatherCode, isDay }: WeatherIconProps) { … }
```

`isDay` comes from Open-Meteo's `is_day` field, mapped to a boolean by the
backend (`IsDay = current.IsDay == 1`). Use it to select day vs. night
variants for `clear`, `mainly-clear`, and `partly-cloudy` icons. All other
categories (overcast, foggy, rainy, snowy, stormy) render the same
regardless of time of day.

The icon is **purely decorative** — the adjacent condition text label is
the authoritative description. Always render with `aria-hidden="true"`.
Never add `aria-label` to the icon itself.

---

## WMO Code → Category Mapping

```typescript
export type IconCategory =
  | 'clear'
  | 'mainly-clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'foggy'
  | 'rainy'
  | 'snowy'
  | 'stormy';

export function getIconCategory(code: number): IconCategory {
  if (code === 0)                          return 'clear';
  if (code === 1)                          return 'mainly-clear';
  if (code === 2)                          return 'partly-cloudy';
  if (code === 3)                          return 'overcast';
  if (code === 45 || code === 48)          return 'foggy';
  if ([51,53,55,61,63,65,80,81,82]
      .includes(code))                     return 'rainy';
  if ([71,73,75,77,85,86].includes(code)) return 'snowy';
  if (code === 95 || code === 96
      || code === 99)                      return 'stormy';
  return 'overcast'; // safe fallback for any unmapped code
}
```

---

## SVG Shapes

All icons fit a `96 × 96` viewBox. Use CSS custom properties for colour
so the icons inherit any future theme changes.

### `clear` (day) — Sun with rays

```tsx
// Disc at centre; rays group uses styles.rotate (CSS handles transform-box).
// IMPORTANT: Do NOT add an inline transformOrigin to the rays <g>.
// CSS sets transform-box:fill-box + transform-origin:center, which is
// interpreted relative to the fill-box. An inline pixel value would be
// offset from the fill-box origin, not the SVG viewport, causing the
// rotation to orbit around the wrong point.
<SunDisc cx={48} cy={48} r={16} />
<SunRays cx={48} cy={48} inner={22} outer={34} />  {/* rays rotate 60 s */}
```

### `clear` (night) — Crescent moon

```tsx
// SVG mask: outer disc minus an offset inner disc to create a crescent.
// Use a single static mask ID — only one WeatherIcon renders at a time.
<defs>
  <mask id="weather-icon-moon-mask">
    <circle cx={48} cy={48} r={18} fill="white" />
    <circle cx={56} cy={42} r={14} fill="black" />  {/* offset = r*0.44, r*0.33 */}
  </mask>
</defs>
<circle cx={48} cy={48} r={18} fill="var(--icon-moon)" mask="url(#weather-icon-moon-mask)" />
```

Inner circle offset formula: `ox = round(r * 0.44)`, `oy = round(r * 0.33)`,
`innerR = round(r * 0.78)`. Apply consistently for all moon sizes.

### `mainly-clear` (day) — Sun with small cloud

Sun (cx=32, cy=36, r=12) in top-left, small cloud in bottom-right. Sun
group uses `styles.pulse` — **no inline transformOrigin** (same reason as
rays: CSS `fill-box + center` handles it correctly). Cloud drifts (6 s).

### `mainly-clear` (night) — Moon with small cloud

Moon (cx=32, cy=36, r=12) in top-left, same small cloud in bottom-right.
No pulse animation. Cloud drifts (6 s).

### `partly-cloudy` (day) — Sun behind cloud

Sun (cx=30, cy=38, r=16) partially occluded by a larger cloud in the
foreground. Cloud drifts horizontally (6 s).

### `partly-cloudy` (night) — Moon behind cloud

Moon (cx=30, cy=38, r=14) in the same position as the day sun, occluded
by the same foreground cloud. Cloud drifts horizontally (6 s).

### `overcast` — Flat cloud

A single rounded cloud shape centred in the viewBox. Drifts slowly left
and right.

```svg
<!-- Cloud path — rounded rectangle with bumps on top -->
<path d="M24 60 Q24 44 38 44 Q40 34 52 34 Q64 34 66 44 Q76 44 76 56 Q76 64 66 64 H30 Q24 64 24 60Z"
      fill="var(--icon-cloud)" />
```

### `foggy` — Three horizontal wavy lines

Three `<path>` elements with gentle S-curves, stacked vertically,
fading in and out in sequence with staggered `animation-delay`.

### `rainy` — Cloud + falling drops

Cloud shape (same as overcast but positioned in the upper half) plus
3–4 short `<line>` elements below it representing raindrops. Drops
animate downward and fade out, looping with staggered delays.

```css
/* Each drop shifts down ~12px and fades */
@keyframes fall {
  0%   { transform: translateY(0);    opacity: 1; }
  80%  { transform: translateY(12px); opacity: 0.2; }
  100% { transform: translateY(12px); opacity: 0; }
}
```

### `snowy` — Cloud + snowflakes

Cloud shape plus 3–4 small `*` or 6-pointed snowflake `<path>` elements.
Each flake falls and rotates slightly, with staggered delays.

```css
@keyframes snowfall {
  0%   { transform: translateY(0)    rotate(0deg);   opacity: 1; }
  100% { transform: translateY(14px) rotate(45deg);  opacity: 0; }
}
```

### `stormy` — Dark cloud + lightning bolt

Dark cloud (use `var(--icon-cloud-dark)`) plus a simple `<polygon>`
lightning bolt below the cloud. Lightning flashes by toggling opacity.

```css
@keyframes flash {
  0%, 90%, 100% { opacity: 1; }
  92%, 98%      { opacity: 0; }
}
```

---

## CSS Custom Properties

Add these to `:root` in `index.css`:

```css
:root {
  --icon-sun:        #f59e0b;   /* amber-400 */
  --icon-cloud:      #94a3b8;   /* slate-400 */
  --icon-cloud-dark: #475569;   /* slate-600 */
  --icon-rain:       #60a5fa;   /* blue-400  */
  --icon-snow:       #bfdbfe;   /* blue-200  */
  --icon-lightning:  #fbbf24;   /* amber-400 */
  --icon-fog:        #cbd5e1;   /* slate-300 */
  --icon-moon:       #e2e8f0;   /* slate-200 — silvery crescent */
}
```

---

## Animation Rules

### transform-box and transform-origin

Classes `.rotate`, `.pulse`, `.drift`, `.driftSlow` all set
`transform-box: fill-box; transform-origin: center` in the CSS module.
With `fill-box`, any **inline** `transformOrigin` value in pixels is
interpreted relative to the element's own bounding box, not the SVG
viewport. This causes the animation pivot to be offset from the intended
centre. **Never add an inline `style={{ transformOrigin: … }}`** to a
`<g>` that carries one of these classes — the CSS alone is sufficient.

For elements whose keyframe includes `rotate()` but that are **not** in
the `fill-box` classes (e.g. individual snowflakes animated with
`translateY + rotate`), the inline `transformOrigin` **is correct** because
those elements default to `transform-box: view-box`, so the pixel value
is interpreted in SVG viewport coordinates.

### Reduced motion

Wrap all `@keyframes` usage in a `prefers-reduced-motion` media query.
Static icons must still look correct with no motion:

```css
/* Define keyframes unconditionally so names resolve */
@keyframes rotate    { … }
@keyframes drift     { … }
@keyframes fall      { … }
@keyframes snowfall  { … }
@keyframes flash     { … }
@keyframes fogFade   { … }

/* Only apply animation when the user hasn't opted out */
@media (prefers-reduced-motion: no-preference) {
  .rotate   { animation: rotate  60s linear    infinite; }
  .drift    { animation: drift    8s ease-in-out infinite alternate; }
  .raindrop { animation: fall    1.2s ease-in   infinite; }
  .snowflake{ animation: snowfall 2s ease-in    infinite; }
  .lightning{ animation: flash    3s ease-in-out infinite; }
  .fogLine  { animation: fogFade  3s ease-in-out infinite; }
}
```

### Staggered delays

For multi-element animations (raindrops, snowflakes, fog lines), apply
`animation-delay` inline or via `:nth-child` to avoid synchronised motion:

```css
.raindrop:nth-child(2) { animation-delay: 0.4s; }
.raindrop:nth-child(3) { animation-delay: 0.8s; }
```

---

## Split Layout (WeatherCard)

The `WeatherCard` body uses CSS Grid:

```css
.body {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0 1.25rem;
  align-items: center;
}

/* Stack on narrow viewports */
@media (max-width: 360px) {
  .body {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
```

DOM structure:

```tsx
<div className={styles.card}>
  {/* Full-width header */}
  <div className={styles.header}>
    <p className={styles.location}>{locationDisplay}</p>
    {showAttribution && <p className={styles.attribution}>…</p>}
  </div>

  {/* Two-column body */}
  <div className={styles.body}>
    <WeatherIcon weatherCode={data.weatherCode} />
    <div className={styles.data}>
      <p className={styles.condition}>{data.weatherLabel}</p>
      <TemperatureDisplay … />
      <WindDisplay … />
    </div>
  </div>

  {/* Full-width footer */}
  <div className={styles.footer}>
    <p className={styles.fetchedAt}>Updated at {fetchedAt}</p>
    <button className={styles.refreshButton} …>Refresh</button>
  </div>
</div>
```

---

## Accessibility Checklist

- [ ] `WeatherIcon` renders with `aria-hidden="true"` on the `<svg>`
- [ ] No `role` or `aria-label` on the icon (condition text already conveys meaning)
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Icon colours meet 3:1 contrast against the card background (decorative
      exception applies, but aim for it anyway)
- [ ] Icon does not convey information not also present in text
