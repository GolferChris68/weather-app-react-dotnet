import { useState, useCallback } from 'react';
import type { WeatherState, WeatherData } from '../types/weather';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5044';

export function useWeather(): { state: WeatherState; fetchWeather: (lat: number, lon: number) => void } {
  const [state, setState] = useState<WeatherState>({ status: 'idle' });

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setState({ status: 'loading' });

    let response: Response;
    try {
      response = await fetch(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}`);
    } catch {
      setState({ status: 'error', kind: 'network' });
      return;
    }

    if (!response.ok) {
      setState({ status: 'error', kind: 'api' });
      return;
    }

    let data: WeatherData;
    try {
      data = (await response.json()) as WeatherData;
    } catch {
      setState({ status: 'error', kind: 'parse' });
      return;
    }

    setState({ status: 'success', data });
  }, []);

  return { state, fetchWeather };
}
