export interface WeatherData {
  temperatureCelsius: number;
  temperatureFahrenheit: number;
  windSpeedMph: number;
  windDirectionDegrees: number;
  windDirectionCardinal: string;
  weatherCode: number;
  weatherLabel: string;
  isDay: boolean;
  locationName: string | null;
  fetchedAtUtc: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'success'; latitude: number; longitude: number }
  | { status: 'error'; code: 1 | 2 | 3; message: string }
  | { status: 'unavailable' };

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WeatherData }
  | { status: 'error'; kind: 'network' | 'api' | 'parse' };
