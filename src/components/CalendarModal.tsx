import React, { useEffect } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { JalaliCalendar } from './JalaliCalendar';
import { JalaliDate, formatJalaliDateText } from '../utils/jalali';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: JalaliDate;
  onSelectDate: (date: JalaliDate) => void;
  tasksDatesSet: Set<string>;
  getTasksCountForDate: (iso: string) => number;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  tasksDatesSet,
  getTasksCountForDate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-3 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-m3-primary" />
            <h3 className="text-base font-bold text-m3-on-surface">
              تقویم هجری شمسی و مناسبت‌ها
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-m3-on-surface-variant hover:bg-m3-surface-container-highest transition-colors"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Body */}
        <div className="p-4 overflow-y-auto">
          <JalaliCalendar
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            tasksDatesSet={tasksDatesSet}
            getTasksCountForDate={getTasksCountForDate}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-m3-outline-variant/20 flex items-center justify-between bg-m3-surface-container-low">
          <span className="text-xs text-m3-on-surface-variant font-medium">
            {formatJalaliDateText(selectedDate, false)}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-m3-primary text-m3-on-primary text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>مشاهده کارهای این تاریخ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
