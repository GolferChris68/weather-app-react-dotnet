import type { GeolocationState, WeatherState } from '../types/weather';
import styles from './ErrorMessage.module.css';

type GeoError = Extract<GeolocationState, { status: 'error' | 'unavailable' }>;
type WeatherError = Extract<WeatherState, { status: 'error' }>;

type Props =
  | { source: 'geolocation'; error: GeoError; onRetry?: () => void }
  | { source: 'weather'; error: WeatherError; onRetry: () => void };

function getGeoMessage(error: GeoError): { heading: string; detail: string; canRetry: boolean } {
  if (error.status === 'unavailable') {
    return {
      heading: 'Location not available',
      detail: 'Location access is not available in this browser. Please try a supported browser over HTTPS.',
      canRetry: false,
    };
  }
  if (error.code === 1) {
    return {
      heading: 'Location access denied',
      detail: 'To use this app, please enable location permissions in your browser settings.',
      canRetry: false,
    };
  }
  if (error.code === 2) {
    return {
      heading: 'Location unavailable',
      detail: 'Your location could not be determined. Please check your device\'s location settings and try again.',
      canRetry: true,
    };
  }
  return {
    heading: 'Location request timed out',
    detail: 'The location request timed out. Please try again.',
    canRetry: true,
  };
}

function getWeatherMessage(error: WeatherError): { heading: string; detail: string } {
  if (error.kind === 'network') {
    return {
      heading: 'No internet connection',
      detail: 'Unable to retrieve weather. Please check your internet connection and try again.',
    };
  }
  return {
    heading: 'Unable to retrieve weather',
    detail: 'Weather data could not be retrieved at this time. Please try again.',
  };
}

export function ErrorMessage(props: Props) {
  if (props.source === 'geolocation') {
    const { heading, detail, canRetry } = getGeoMessage(props.error);
    return (
      <div className={styles.container} role="alert">
        <p className={styles.heading}>{heading}</p>
        <p className={styles.detail}>{detail}</p>
        {canRetry && props.onRetry && (
          <button className={styles.retryButton} onClick={props.onRetry} type="button">
            Try Again
          </button>
        )}
      </div>
    );
  }

  const { heading, detail } = getWeatherMessage(props.error);
  return (
    <div className={styles.container} role="alert">
      <p className={styles.heading}>{heading}</p>
      <p className={styles.detail}>{detail}</p>
      <button className={styles.retryButton} onClick={props.onRetry} type="button">
        Try Again
      </button>
    </div>
  );
}
