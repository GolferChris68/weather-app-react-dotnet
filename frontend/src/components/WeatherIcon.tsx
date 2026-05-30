import { getIconCategory } from '../utils/iconCategory';
import styles from './WeatherIcon.module.css';

type Props = { weatherCode: number };

// ── Shared SVG primitives ────────────────────────────────────────────

const STROKE = { strokeLinecap: 'round' as const, strokeWidth: 3.5 };

function SunDisc({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="var(--icon-sun)" />;
}

function SunRays({ cx, cy, inner, outer }: { cx: number; cy: number; inner: number; outer: number }) {
  return (
    <g className={styles.rotate} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * inner} y1={cy + Math.sin(a) * inner}
            x2={cx + Math.cos(a) * outer} y2={cy + Math.sin(a) * outer}
            stroke="var(--icon-sun)" {...STROKE}
          />
        );
      })}
    </g>
  );
}

function Cloud({ d, className }: { d: string; className?: string }) {
  return <path d={d} fill="var(--icon-cloud)" className={className} />;
}

function Snowflake({ cx, cy, className }: { cx: number; cy: number; className: string }) {
  return (
    <g className={className} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="var(--icon-snow)" strokeWidth={2} strokeLinecap="round" />
      <line x1={cx - 4.3} y1={cy - 2.5} x2={cx + 4.3} y2={cy + 2.5} stroke="var(--icon-snow)" strokeWidth={2} strokeLinecap="round" />
      <line x1={cx + 4.3} y1={cy - 2.5} x2={cx - 4.3} y2={cy + 2.5} stroke="var(--icon-snow)" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

// ── Cloud path constants ─────────────────────────────────────────────

// Large centred cloud (overcast)
const C_LARGE = 'M16,64 Q16,52 28,52 Q30,38 46,38 Q60,38 62,50 Q66,44 76,48 Q84,48 84,58 Q84,66 76,66 L24,66 Q16,66 16,64Z';

// Upper cloud for rain / snow / storm icons
const C_UPPER = 'M12,56 Q12,46 22,46 Q24,34 38,34 Q52,34 54,44 Q58,38 66,42 Q74,42 74,52 Q74,60 66,60 L20,60 Q12,60 12,56Z';

// Smaller cloud for "mainly clear" (lower-right quadrant)
const C_SMALL = 'M34,76 Q34,68 42,68 Q44,60 54,60 Q62,60 64,68 Q70,64 76,68 Q82,68 82,76 Q82,80 76,80 L40,80 Q34,80 34,76Z';

// Foreground cloud for "partly cloudy" (covers lower-right, overlaps sun)
const C_FRONT = 'M22,70 Q22,60 32,60 Q34,48 48,48 Q62,48 64,58 Q68,52 76,56 Q84,56 84,66 Q84,74 76,74 L30,74 Q22,74 22,70Z';

// ── Icon renderers ───────────────────────────────────────────────────

function IconClear() {
  return (
    <>
      <SunDisc cx={48} cy={48} r={16} />
      <SunRays cx={48} cy={48} inner={22} outer={34} />
    </>
  );
}

function IconMainlyClear() {
  return (
    <>
      <g className={styles.pulse} style={{ transformOrigin: '32px 36px' }}>
        <SunDisc cx={32} cy={36} r={12} />
        <SunRays cx={32} cy={36} inner={18} outer={27} />
      </g>
      <Cloud d={C_SMALL} className={styles.drift} />
    </>
  );
}

function IconPartlyCloudy() {
  return (
    <>
      <SunDisc cx={30} cy={38} r={16} />
      <SunRays cx={30} cy={38} inner={22} outer={32} />
      <Cloud d={C_FRONT} className={styles.drift} />
    </>
  );
}

function IconOvercast() {
  return <Cloud d={C_LARGE} className={styles.driftSlow} />;
}

function IconFoggy() {
  const lineProps = { strokeLinecap: 'round' as const, strokeWidth: 4, stroke: 'var(--icon-fog)' };
  return (
    <>
      <line x1="14" y1="36" x2="82" y2="36" className={styles.fog1} {...lineProps} />
      <line x1="20" y1="50" x2="76" y2="50" className={styles.fog2} {...lineProps} />
      <line x1="14" y1="64" x2="72" y2="64" className={styles.fog3} {...lineProps} />
    </>
  );
}

function IconRainy() {
  const dropProps = { strokeWidth: 2.5, strokeLinecap: 'round' as const, stroke: 'var(--icon-rain)' };
  return (
    <>
      <Cloud d={C_UPPER} />
      <line x1="28" y1="66" x2="24" y2="80" className={styles.drop1} {...dropProps} />
      <line x1="47" y1="66" x2="43" y2="80" className={styles.drop2} {...dropProps} />
      <line x1="64" y1="66" x2="60" y2="80" className={styles.drop3} {...dropProps} />
    </>
  );
}

function IconSnowy() {
  return (
    <>
      <Cloud d={C_UPPER} />
      <Snowflake cx={28} cy={74} className={styles.flake1} />
      <Snowflake cx={47} cy={76} className={styles.flake2} />
      <Snowflake cx={64} cy={74} className={styles.flake3} />
    </>
  );
}

function IconStormy() {
  return (
    <>
      <path d={C_UPPER} fill="var(--icon-cloud-dark)" />
      <polygon
        points="50,62 40,78 48,78 43,92 60,72 51,72"
        fill="var(--icon-lightning)"
        className={styles.lightning}
      />
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function WeatherIcon({ weatherCode }: Props) {
  const category = getIconCategory(weatherCode);

  const inner = (() => {
    switch (category) {
      case 'clear':         return <IconClear />;
      case 'mainly-clear':  return <IconMainlyClear />;
      case 'partly-cloudy': return <IconPartlyCloudy />;
      case 'overcast':      return <IconOvercast />;
      case 'foggy':         return <IconFoggy />;
      case 'rainy':         return <IconRainy />;
      case 'snowy':         return <IconSnowy />;
      case 'stormy':        return <IconStormy />;
    }
  })();

  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={styles.icon}
    >
      {inner}
    </svg>
  );
}
