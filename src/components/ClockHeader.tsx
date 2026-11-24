import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Calendar, CheckSquare } from 'lucide-react';
import { getIranTimeInfo, IranTimeInfo } from '../utils/iranTime';
import { formatJalaliDateText, getTodayJalali } from '../utils/jalali';
import { UserSettings } from '../types';
import { WeatherWidget } from './WeatherWidget';

interface ClockHeaderProps {
  settings: UserSettings;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onOpenCalendar: () => void;
}

export const ClockHeader: React.FC<ClockHeaderProps> = ({
  settings,
  onOpenSettings,
  onToggleTheme,
  onOpenCalendar,
}) => {
  const [timeInfo, setTimeInfo] = useState<IranTimeInfo>(() =>
    getIranTimeInfo(settings.clockFormat24, settings.showSeconds, settings.userName)
  );

  useEffect(() => {
    setTimeInfo(
      getIranTimeInfo(settings.clockFormat24, settings.showSeconds, settings.userName)
    );

    const timer = setInterval(() => {
      setTimeInfo(
        getIranTimeInfo(settings.clockFormat24, settings.showSeconds, settings.userName)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.clockFormat24, settings.showSeconds, settings.userName]);

  const todayJalali = getTodayJalali();
  const jalaliDateText = formatJalaliDateText(todayJalali, true);

  const getThemeIcon = () => {
    if (settings.themeMode === 'light') return <Sun className="w-5 h-5 text-amber-500" />;
    if (settings.themeMode === 'dark') return <Moon className="w-5 h-5 text-m3-primary" />;
    return <Monitor className="w-5 h-5 text-m3-primary" />;
  };

  return (
    <header className="w-full py-3 px-2">
      {/* Unified Single Row: Logo on Right, Clock & Date in Center, Action Buttons on Left */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
        {/* RIGHT SIDE (Start in RTL): Logo «کارام» */}
        <div className="flex items-center gap-2.5 select-none w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-m3-primary text-m3-on-primary flex items-center justify-center shadow-xs">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-m3-primary leading-tight">
                کارام
              </span>
              <span className="text-[10px] font-medium text-m3-on-surface-variant/80 -mt-0.5">
                دستیار کارهای روزانه
              </span>
            </div>
          </div>

          {/* Small Screen Buttons (on mobile) */}
          <div className="flex md:hidden items-center gap-1.5">
            {settings.showWeather !== false && (
              <WeatherWidget
                cityId={settings.city || 'tehran'}
                onOpenSettings={onOpenSettings}
              />
            )}
            <button
              onClick={onOpenCalendar}
              className="p-2 rounded-full bg-m3-surface-container text-m3-primary transition-colors"
              title="تقویم"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full bg-m3-surface-container text-m3-on-surface transition-colors"
              title="تم"
            >
              {getThemeIcon()}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-m3-surface-container text-m3-on-surface transition-colors"
              title="تنظیمات"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CENTER: Clock (30% smaller) + Greeting & Dates Directly Underneath */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Clock: 30% smaller (text-3xl md:text-4xl) */}
          <div className="flex items-baseline gap-2 select-all">
            <span className="text-3xl md:text-4xl font-black tracking-tight text-m3-on-surface font-sans drop-shadow-xs">
              {timeInfo.timeString}
            </span>
            {timeInfo.periodText && (
              <span className="text-xs font-bold text-m3-primary px-2 py-0.5 rounded-lg bg-m3-primary-container">
                {timeInfo.periodText}
              </span>
            )}
          </div>

          {/* Greeting & Jalali Date Directly Under Clock */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-m3-on-surface-variant">
            <span className="font-bold text-m3-on-surface">{timeInfo.greeting}</span>
            <span className="opacity-40">•</span>
            <span className="font-medium text-m3-on-surface">{jalaliDateText}</span>
          </div>

          {/* Gregorian Date Underneath Jalali Date */}
          <div className="text-[11px] text-m3-on-surface-variant/70 mt-0.5" dir="ltr">
            {timeInfo.gregorianDateString}
          </div>
        </div>

        {/* LEFT SIDE (End in RTL): Desktop Action Buttons (Weather, Calendar, Theme, Settings) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Weather Widget */}
          {settings.showWeather !== false && (
            <WeatherWidget
              cityId={settings.city || 'tehran'}
              onOpenSettings={onOpenSettings}
            />
          )}

          {/* Calendar Pop-up Trigger Button */}
          <button
            onClick={onOpenCalendar}
            className="p-2.5 rounded-full bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-primary transition-all duration-200 m3-state-layer shadow-xs"
            title="تقویم هجری شمسی و مناسبت‌ها"
            aria-label="تقویم هجری شمسی"
          >
            <Calendar className="w-5 h-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-full bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface transition-all duration-200 m3-state-layer shadow-xs"
            title="تغییر تم روشنایی / تاریکی"
            aria-label="تغییر تم روشنایی / تاریکی"
          >
            {getThemeIcon()}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-full bg-m3-surface-container hover:bg-m3-surface-container-high text-m3-on-surface transition-all duration-200 m3-state-layer shadow-xs"
            title="تنظیمات"
            aria-label="تنظیمات"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
