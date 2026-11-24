import { GregorianDate, JalaliDate } from '../types';

export type { JalaliDate, GregorianDate };

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const PERSIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
] as const;

export const PERSIAN_WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

/**
 * Converts English digits (0-9) to Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (char) => persianDigits[parseInt(char, 10)]);
}

/**
 * Converts Persian/Arabic digits to English digits.
 */
export function toEnglishDigits(input: string): string {
  if (!input) return '';
  return input
    .replace(/[۰-۹]/g, (w) => (w.charCodeAt(0) - 1776).toString())
    .replace(/[٠-٩]/g, (w) => (w.charCodeAt(0) - 1632).toString());
}

/**
 * Converts Gregorian date to Jalali (Solar Hijri) date.
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return { year: jy, month: jm, day: jd };
}

/**
 * Converts Jalali date to Gregorian date.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const isLeapGreg = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  const sal_a = [0, 31, isLeapGreg ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;

  for (let m = 1; m < 13; m++) {
    const v = sal_a[m];
    if (gd <= v) {
      gm = m;
      break;
    }
    gd -= v;
  }

  return { year: gy, month: gm, day: gd };
}

/**
 * Checks if a given Jalali year is a leap year.
 */
export function isLeapJalaliYear(jy: number): boolean {
  const g = jalaliToGregorian(jy, 12, 30);
  const j = gregorianToJalali(g.year, g.month, g.day);
  return j.year === jy && j.month === 12 && j.day === 30;
}

/**
 * Returns number of days in the specified Jalali month.
 */
export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) {
    return isLeapJalaliYear(jy) ? 30 : 29;
  }
  return 30;
}

/**
 * Returns the day of the week for the 1st of a Jalali month.
 * 0 = Saturday (شنبه), 1 = Sunday (یکشنبه), ..., 6 = Friday (جمعه)
 */
export function getJalaliMonthFirstDayOfWeek(jy: number, jm: number): number {
  const greg = jalaliToGregorian(jy, jm, 1);
  const date = new Date(greg.year, greg.month - 1, greg.day);
  const jsDay = date.getDay(); // 0 is Sunday, 6 is Saturday
  return (jsDay + 1) % 7;
}

/**
 * Returns day of week for any specific Jalali date.
 * 0 = Saturday (شنبه), ..., 6 = Friday (جمعه)
 */
export function getJalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const greg = jalaliToGregorian(jy, jm, jd);
  const date = new Date(greg.year, greg.month - 1, greg.day);
  const jsDay = date.getDay();
  return (jsDay + 1) % 7;
}

/**
 * Returns current Jalali date based on Tehran timezone (Asia/Tehran).
 */
export function getTodayJalali(): JalaliDate {
  const tehranDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' })
  );
  return gregorianToJalali(
    tehranDate.getFullYear(),
    tehranDate.getMonth() + 1,
    tehranDate.getDate()
  );
}

/**
 * Formats JalaliDate as YYYY-MM-DD (e.g., "1405-09-03")
 */
export function formatJalaliDateISO(date: JalaliDate): string {
  const y = date.year.toString();
  const m = date.month.toString().padStart(2, '0');
  const d = date.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses a YYYY-MM-DD or YYYY/MM/DD Jalali date string.
 */
export function parseJalaliDateString(dateStr: string): JalaliDate {
  const clean = toEnglishDigits(dateStr).trim();
  const parts = clean.split(/[-/]/).map((p) => parseInt(p, 10));
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return { year: parts[0], month: parts[1], day: parts[2] };
  }
  return getTodayJalali();
}

/**
 * Human-readable Persian date string (e.g. "سه‌شنبه ۳ آذر ۱۴۰۵")
 */
export function formatJalaliDateText(date: JalaliDate, includeWeekday = true): string {
  const monthName = JALALI_MONTH_NAMES[date.month - 1] || '';
  const dayStr = toPersianDigits(date.day);
  const yearStr = toPersianDigits(date.year);

  if (includeWeekday) {
    const dow = getJalaliDayOfWeek(date.year, date.month, date.day);
    const dayName = PERSIAN_WEEK_DAYS[dow];
    return `${dayName} ${dayStr} ${monthName} ${yearStr}`;
  }

  return `${dayStr} ${monthName} ${yearStr}`;
}

/**
 * Checks if two JalaliDate objects represent the same date.
 */
export function isSameJalaliDay(d1: JalaliDate, d2: JalaliDate): boolean {
  return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
}

/**
 * Adds or subtracts days from a Jalali date.
 */
