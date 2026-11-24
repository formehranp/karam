import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import {
  JalaliDate,
  JALALI_MONTH_NAMES,
  PERSIAN_WEEK_DAYS_SHORT,
  getDaysInJalaliMonth,
  getJalaliMonthFirstDayOfWeek,
  toPersianDigits,
  formatJalaliDateISO,
  isSameJalaliDay,
  getTodayJalali,
  isLeapJalaliYear,
  getJalaliOccasion,
} from '../utils/jalali';

interface JalaliCalendarProps {
  selectedDate: JalaliDate;
  onSelectDate: (date: JalaliDate) => void;
  tasksDatesSet: Set<string>;
  getTasksCountForDate: (iso: string) => number;
}

export const JalaliCalendar: React.FC<JalaliCalendarProps> = ({
  selectedDate,
  onSelectDate,
  tasksDatesSet,
  getTasksCountForDate,
}) => {
  const today = getTodayJalali();
  const [viewYear, setViewYear] = useState(selectedDate.year);
  const [viewMonth, setViewMonth] = useState(selectedDate.month);

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y: number) => y - 1);
    } else {
      setViewMonth((m: number) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y: number) => y + 1);
    } else {
      setViewMonth((m: number) => m + 1);
    }
  };

  const goToToday = () => {
    setViewYear(today.year);
    setViewMonth(today.month);
    onSelectDate(today);
  };

  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth);
  const firstDayOfWeek = getJalaliMonthFirstDayOfWeek(viewYear, viewMonth); // 0 = Sat, 6 = Fri
  const isLeap = isLeapJalaliYear(viewYear);

  // Generate calendar grid cells: firstDayOfWeek blanks, then days 1..daysInMonth
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDaysArray = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="w-full bg-m3-surface-container rounded-3xl p-5 border border-m3-outline-variant/30 shadow-sm flex flex-col gap-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-1 border-b border-m3-outline-variant/20">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-m3-primary" />
          <h2 className="text-base font-bold text-m3-on-surface">
            {JALALI_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
          </h2>
          {isLeap && viewMonth === 12 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-m3-secondary-container text-m3-on-secondary-container">
              سال کبیسه
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goToToday}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-primary transition-colors m3-state-layer"
            title="رفتن به امروز"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>امروز</span>
          </button>

          {/* In RTL: prevMonth is arrow to right, nextMonth is arrow to left */}
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-m3-surface-container-highest text-m3-on-surface-variant transition-colors m3-state-layer"
            title="ماه قبل"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-m3-surface-container-highest text-m3-on-surface-variant transition-colors m3-state-layer"
            title="ماه بعد"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels (Saturday to Friday) */}
      <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-m3-on-surface-variant">
        {PERSIAN_WEEK_DAYS_SHORT.map((dayName, idx) => {
          const isFriday = idx === 6;
          return (
            <div
              key={dayName}
              className={`py-1 ${isFriday ? 'text-m3-error font-bold' : ''}`}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Leading empty slots */}
        {emptyDaysArray.map((_, i) => (
          <div key={`empty-${i}`} className="h-9 w-full" />
        ))}

        {/* Days of the month */}
        {daysArray.map((day) => {
          const dateObj: JalaliDate = { year: viewYear, month: viewMonth, day };
          const iso = formatJalaliDateISO(dateObj);
          const isToday = isSameJalaliDay(dateObj, today);
          const isSelected = isSameJalaliDay(dateObj, selectedDate);
          const dayOfWeekIndex = (firstDayOfWeek + day - 1) % 7;
          const isFriday = dayOfWeekIndex === 6;
          const occasion = getJalaliOccasion(viewMonth, day);
          const isHoliday = occasion?.isHoliday || isFriday;
          const hasTasks = tasksDatesSet.has(iso);
          const taskCount = hasTasks ? getTasksCountForDate(iso) : 0;

          let btnClass = 'text-m3-on-surface hover:bg-m3-surface-container-high';

          if (isSelected) {
            btnClass =
              'bg-m3-primary text-m3-on-primary font-bold shadow-sm hover:bg-m3-primary';
          } else if (isToday) {
            btnClass =
              'border-2 border-m3-primary text-m3-primary font-bold bg-m3-primary-container/20';
          } else if (isHoliday) {
            btnClass = 'text-m3-error font-semibold hover:bg-m3-error/10';
          }

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dateObj)}
              className={`h-9 w-full rounded-2xl flex flex-col items-center justify-center relative text-sm transition-all m3-state-layer ${btnClass}`}
              title={occasion ? `${occasion.text}${occasion.isHoliday ? ' (تعطیل رسمی)' : ''}` : undefined}
            >
              <span>{toPersianDigits(day)}</span>

              {/* Task Dot indicator */}
              {hasTasks && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    isSelected ? 'bg-m3-on-primary' : 'bg-m3-primary'
                  }`}
                  title={`${toPersianDigits(taskCount)} تسک برای این روز`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Info & Occasion Badge */}
      <div className="pt-2 border-t border-m3-outline-variant/20 flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between text-m3-on-surface-variant">
          <span>تاریخ انتخابی:</span>
          <span className="font-semibold text-m3-on-surface">
            {toPersianDigits(selectedDate.day)}{' '}
            {JALALI_MONTH_NAMES[selectedDate.month - 1]}{' '}
            {toPersianDigits(selectedDate.year)}
          </span>
        </div>
        {getJalaliOccasion(selectedDate.month, selectedDate.day) && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium ${
              getJalaliOccasion(selectedDate.month, selectedDate.day)?.isHoliday
                ? 'bg-m3-error-container text-m3-on-error-container font-semibold'
                : 'bg-m3-secondary-container text-m3-on-secondary-container'
            }`}
          >
            <span>
              {getJalaliOccasion(selectedDate.month, selectedDate.day)?.isHoliday
                ? '🛑 تعطیل رسمی:'
                : '📌 مناسبت:'}
            </span>
            <span>{getJalaliOccasion(selectedDate.month, selectedDate.day)?.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
