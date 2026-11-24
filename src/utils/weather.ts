import { toPersianDigits } from './jalali';

export interface CityCoordinates {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  temperature: number;
  temperatureFa: string;
  weatherCode: number;
  category: 'cold' | 'moderate' | 'hot';
  categoryLabel: string;
  cityName: string;
  humidity?: number;
  updatedAt: number;
}

export const IRAN_CITIES: CityCoordinates[] = [
  { id: 'tehran', name: 'تهران', lat: 35.6892, lon: 51.3890 },
  { id: 'mashhad', name: 'مشهد', lat: 36.2605, lon: 59.6168 },
  { id: 'isfahan', name: 'اصفهان', lat: 32.6546, lon: 51.6680 },
  { id: 'shiraz', name: 'شیراز', lat: 29.5918, lon: 52.5837 },
  { id: 'tabriz', name: 'تبریز', lat: 38.0962, lon: 46.2738 },
  { id: 'karaj', name: 'کرج', lat: 35.8400, lon: 50.9391 },
  { id: 'ahvaz', name: 'اهواز', lat: 31.3183, lon: 48.6706 },
  { id: 'qom', name: 'قم', lat: 34.6401, lon: 50.8764 },
  { id: 'rasht', name: 'رشت', lat: 37.2809, lon: 49.5924 },
  { id: 'kermanshah', name: 'کرمانشاه', lat: 34.3142, lon: 47.0650 },
  { id: 'urmia', name: 'ارومیه', lat: 37.5527, lon: 45.0761 },
  { id: 'zahedan', name: 'زاهدان', lat: 29.4963, lon: 60.8629 },
  { id: 'yazd', name: 'یزد', lat: 31.8974, lon: 54.3569 },
  { id: 'qazvin', name: 'قزوین', lat: 36.2797, lon: 50.0049 },
  { id: 'zanjan', name: 'زنجان', lat: 36.6736, lon: 48.4787 },
  { id: 'sari', name: 'ساری', lat: 36.5633, lon: 53.0601 },
  { id: 'gorgan', name: 'گرگان', lat: 36.8427, lon: 54.4439 },
  { id: 'khorramabad', name: 'خرم‌آباد', lat: 33.4878, lon: 48.3558 },
  { id: 'sanandaj', name: 'سنندج', lat: 35.3219, lon: 46.9862 },
  { id: 'bushehr', name: 'بوشهر', lat: 28.9220, lon: 50.8331 },
  { id: 'bandar_abbas', name: 'بندرعباس', lat: 27.1832, lon: 56.2666 },
  { id: 'birjand', name: 'بیرجند', lat: 32.8663, lon: 59.2211 },
  { id: 'bojnurd', name: 'بجنورد', lat: 37.4747, lon: 57.3290 },
  { id: 'semnan', name: 'سمنان', lat: 35.5729, lon: 53.3971 },
  { id: 'shahrekord', name: 'شهرکرد', lat: 32.3256, lon: 50.8644 },
  { id: 'yasuj', name: 'یاسوج', lat: 30.6684, lon: 51.5876 },
  { id: 'hamedan', name: 'همدان', lat: 34.7989, lon: 48.5150 },
  { id: 'arak', name: 'اراک', lat: 34.0954, lon: 49.7013 },
  { id: 'ilam', name: 'ایلام', lat: 33.6374, lon: 46.4227 },
  { id: 'ardabil', name: 'اردبیل', lat: 38.2498, lon: 48.2933 },
  { id: 'kerman', name: 'کرمان', lat: 30.2839, lon: 57.0834 },
  { id: 'kish', name: 'کیش', lat: 26.5578, lon: 54.0194 },
  { id: 'qeshm', name: 'قشم', lat: 26.9581, lon: 56.2719 },
];

export function getCityById(id?: string): CityCoordinates {
  const found = IRAN_CITIES.find((c) => c.id === id);
  return found || IRAN_CITIES[0]; // Defaults to Tehran
}

export function classifyTemperature(temp: number): {
  category: 'cold' | 'moderate' | 'hot';
  categoryLabel: string;
} {
  if (temp < 14) {
    return { category: 'cold', categoryLabel: 'سرد' };
  }
  if (temp <= 26) {
    return { category: 'moderate', categoryLabel: 'معتدل' };
  }
  return { category: 'hot', categoryLabel: 'گرم' };
}

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes cache

/**
 * Fetch current weather from Open-Meteo for a given city ID.
 * Caches in localStorage for 20 minutes.
 */
export async function fetchCityWeather(cityId = 'tehran'): Promise<WeatherData | null> {
  const city = getCityById(cityId);
  const cacheKey = `karam_weather_${city.id}`;

  // 1. Try reading valid cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: WeatherData = JSON.parse(cached);
      if (Date.now() - parsed.updatedAt < CACHE_TTL_MS) {
        return parsed;
      }
    }
  } catch {
    // Ignore cache error
  }

  // 2. Fetch fresh data from Open-Meteo API (free, CORS-enabled, reliable)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);

    const data = await res.json();
    const tempRaw = data.current?.temperature_2m ?? 18;
    const temp = Math.round(tempRaw);
    const humidity = data.current?.relative_humidity_2m;
    const weatherCode = data.current?.weather_code ?? 0;
    const { category, categoryLabel } = classifyTemperature(temp);

    const result: WeatherData = {
      temperature: temp,
      temperatureFa: toPersianDigits(temp),
      weatherCode,
      category,
      categoryLabel,
      cityName: city.name,
      humidity,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // Ignore storage quota error
    }

    return result;
  } catch (err) {
    // 3. If offline, fallback to expired cache if exists
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore
    }

    // 4. Default graceful fallback for offline initial state
    const { category, categoryLabel } = classifyTemperature(18);
    return {
      temperature: 18,
      temperatureFa: toPersianDigits(18),
      weatherCode: 1,
      category,
      categoryLabel,
      cityName: city.name,
      updatedAt: Date.now(),
    };
  }
}
