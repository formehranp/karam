import React, { useState, useEffect } from 'react';
import { Snowflake, CloudSun, Sun } from 'lucide-react';
import { fetchCityWeather, WeatherData } from '../utils/weather';

interface WeatherWidgetProps {
  cityId?: string;
  onOpenSettings?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  cityId = 'tehran',
  onOpenSettings,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchCityWeather(cityId).then((data) => {
      if (isMounted) {
        setWeather(data);
        setIsLoading(false);
      }
    });

    // Refresh every 30 minutes
    const interval = setInterval(() => {
      fetchCityWeather(cityId).then((data) => {
        if (isMounted) setWeather(data);
      });
    }, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cityId]);

  if (!weather && isLoading) {
    return (
      <div className="h-10 px-3 rounded-full bg-m3-surface-container border border-m3-outline-variant/20 flex items-center gap-1.5 animate-pulse text-xs text-m3-on-surface-variant/50">
        <div className="w-4 h-4 rounded-full bg-m3-surface-container-highest" />
        <span className="w-6 h-3 rounded bg-m3-surface-container-highest" />
      </div>
    );
  }

  if (!weather) return null;

  // Determine icon and color based on category (سرد / معتدل / گرم)
  const renderWeatherIcon = () => {
    switch (weather.category) {
      case 'cold':
        return <Snowflake className="w-4 h-4 text-sky-400 stroke-[2.2] animate-pulse" />;
      case 'hot':
        return <Sun className="w-4 h-4 text-amber-500 stroke-[2.2] animate-spin-slow" />;
      case 'moderate':
      default:
        return <CloudSun className="w-4 h-4 text-emerald-500 stroke-[2.2]" />;
    }
  };

  const getPillHoverBorder = () => {
    switch (weather.category) {
      case 'cold':
        return 'hover:border-sky-400/50';
      case 'hot':
        return 'hover:border-amber-500/50';
      case 'moderate':
      default:
        return 'hover:border-emerald-500/50';
    }
  };

  return (
    <button
      type="button"
      onClick={onOpenSettings}
      className={`group relative h-10 px-3 rounded-full bg-m3-surface-container hover:bg-m3-surface-container-high border border-m3-outline-variant/30 ${getPillHoverBorder()} flex items-center gap-1.5 transition-all duration-300 text-xs font-bold text-m3-on-surface select-none shadow-xs hover:shadow-sm cursor-pointer`}
      title={`${weather.cityName}: ${weather.temperatureFa}°C (${weather.categoryLabel}) - کلیک برای تغییر شهر در تنظیمات`}
      aria-label={`وضعیت هوای ${weather.cityName}`}
    >
      {/* Category Icon: هوای سرد یا گرم یا معتدل */}
      <div className="flex items-center justify-center shrink-0">
        {renderWeatherIcon()}
      </div>

      {/* Temperature in Persian digits */}
      <div className="flex items-center gap-0.5 font-sans leading-none">
        <span className="text-xs font-extrabold tracking-tight">
          {weather.temperatureFa}
        </span>
        <span className="text-[11px] font-bold text-m3-on-surface-variant/80 -mt-0.5">
          °
        </span>
      </div>

      {/* City Name (subtle) */}
      <span className="text-[10px] font-medium text-m3-on-surface-variant/70 hidden sm:inline mr-0.5">
        {weather.cityName}
      </span>

      {/* Tooltip on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 px-2.5 py-1 rounded-xl bg-m3-on-surface text-m3-surface text-[11px] font-bold whitespace-nowrap shadow-md z-30 scale-95 group-hover:scale-100">
        {weather.cityName}: {weather.temperatureFa}° ({weather.categoryLabel})
      </div>
    </button>
  );
};
