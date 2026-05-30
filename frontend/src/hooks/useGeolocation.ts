import { useState, useCallback } from 'react';
import type { GeolocationState } from '../types/weather';

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 60000,
};

const ERROR_MESSAGES: Record<1 | 2 | 3, string> = {
  1: 'Location access was denied. Please enable location permissions in your browser settings and try again.',
  2: 'Your location could not be determined. Please check your device\'s location settings.',
  3: 'Location request timed out. Please try again.',
};

export function useGeolocation(): { state: GeolocationState; requestLocation: () => void } {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'unavailable' });
      return;
    }

    setState({ status: 'requesting' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        const code = error.code as 1 | 2 | 3;
        setState({
          status: 'error',
          code,
          message: ERROR_MESSAGES[code] ?? 'An unknown location error occurred.',
        });
      },
      GEO_OPTIONS,
    );
  }, []);

  return { state, requestLocation };
}
