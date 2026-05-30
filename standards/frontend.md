# Standards: Frontend (React / TypeScript)

---

## Framework & Tooling

- React 18+
- TypeScript (strict mode)
- Vite as build tool

```bash
npm create vite@latest weather-app-frontend -- --template react-ts
```

---

## TypeScript

Enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

- No `any` types — use `unknown` and narrow appropriately
- All props interfaces must be explicitly defined
- Prefer `type` over `interface` for component props; use `interface` for data models

---

## Component Conventions

- One component per file
- File name matches component name (PascalCase): `WeatherCard.tsx`
- Functional components only — no class components
- Use named exports, not default exports (except `App.tsx` and `main.tsx`)

---

## State Management

- Use React built-ins: `useState`, `useReducer`, `useContext`
- No external state library (Redux, Zustand, etc.) in v1
- Encapsulate related state + logic in custom hooks under `/src/hooks/`

---

## Custom Hooks

- Hook names start with `use`: `useGeolocation`, `useWeather`
- Each hook has a single responsibility
- Hooks must not contain JSX
- See `skills/geolocation.skill.md` for the `useGeolocation` hook pattern

---

## API Calls

- All backend calls go through a single utility or hook — never fetch directly inside a component
- Use the native `fetch` API (no Axios in v1)
- Always handle loading, success, and error states explicitly
- Backend base URL comes from a Vite environment variable:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';
```

Define `VITE_API_BASE_URL` in `.env.local` for development.

---

## Styling

- Use CSS Modules (`.module.css`) for component-scoped styles
- No inline styles except for truly dynamic values (e.g. a rotation angle)
- No global CSS except for resets and CSS custom properties in `index.css`

---

## Accessibility

- All interactive elements must be keyboard-accessible
- Buttons must have descriptive text or `aria-label`
- Loading indicators must include `role="status"` and a text label
- See `standards/ui-ux.md` for display formatting

---

## Error Boundaries

Wrap the app in a top-level React Error Boundary to catch unexpected render errors. Do not rely on the Vite error overlay in production.

---

## Testing

- Use Vitest for unit tests
- Test utility functions (`windDirection.ts`, `weatherCode.ts`) thoroughly
- Test hooks using `@testing-library/react`
- Do not test implementation details — test behavior