export function addDaysToJalali(date: JalaliDate, days: number): JalaliDate {
  const g = jalaliToGregorian(date.year, date.month, date.day);
  const d = new Date(g.year, g.month - 1, g.day);
  d.setDate(d.getDate() + days);
  return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export interface WeekDayItem {
  dayIndex: number; // 0 = شنبه, 6 = جمعه
  name: string; // شنبه
  shortName: string; // ش
  date: JalaliDate;
  iso: string; // YYYY-MM-DD
  dayNumberFa: string; // ۳
  monthName: string; // آذر
  isToday: boolean;
}

/**
 * Returns the 7 days of the current week (Saturday to Friday) in Tehran timezone.
 */
export function getCurrentWeekDays(): WeekDayItem[] {
  const today = getTodayJalali();
  const todayGreg = jalaliToGregorian(today.year, today.month, today.day);
  const dateObj = new Date(todayGreg.year, todayGreg.month - 1, todayGreg.day);
  
  // In JS getDay(): 0 is Sun, 6 is Sat.
  // In Persian week: 0 is شنبه (Sat), 1 is یکشنبه (Sun), ..., 6 is جمعه (Fri).
  const jsDay = dateObj.getDay();
  const persianDayOfWeek = (jsDay + 1) % 7;

  const result: WeekDayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const diff = i - persianDayOfWeek;
    const itemDate = addDaysToJalali(today, diff);
    const iso = formatJalaliDateISO(itemDate);
    const isToday = isSameJalaliDay(itemDate, today);

    result.push({
      dayIndex: i,
      name: PERSIAN_WEEK_DAYS[i],
      shortName: PERSIAN_WEEK_DAYS_SHORT[i],
      date: itemDate,
      iso,
      dayNumberFa: toPersianDigits(itemDate.day),
      monthName: JALALI_MONTH_NAMES[itemDate.month - 1],
      isToday,
    });
  }

  return result;
}

export interface CalendarOccasion {
  text: string;
  isHoliday: boolean;
}

/**
 * Returns static national/solar holidays and prominent cultural occasions for a Jalali month and day.
 */
export function getJalaliOccasion(month: number, day: number): CalendarOccasion | null {
  // Key format: `${month}-${day}`
  const occasions: Record<string, CalendarOccasion> = {
    // فروردین
    '1-1': { text: 'جشن نوروز / آغاز سال نو', isHoliday: true },
    '1-2': { text: 'عید نوروز', isHoliday: true },
    '1-3': { text: 'عید نوروز', isHoliday: true },
    '1-4': { text: 'عید نوروز', isHoliday: true },
    '1-12': { text: 'روز جمهوری اسلامی ایران', isHoliday: true },
    '1-13': { text: 'روز طبیعت (سیزده‌بدر)', isHoliday: true },

    // اردیبهشت
    '2-1': { text: 'روز بزرگداشت سعدی', isHoliday: false },
    '2-25': { text: 'روز پاسداشت زبان فارسی و بزرگداشت فردوسی', isHoliday: false },
    '2-28': { text: 'روز بزرگداشت حکیم عمر خیام', isHoliday: false },

    // خرداد
    '3-14': { text: 'رحلت امام خمینی', isHoliday: true },
    '3-15': { text: 'قیام خونین ۱۵ خرداد', isHoliday: true },

    // شهریور
    '6-1': { text: 'روز پزشک (بزرگداشت ابن سینا)', isHoliday: false },
    '6-5': { text: 'روز داروساز (بزرگداشت زکریای رازی)', isHoliday: false },
    '6-27': { text: 'روز شعر و ادب فارسی (بزرگداشت شهریار)', isHoliday: false },

    // مهر
    '7-8': { text: 'روز بزرگداشت مولوی', isHoliday: false },
    '7-20': { text: 'روز بزرگداشت حافظ', isHoliday: false },

    // آذر
    '9-16': { text: 'روز دانشجو', isHoliday: false },
    '9-30': { text: 'جشن شب یلدا (طولانی‌ترین شب سال)', isHoliday: false },

    // بهمن
    '11-22': { text: 'پیروزی انقلاب اسلامی', isHoliday: true },
    '11-29': { text: 'جشن سپندارمذگان (روز عشق ایرانی)', isHoliday: false },

    // اسفند
    '12-15': { text: 'روز درختکاری', isHoliday: false },
    '12-29': { text: 'روز ملی شدن صنعت نفت ایران', isHoliday: true },
  };

  const key = `${month}-${day}`;
  return occasions[key] || null;
}
