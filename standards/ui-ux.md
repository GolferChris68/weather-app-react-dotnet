# Standards: UI/UX

---

## Temperature Display

- Always display both Celsius and Fahrenheit simultaneously
- Format: `72°F / 22°C`
- °F first, °C second (primary audience is US-based, but both are shown)
- Round to one decimal place: `72.3°F / 22.4°C`
- Never display just one unit — both must always appear together

---

## Wind Display

Follow `skills/wind-display.skill.md` for full conventions. Summary:
- Format: `8 mph WSW (247°)`
- If calm (< 0.5 mph): show `"Calm"`, omit direction
- See skill for cardinal conversion table

---

## Loading States

- Show a loading indicator immediately after location is granted
- Loading indicator must include visible text (e.g. "Fetching weather…"), not just a spinner
- Add `role="status"` and `aria-live="polite"` to the loading container

---

## Layout

- Single-column, centered layout optimized for mobile and desktop
- Maximum content width: 480px
- Generous whitespace — this is a focused, single-purpose app
- No navigation, no sidebar, no header/footer chrome

---

## Typography

- Use a system font stack or a single web font — nothing elaborate
- Temperature is the hero: display it large (2rem+)
- Weather label (e.g. "Partly Cloudy") is secondary: slightly smaller, muted color
- Wind and metadata are tertiary: small, subdued

---

## Color

- Keep it simple: light background, dark text, one accent color for interactive elements
- Error messages: use a warm red/amber tone, not harsh red
- Loading state: neutral/muted, not alarming

---

## Buttons

- "Get My Weather" — primary CTA, prominent, full-width on mobile
- "Refresh" — secondary, smaller, positioned near the weather data
- "Retry" — appears in error states, same secondary style as Refresh
- All buttons must be at least 44×44px tap target (accessibility)

---

## Accessibility

- All images/icons must have `alt` text or `aria-label`
- Color is never the sole indicator of meaning
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- All interactive elements reachable and operable via keyboard
- Focus styles must be visible — do not remove `:focus` outlines without replacing them

---

## Responsive Behavior

- Mobile-first CSS
- No horizontal scrolling at any viewport width
- Content remains readable at 320px wide minimum
