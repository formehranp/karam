import React from 'react';
import { Check, Trash2, Edit3, Clock, Calendar, Tag } from 'lucide-react';
import { Task, TaskPriority, TaskCategory } from '../types';
import { toPersianDigits, parseJalaliDateString, JALALI_MONTH_NAMES } from '../utils/jalali';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  high: {
    label: 'فوری',
    bg: 'bg-red-500/15',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/30',
  },
  medium: {
    label: 'متوسط',
    bg: 'bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  low: {
    label: 'عادی',
    bg: 'bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
};

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'کاری',
  personal: 'شخصی',
  learning: 'یادگیری',
  shopping: 'خرید',
  other: 'متفرقه',
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const categoryLabel = CATEGORY_LABELS[task.category] || CATEGORY_LABELS.other;

  // Format due date for chip
  const jalali = parseJalaliDateString(task.dueDate);
  const formattedDate = `${toPersianDigits(jalali.day)} ${JALALI_MONTH_NAMES[jalali.month - 1]}`;

  return (
    <div
      className={`group flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200 border ${
        task.completed
          ? 'bg-m3-surface-container-low/60 border-transparent opacity-75'
          : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 hover:border-m3-primary/30 hover:shadow-m3-1'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-m3-primary text-m3-on-primary ring-2 ring-m3-primary/30'
            : 'border-2 border-m3-outline hover:border-m3-primary'
        }`}
        aria-label={task.completed ? 'علامت به عنوان انجام‌نشده' : 'علامت به عنوان انجام‌شده'}
      >
        {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm md:text-base font-semibold leading-relaxed break-words ${
              task.completed
                ? 'line-through text-m3-on-surface-variant'
                : 'text-m3-on-surface'
            }`}
          >
            {task.title}
          </p>

          {/* Action buttons (hover visible on desktop, always visible on mobile) */}
          <div className="flex items-center gap-1 opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-full hover:bg-m3-surface-container-high text-m3-on-surface-variant hover:text-m3-primary transition-colors"
              title="ویرایش"
              aria-label="ویرایش کار"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-full hover:bg-m3-surface-container-high text-m3-on-surface-variant hover:text-m3-error transition-colors"
              title="حذف"
              aria-label="حذف کار"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-m3-on-surface-variant/90 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {/* Priority Chip */}
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}
          >
            {priority.label}
          </span>

          {/* Category Chip */}
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-m3-surface-container-high text-m3-on-surface-variant">
            <Tag className="w-3 h-3 opacity-70" />
            <span>{categoryLabel}</span>
          </span>

          {/* Due Date Chip */}
          <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-m3-surface-container-high text-m3-on-surface-variant">
            <Calendar className="w-3 h-3 opacity-70" />
            <span>{formattedDate}</span>
          </span>

          {/* Reminder Time Chip if present */}
          {task.reminderTime && (
            <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-m3-tertiary-container text-m3-on-tertiary-container">
              <Clock className="w-3 h-3 opacity-70" />
              <span>{toPersianDigits(task.reminderTime)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
