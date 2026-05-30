import type { WeatherData } from '../types/weather';
import { formatCoordinates } from '../utils/coordinates';
import { TemperatureDisplay } from './TemperatureDisplay';
import { WindDisplay } from './WindDisplay';
import styles from './WeatherCard.module.css';

type Props = {
  data: WeatherData;
  latitude: number;
  longitude: number;
  onRefresh: () => void;
};

export function WeatherCard({ data, latitude, longitude, onRefresh }: Props) {
  const locationDisplay = data.locationName ?? formatCoordinates(latitude, longitude);
  const showAttribution = data.locationName !== null;

  const fetchedAt = new Date(data.fetchedAtUtc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.card}>
      <div className={styles.locationRow}>
        <p className={styles.location}>{locationDisplay}</p>
        {showAttribution && (
          <p className={styles.attribution}>
            ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap contributors
            </a>
          </p>
        )}
      </div>

      <p className={styles.condition}>{data.weatherLabel}</p>

      <TemperatureDisplay
        fahrenheit={data.temperatureFahrenheit}
        celsius={data.temperatureCelsius}
      />

      <WindDisplay
        speedMph={data.windSpeedMph}
        directionDegrees={data.windDirectionDegrees}
        directionCardinal={data.windDirectionCardinal}
      />

      <p className={styles.fetchedAt}>Updated at {fetchedAt}</p>

      <button className={styles.refreshButton} onClick={onRefresh} type="button">
        Refresh
      </button>
    </div>
  );
}
