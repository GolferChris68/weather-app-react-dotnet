export type IconCategory =
  | 'clear'
  | 'mainly-clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'foggy'
  | 'rainy'
  | 'snowy'
  | 'stormy';

export function getIconCategory(code: number): IconCategory {
  if (code === 0) return 'clear';
  if (code === 1) return 'mainly-clear';
  if (code === 2) return 'partly-cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'foggy';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rainy';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowy';
  if (code === 95 || code === 96 || code === 99) return 'stormy';
  return 'overcast';
}
