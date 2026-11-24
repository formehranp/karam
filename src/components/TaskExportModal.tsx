import React, { useState, useMemo, useEffect } from 'react';
import { X, Download, Check, AlertCircle } from 'lucide-react';
import { Task } from '../types';
import { getTodayJalali, JALALI_MONTH_NAMES, toPersianDigits } from '../utils/jalali';
import { exportTasksToCSV, exportTasksToXLS } from '../utils/excelExport';
import { ExportIcon } from './ExportIcon';

interface TaskExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const TaskExportModal: React.FC<TaskExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  const today = useMemo(() => getTodayJalali(), []);

  // Available Years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([today.year]);
    tasks.forEach((t) => {
      const parts = t.dueDate.split('-');
      if (parts.length >= 1) {
        const y = parseInt(parts[0], 10);
        if (!isNaN(y) && y > 1300 && y < 1500) {
          yearsSet.add(y);
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [tasks, today.year]);

  const [selectedYear, setSelectedYear] = useState<number>(today.year);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(today.month);
  const [exportFormat, setExportFormat] = useState<'xls' | 'csv'>('xls');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedYear(today.year);
      setSelectedMonth(today.month);
      setDownloadSuccess(false);
    }
  }, [isOpen, today]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter tasks based on selected year and month
  const targetTasks = useMemo(() => {
    return tasks.filter((t) => {
      const parts = t.dueDate.split('-');
      if (parts.length < 3) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (y !== selectedYear) return false;
      if (selectedMonth !== 'all' && m !== selectedMonth) return false;
      return true;
    });
  }, [tasks, selectedYear, selectedMonth]);

  const completedCount = useMemo(
    () => targetTasks.filter((t) => t.completed).length,
    [targetTasks]
  );
  const pendingCount = targetTasks.length - completedCount;

  if (!isOpen) return null;

  const handleDownload = () => {
    if (targetTasks.length === 0) return;

    const monthTitle =
      selectedMonth === 'all'
        ? 'kole-sal'
        : JALALI_MONTH_NAMES[selectedMonth - 1] || 'mah';

    const filename = `karam-tasks-${selectedYear}-${monthTitle}`;

    if (exportFormat === 'xls') {
      exportTasksToXLS(targetTasks, filename);
    } else {
      exportTasksToCSV(targetTasks, filename);
    }

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-m3-surface-container rounded-3xl p-6 shadow-2xl border border-m3-outline-variant/30 flex flex-col gap-5 scale-in animate-scaleUp max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-m3-primary/10 flex items-center justify-center">
              <ExportIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-m3-on-surface">
                خروجی اکسل تسک‌ها
              </h3>
              <p className="text-xs text-m3-on-surface-variant mt-0.5">
                گزارش‌گیری و دریافت فایل اکسل بر اساس ماه انتخابی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-m3-surface-container-high text-m3-on-surface-variant hover:text-m3-on-surface transition-colors"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Year Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-m3-on-surface">سال شمسی</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="w-full px-4 py-2.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/40 focus:border-m3-primary outline-none text-xs text-m3-on-surface font-semibold cursor-pointer"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                سال {toPersianDigits(y)}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector Grid */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-m3-on-surface">انتخاب ماه</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {/* All Year Button */}
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all ${
                selectedMonth === 'all'
                  ? 'bg-m3-primary text-m3-on-primary border-m3-primary shadow-xs'
                  : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high'
              }`}
            >
              کل سال
            </button>

            {/* 12 Months */}
            {JALALI_MONTH_NAMES.map((name, index) => {
              const monthNum = index + 1;
              const isSelected = selectedMonth === monthNum;
              const isCurrent = today.month === monthNum && today.year === selectedYear;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedMonth(monthNum)}
                  className={`py-2 px-3 rounded-2xl border text-xs font-semibold transition-all relative ${
                    isSelected
                      ? 'bg-m3-primary text-m3-on-primary border-m3-primary font-bold shadow-xs'
                      : isCurrent
                      ? 'border-2 border-m3-primary/60 text-m3-primary bg-m3-primary-container/20 font-bold'
                      : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high'
                  }`}
                >
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Card for Selected Month */}
        <div className="p-4 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-m3-on-surface">
            <span>
              خلاصه تسک‌های{' '}
              {selectedMonth === 'all'
                ? `کل سال ${toPersianDigits(selectedYear)}`
                : `${JALALI_MONTH_NAMES[selectedMonth - 1]} ${toPersianDigits(selectedYear)}`}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-m3-primary/10 text-m3-primary text-[11px]">
              {toPersianDigits(targetTasks.length)} تسک
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-m3-on-surface-variant">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-m3-surface-container-lowest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>انجام‌شده:</span>
              <strong className="text-m3-on-surface mr-auto font-sans">
                {toPersianDigits(completedCount)}
              </strong>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-m3-surface-container-lowest">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>در انتظار:</span>
              <strong className="text-m3-on-surface mr-auto font-sans">
                {toPersianDigits(pendingCount)}
              </strong>
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs font-bold text-m3-on-surface">فرمت خروجی</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportFormat('xls')}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                exportFormat === 'xls'
                  ? 'bg-m3-primary text-m3-on-primary border-m3-primary'
                  : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high'
              }`}
            >
              Excel (.xls)
            </button>
            <button
              type="button"
              onClick={() => setExportFormat('csv')}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                exportFormat === 'csv'
                  ? 'bg-m3-primary text-m3-on-primary border-m3-primary'
                  : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high'
              }`}
            >
              CSV (.csv)
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <Check className="w-4 h-4" />
            <span>فایل اکسل با موفقیت ایجاد و دانلود شد.</span>
          </div>
        )}

        {/* Zero tasks alert */}
        {targetTasks.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>در این ماه هیچ تسکی یافت نشد.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-m3-outline-variant/20 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-bold text-m3-on-surface-variant hover:bg-m3-surface-container-high transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={targetTasks.length === 0}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              targetTasks.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
                : 'bg-m3-surface-container-highest text-m3-on-surface-variant/50 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>دریافت فایل اکسل</span>
          </button>
        </div>
      </div>
    </div>
  );
};
