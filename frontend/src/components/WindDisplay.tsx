import styles from './WindDisplay.module.css';

type Props = {
  speedMph: number;
  directionDegrees: number;
  directionCardinal: string;
};

const CARDINAL_NAMES: Record<string, string> = {
  N: 'north',
  NNE: 'north-northeast',
  NE: 'northeast',
  ENE: 'east-northeast',
  E: 'east',
  ESE: 'east-southeast',
  SE: 'southeast',
  SSE: 'south-southeast',
  S: 'south',
  SSW: 'south-southwest',
  SW: 'southwest',
  WSW: 'west-southwest',
  W: 'west',
  WNW: 'west-northwest',
  NW: 'northwest',
  NNW: 'north-northwest',
};

export function WindDisplay({ speedMph, directionDegrees, directionCardinal }: Props) {
  const isCalm = speedMph < 0.5;
  const directionName = CARDINAL_NAMES[directionCardinal] ?? directionCardinal;

  const ariaLabel = isCalm
    ? 'Wind: Calm'
    : `Wind: ${speedMph} miles per hour, ${directionName}`;

  return (
    <p className={styles.wind} aria-label={ariaLabel}>
      {isCalm ? (
        'Calm'
      ) : (
        <>
          {speedMph} mph {directionCardinal}{' '}
          <span className={styles.degrees}>({directionDegrees}°)</span>
        </>
      )}
    </p>
  );
}
