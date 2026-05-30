import type { WeatherData } from '../types/weather';
import { formatCoordinates } from '../utils/coordinates';
import { TemperatureDisplay } from './TemperatureDisplay';
import { WindDisplay } from './WindDisplay';
import { WeatherIcon } from './WeatherIcon';
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

      {/* Zone 1 — full-width header */}
      <div className={styles.header}>
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

      {/* Zone 2 — split body: icon left, data right */}
      <div className={styles.body}>
        <div className={styles.iconCol}>
          <WeatherIcon weatherCode={data.weatherCode} isDay={data.isDay} />
        </div>
        <div className={styles.dataCol}>
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
        </div>
      </div>

      {/* Zone 3 — full-width footer */}
      <div className={styles.footer}>
        <p className={styles.fetchedAt}>Updated at {fetchedAt}</p>
        <button className={styles.refreshButton} onClick={onRefresh} type="button">
          Refresh
        </button>
      </div>

    </div>
  );
}
