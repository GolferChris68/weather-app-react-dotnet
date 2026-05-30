import styles from './LocationPrompt.module.css';

type Props = {
  onRequest: () => void;
};

export function LocationPrompt({ onRequest }: Props) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Weather</h1>
      <p className={styles.description}>
        This app uses your current location to show you real-time weather conditions.
        Your location is only used to fetch weather data and is never stored.
      </p>
      <button className={styles.button} onClick={onRequest} type="button">
        Get My Weather
      </button>
    </div>
  );
}
