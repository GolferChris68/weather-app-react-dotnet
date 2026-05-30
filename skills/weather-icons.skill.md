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
}

export function WeatherIcon({ weatherCode }: WeatherIconProps) { … }
```

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

### `clear` — Sun with rays

```svg
<svg viewBox="0 0 96 96" aria-hidden="true">
  <!-- Disc -->
  <circle cx="48" cy="48" r="18" fill="var(--icon-sun)" />
  <!-- 8 rays as a group that rotates -->
  <g class={styles.rotate}>
    <line x1="48" y1="8"  x2="48" y2="20" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="48" y1="76" x2="48" y2="88" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="8"  y1="48" x2="20" y2="48" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="76" y1="48" x2="88" y2="48" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="19" y1="19" x2="28" y2="28" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="68" y1="68" x2="77" y2="77" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="77" y1="19" x2="68" y2="28" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
    <line x1="28" y1="68" x2="19" y2="77" stroke="var(--icon-sun)" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
```

### `mainly-clear` — Sun with small cloud

Same sun as above (smaller, offset to top-left at cx=38 cy=38 r=14),
plus a small white cloud shape in the bottom-right quadrant. Sun pulses
gently.

### `partly-cloudy` — Sun behind cloud

Sun (cx=34 cy=40 r=16) partially occluded by a larger cloud in the
foreground. Cloud drifts horizontally.

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
}
```

---

## Animation Rules

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
