import styles from './TemperatureDisplay.module.css';

type Props = {
  fahrenheit: number;
  celsius: number;
};

export function TemperatureDisplay({ fahrenheit, celsius }: Props) {
  return (
    <div
      className={styles.container}
      aria-label={`Temperature: ${fahrenheit} degrees Fahrenheit, ${celsius} degrees Celsius`}
    >
      <span className={styles.primary}>{fahrenheit}°F</span>
      <span className={styles.separator}>/</span>
      <span className={styles.secondary}>{celsius}°C</span>
    </div>
  );
}
