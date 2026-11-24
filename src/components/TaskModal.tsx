import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { Task, TaskPriority, TaskCategory, JalaliDate } from '../types';
import { WheelTimePicker } from './WheelTimePicker';
import {
  formatJalaliDateISO,
  parseJalaliDateString,
  getTodayJalali,
  addDaysToJalali,
  JALALI_MONTH_NAMES,
  toPersianDigits,
  getDaysInJalaliMonth,
  formatJalaliDateText,
  isSameJalaliDay,
} from '../utils/jalali';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    dueDate: string;
    reminderTime?: string;
    priority: TaskPriority;
    category: TaskCategory;
  }) => void;
  initialTask?: Task | null;
  defaultDate: JalaliDate;
  is24Hour?: boolean;
}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: 'فوری', color: 'border-red-500 text-red-600 bg-red-500/10' },
  { value: 'medium', label: 'متوسط', color: 'border-amber-500 text-amber-600 bg-amber-500/10' },
  { value: 'low', label: 'عادی', color: 'border-blue-500 text-blue-600 bg-blue-500/10' },
];

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'personal', label: 'شخصی' },
  { value: 'work', label: 'کاری' },
  { value: 'learning', label: 'یادگیری' },
  { value: 'shopping', label: 'خرید' },
  { value: 'other', label: 'متفرقه' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
  is24Hour = false,
}) => {
  const today = getTodayJalali();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Date Picker State
  const [selectedJalali, setSelectedJalali] = useState<JalaliDate>(defaultDate || today);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Time Picker State
  const [reminderTime, setReminderTime] = useState<string>(''); // HH:mm or ''

  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [error, setError] = useState('');

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        const parsed = parseJalaliDateString(initialTask.dueDate);
        setSelectedJalali(parsed);
        setReminderTime(initialTask.reminderTime || '');
        setPriority(initialTask.priority);
        setCategory(initialTask.category);
      } else {
        setTitle('');
        setDescription('');
        setSelectedJalali(defaultDate || today);
        setReminderTime('');
        setPriority('medium');
        setCategory('personal');
      }
      setShowDatePicker(false);
      setError('');
    }
  }, [isOpen, initialTask, defaultDate]);

  // Escape key handler
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

  // Preset Date handlers
  const setDateToday = () => {
    setSelectedJalali(today);
  };

  const setDateTomorrow = () => {
    setSelectedJalali(addDaysToJalali(today, 1));
  };

  const setDateDayAfterTomorrow = () => {
    setSelectedJalali(addDaysToJalali(today, 2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('لطفاً عنوان کار را وارد کنید.');
      return;
    }

    onSave({
      title: trimmedTitle,
      description: description.trim() || undefined,
      dueDate: formatJalaliDateISO(selectedJalali),
      reminderTime: reminderTime.trim() || undefined,
      priority,
      category,
    });

    onClose();
  };

  // Calendar numbers for the month selector
  const daysInCurrentMonth = getDaysInJalaliMonth(selectedJalali.year, selectedJalali.month);
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-3 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-m3-outline-variant/20 bg-m3-surface-container">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-m3-primary-container text-m3-on-primary-container flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-m3-on-surface">
              {initialTask ? 'ویرایش کار روزانه' : 'افزودن کار روزانه جدید'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-m3-error-container text-m3-on-error-container text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-m3-on-surface-variant mb-1.5">
              عنوان کار *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: مطالعه فصل ۳ کتاب یا تماس با تیم فنی..."
              className="w-full px-4 py-2.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 focus:border-m3-primary focus:outline-none text-m3-on-surface text-sm font-medium transition-all"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-m3-on-surface-variant mb-1.5">
              توضیحات یا یادداشت (اختیاری)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="جزییات، یادداشت‌ها یا پیوندهای مرتبط..."
              className="w-full px-4 py-2 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 focus:border-m3-primary focus:outline-none text-m3-on-surface text-xs resize-none"
            />
          </div>

          {/* SECTION: Modern Minimal Date Selector */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-m3-on-surface flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-m3-primary" />
                <span>تاریخ موعد:</span>
                <span className="font-extrabold text-m3-primary mr-1">
                  {formatJalaliDateText(selectedJalali, true)}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="text-xs font-medium text-m3-primary hover:underline"
              >
                {showDatePicker ? 'بستن تقویم' : 'تغییر تاریخ'}
              </button>
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center flex-wrap gap-1.5">
              <button
                type="button"
                onClick={setDateToday}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  isSameJalaliDay(selectedJalali, today)
                    ? 'bg-m3-primary text-m3-on-primary border-m3-primary font-bold'
                    : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                }`}
              >
                امروز
              </button>

              <button
                type="button"
                onClick={setDateTomorrow}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  isSameJalaliDay(selectedJalali, addDaysToJalali(today, 1))
                    ? 'bg-m3-primary text-m3-on-primary border-m3-primary font-bold'
                    : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                }`}
              >
                فردا
              </button>

              <button
                type="button"
                onClick={setDateDayAfterTomorrow}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  isSameJalaliDay(selectedJalali, addDaysToJalali(today, 2))
                    ? 'bg-m3-primary text-m3-on-primary border-m3-primary font-bold'
                    : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                }`}
              >
                پس‌فردا
              </button>
            </div>

            {/* Collapsible Minimal Jalali Day/Month Picker */}
            {showDatePicker && (
              <div className="pt-3 border-t border-m3-outline-variant/20 space-y-2.5 animate-fadeIn">
                {/* Month navigation */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-m3-on-surface">
                    {JALALI_MONTH_NAMES[selectedJalali.month - 1]} {toPersianDigits(selectedJalali.year)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMonth = selectedJalali.month === 1 ? 12 : selectedJalali.month - 1;
                        const nextYear = selectedJalali.month === 1 ? selectedJalali.year - 1 : selectedJalali.year;
                        setSelectedJalali({ ...selectedJalali, month: nextMonth, year: nextYear });
                      }}
                      className="p-1 rounded-full hover:bg-m3-surface-container-high text-m3-on-surface-variant"
                      title="ماه قبل"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMonth = selectedJalali.month === 12 ? 1 : selectedJalali.month + 1;
                        const nextYear = selectedJalali.month === 12 ? selectedJalali.year + 1 : selectedJalali.year;
                        setSelectedJalali({ ...selectedJalali, month: nextMonth, year: nextYear });
                      }}
                      className="p-1 rounded-full hover:bg-m3-surface-container-high text-m3-on-surface-variant"
                      title="ماه بعد"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {daysArray.map((d) => {
                    const isSelected = selectedJalali.day === d;
                    const isDayToday = isSameJalaliDay(
                      { year: selectedJalali.year, month: selectedJalali.month, day: d },
                      today
                    );
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedJalali({ ...selectedJalali, day: d })}
                        className={`h-7 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-m3-primary text-m3-on-primary font-bold shadow-xs'
                            : isDayToday
                            ? 'border border-m3-primary text-m3-primary font-semibold'
                            : 'hover:bg-m3-surface-container-high text-m3-on-surface'
                        }`}
                      >
                        {toPersianDigits(d)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SECTION: Modern Drum Wheel Time Picker (Matching Screenshot) */}
          <div className="p-3.5 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-m3-on-surface flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-m3-primary" />
                <span>ساعت یادآور:</span>
                <span className="font-extrabold text-m3-primary mr-1" dir="ltr">
                  {reminderTime || 'بدون ساعت'}
                </span>
              </span>

              {reminderTime ? (
                <button
                  type="button"
                  onClick={() => setReminderTime('')}
                  className="text-xs font-medium text-m3-error hover:underline"
                >
                  حذف یادآور
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setReminderTime('09:00')}
                  className="text-xs font-medium text-m3-primary hover:underline"
                >
                  افزودن ساعت
                </button>
              )}
            </div>

            {/* Drum Wheel Time Picker */}
            {reminderTime ? (
              <div className="flex flex-col items-center justify-center pt-1 border-t border-m3-outline-variant/20 animate-fadeIn">
                <WheelTimePicker
                  value={reminderTime}
                  onChange={(t) => setReminderTime(t)}
                  is24Hour={is24Hour}
                />
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-m3-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setReminderTime('09:00')}
                  className="text-xs px-3 py-1.5 rounded-full bg-m3-surface-container-lowest border border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high transition-all"
                >
                  صبح (09:00 am)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTime('12:00')}
                  className="text-xs px-3 py-1.5 rounded-full bg-m3-surface-container-lowest border border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high transition-all"
                >
                  ظهر (12:00 pm)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTime('16:00')}
                  className="text-xs px-3 py-1.5 rounded-full bg-m3-surface-container-lowest border border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high transition-all"
                >
                  عصر (04:00 pm)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderTime('20:00')}
                  className="text-xs px-3 py-1.5 rounded-full bg-m3-surface-container-lowest border border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high transition-all"
                >
                  شب (08:00 pm)
                </button>
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-m3-on-surface-variant mb-1.5">
              اولویت
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? `${p.color} ring-2 ring-current font-bold`
                        : 'border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-m3-on-surface-variant mb-1.5">
              دسته‌بندی
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const isSelected = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-m3-primary text-m3-on-primary border-m3-primary font-bold'
                        : 'border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-m3-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-m3-on-surface-variant hover:bg-m3-surface-container-high transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-m3-primary text-m3-on-primary hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              {initialTask ? 'ذخیره تغییرات' : 'افزودن تسک'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
