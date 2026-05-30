import styles from './LoadingIndicator.module.css';

type Props = {
  message?: string;
};

export function LoadingIndicator({ message = 'Fetching weather…' }: Props) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
