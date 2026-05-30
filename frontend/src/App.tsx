import { useEffect, useRef } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useWeather } from './hooks/useWeather';
import { LocationPrompt } from './components/LocationPrompt';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ErrorMessage } from './components/ErrorMessage';
import { WeatherCard } from './components/WeatherCard';
import styles from './App.module.css';

export default function App() {
  const { state: geoState, requestLocation } = useGeolocation();
  const { state: weatherState, fetchWeather } = useWeather();
  const coordsRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (geoState.status === 'success') {
      coordsRef.current = { lat: geoState.latitude, lon: geoState.longitude };
      fetchWeather(geoState.latitude, geoState.longitude);
    }
  }, [geoState, fetchWeather]);

  const handleWeatherRetry = () => {
    if (coordsRef.current) {
      fetchWeather(coordsRef.current.lat, coordsRef.current.lon);
    }
  };

  const renderContent = () => {
    if (geoState.status === 'idle') {
      return <LocationPrompt onRequest={requestLocation} />;
    }

    if (geoState.status === 'requesting') {
      return <LoadingIndicator message="Requesting your location…" />;
    }

    if (geoState.status === 'unavailable' || geoState.status === 'error') {
      return (
        <ErrorMessage
          source="geolocation"
          error={geoState}
          onRetry={requestLocation}
        />
      );
    }

    if (weatherState.status === 'idle' || weatherState.status === 'loading') {
      return <LoadingIndicator message="Fetching weather…" />;
    }

    if (weatherState.status === 'error') {
      return (
        <ErrorMessage
          source="weather"
          error={weatherState}
          onRetry={handleWeatherRetry}
        />
      );
    }

    return (
      <WeatherCard
        data={weatherState.data}
        latitude={coordsRef.current?.lat ?? 0}
        longitude={coordsRef.current?.lon ?? 0}
        onRefresh={handleWeatherRetry}
      />
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>{renderContent()}</div>
    </main>
  );
}
