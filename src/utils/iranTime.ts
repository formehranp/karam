import { toPersianDigits } from './jalali';

export interface IranTimeInfo {
  hour24: number;
  minute: number;
  second: number;
  timeString: string;
  periodText?: string; // ق.ظ or ب.ظ
  greeting: string;
  gregorianDateString: string;
}

/**
 * Returns current time in Tehran timezone (Asia/Tehran) with 12/24 hour format options.
 */
export function getIranTimeInfo(
  format24 = true,
  showSeconds = true,
  userName = ''
): IranTimeInfo {
  const now = new Date();

  // Get exact numbers in Asia/Tehran
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const hour24 = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);

  let displayHour = hour24;
  let periodText = '';

  if (!format24) {
    periodText = hour24 >= 12 ? 'ب.ظ' : 'ق.ظ';
    displayHour = hour24 % 12;
    if (displayHour === 0) displayHour = 12;
  }

  const hourStr = toPersianDigits(displayHour.toString().padStart(2, '0'));
  const minStr = toPersianDigits(minute.toString().padStart(2, '0'));
  const secStr = toPersianDigits(second.toString().padStart(2, '0'));

  let timeString = `${hourStr}:${minStr}`;
  if (showSeconds) {
    timeString += `:${secStr}`;
  }

  // Greeting determination based on Iran hour requested by user:
  // ۵ تا ۱۱: صبح بخیر
  // ۱۱ تا ۱۴: ظهر بخیر
  // ۱۴ تا ۱۷: بعدازظهر بخیر
  // ۱۷ تا ۲۴: شبت بخیر
  // ۲۴ (۰) تا ۵ صبح: دیگه وقت خوابه!
  let baseGreeting = 'روز بخیر';
  if (hour24 >= 5 && hour24 < 11) {
    baseGreeting = 'صبح بخیر';
  } else if (hour24 >= 11 && hour24 < 14) {
    baseGreeting = 'ظهر بخیر';
  } else if (hour24 >= 14 && hour24 < 17) {
    baseGreeting = 'بعدازظهر بخیر';
  } else if (hour24 >= 17 && hour24 < 24) {
    baseGreeting = 'شبت بخیر';
  } else {
    baseGreeting = 'دیگه وقت خوابه!';
  }

  const trimmedName = typeof userName === 'string' ? userName.trim() : '';
  let greeting = baseGreeting;
  if (trimmedName) {
    if (baseGreeting === 'دیگه وقت خوابه!') {
      greeting = `${trimmedName} عزیز، دیگه وقت خوابه!`;
    } else {
      greeting = `${baseGreeting}، ${trimmedName}`;
    }
  }

  // Gregorian date representation (e.g. "Tuesday, 24 November 2026")
  const gregFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const gregorianDateString = gregFormatter.format(now);

  return {
    hour24,
    minute,
    second,
    timeString,
    periodText,
    greeting,
    gregorianDateString,
  };
}
