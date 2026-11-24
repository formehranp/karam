import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Layers,
  Inbox,
  FileDown,
} from 'lucide-react';
import { Task, TaskPriority, TaskCategory, JalaliDate } from '../types';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import { TaskExportModal } from './TaskExportModal';
import {
  toPersianDigits,
  formatJalaliDateISO,
  getCurrentWeekDays,
  getTodayJalali,
  formatJalaliDateText,
} from '../utils/jalali';

interface TaskManagerProps {
  tasks: Task[];
  selectedDate: JalaliDate;
  onSelectDate: (date: JalaliDate) => void;
  todayProgress: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  is24Hour?: boolean;
  onAddTask: (task: {
    title: string;
    description?: string;
    dueDate?: string;
    reminderTime?: string;
    priority?: TaskPriority;
    category?: TaskCategory;
  }) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => Task | undefined;
  onRestoreTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  todayProgress,
  todayCompletedCount,
  todayTotalCount,
  is24Hour = false,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onRestoreTask,
  onToggleTask,
}) => {
  const today = getTodayJalali();
  const todayISO = useMemo(() => formatJalaliDateISO(today), [today]);

  // Active filter tab: 'all' | 'YYYY-MM-DD' (defaults to today's ISO string)
  const [activeDateTab, setActiveDateTab] = useState<string>(todayISO);

  // Status sub-filter: 'all' | 'pending' | 'completed'
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Undo Snackbar
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);
  const [snackbarTimeout, setSnackbarTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Compute 7 days of the current week (Saturday to Friday)
  const weekDays = useMemo(() => getCurrentWeekDays(), []);

  // Delete with Snackbar
  const handleDelete = (id: string) => {
    const deleted = onDeleteTask(id);
    if (deleted) {
      if (snackbarTimeout) clearTimeout(snackbarTimeout);
      setLastDeletedTask(deleted);

      const timeout = setTimeout(() => {
        setLastDeletedTask(null);
      }, 5000);
      setSnackbarTimeout(timeout);
    }
  };

  const handleUndo = () => {
    if (lastDeletedTask) {
      onRestoreTask(lastDeletedTask);
      setLastDeletedTask(null);
      if (snackbarTimeout) clearTimeout(snackbarTimeout);
    }
  };

  const handleOpenNewModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: {
    title: string;
    description?: string;
    dueDate: string;
    reminderTime?: string;
    priority: TaskPriority;
    category: TaskCategory;
  }) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, data);
    } else {
      onAddTask(data);
    }
  };

  // Filter & Sort Tasks:
  // - Completed tasks automatically sink to the bottom (ته لیست)
  // - Uncompleted tasks sorted by scheduled execution time (طبق ساعت انجام به صدر لیست)
  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      // 1. Week Day / All Filter
      if (activeDateTab !== 'all' && task.dueDate !== activeDateTab) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // 3. Priority Filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      // 4. Category Filter
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;

      // 5. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });

    const priorityWeight: Record<TaskPriority, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return list.sort((a, b) => {
      // 1. Completed tasks ALWAYS sink to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // 2. In 'all' view across different dates, sort by date first
      if (activeDateTab === 'all' && a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }

      // 3. For tasks on the same date: sort by scheduled execution time (reminderTime)
      const aTime = a.reminderTime?.trim();
      const bTime = b.reminderTime?.trim();

      if (aTime && bTime) {
        const timeDiff = aTime.localeCompare(bTime);
        if (timeDiff !== 0) return timeDiff;
      } else if (aTime && !bTime) {
        // Scheduled tasks come before unscheduled ones
        return -1;
      } else if (!aTime && bTime) {
        return 1;
      }

      // 4. Priority comparison (High > Medium > Low)
      const prioDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (prioDiff !== 0) return prioDiff;

      // 5. If times and priorities are equal, newest created first
      return b.createdAt - a.createdAt;
    });
  }, [
    tasks,
    activeDateTab,
    statusFilter,
    filterPriority,
    filterCategory,
    searchQuery,
  ]);

  // Current active date title
  const activeDateTitle = useMemo(() => {
    if (activeDateTab === 'all') return 'تمام کارهای ثبت‌شده';
    if (activeDateTab === todayISO) return 'کارهای امروز';
    const dayItem = weekDays.find((d) => d.iso === activeDateTab);
    if (dayItem) {
      return `کارهای ${dayItem.name} (${formatJalaliDateText(dayItem.date, false)})`;
    }
    return 'کارهای تاریخ انتخابی';
  }, [activeDateTab, todayISO, weekDays]);

  return (
    <div className="w-full bg-m3-surface-container rounded-3xl p-5 md:p-6 border border-m3-outline-variant/30 shadow-sm flex flex-col gap-5 relative">
      {/* SECTION 1: Top Header (Progress Bar & Title & Add Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-m3-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-m3-primary" />
            <h2 className="text-lg md:text-xl font-bold text-m3-on-surface">
              مدیریت کارهای روزانه
            </h2>
          </div>
          <p className="text-xs text-m3-on-surface-variant mt-0.5">
            {todayTotalCount > 0
              ? `${toPersianDigits(todayCompletedCount)} از ${toPersianDigits(todayTotalCount)} کار امروز تکمیل شده است`
              : 'کارهای امروز خود را برنامه‌ریزی کنید'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* M3 Linear Progress Bar for Today */}
          <div className="flex items-center gap-2.5 w-36 sm:w-44">
            <div className="w-full bg-m3-surface-container-highest rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-m3-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-m3-primary flex-shrink-0 min-w-[28px] text-left">
              {toPersianDigits(todayProgress)}٪
            </span>
          </div>

          {/* Prominent Add Task Popup Button */}
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 active:scale-95 text-xs font-bold transition-all shadow-sm flex-shrink-0"
            title="افزودن تسک جدید (پاپ‌آپ)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>تسک جدید</span>
          </button>

          {/* Excel Export Button (Icon-only, Placed AFTER New Task button) */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="w-10 h-10 rounded-full bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface border border-m3-outline-variant/30 hover:border-m3-outline-variant/60 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xs flex-shrink-0"
            title="خروجی اکسل تسک‌ها"
            aria-label="خروجی اکسل تسک‌ها"
          >
            <FileDown className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>

      {/* SECTION 2: Week Day Strip (پوشش کامل عرض کانتینر بدون فضای خالی در طرفین) */}
      <div className="w-full overflow-x-auto py-1 no-scrollbar">
        <div className="grid grid-cols-8 gap-2 md:gap-3 w-full min-w-[560px]">
          {/* TAB 1: همه تسک‌ها (All Tasks) */}
          <button
            type="button"
            onClick={() => setActiveDateTab('all')}
            className={`w-full h-[116px] rounded-[24px] border transition-all m3-state-layer flex flex-col items-center justify-center gap-2.5 p-2 relative text-center ${
              activeDateTab === 'all'
                ? 'bg-m3-primary text-m3-on-primary border-m3-primary font-bold shadow-sm'
                : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high'
            }`}
          >
            {/* Center Icon */}
            <div className="w-8 h-8 rounded-full bg-m3-surface-container-high/60 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>

            {/* Label */}
            <span className="text-xs font-bold whitespace-nowrap">همه کارها</span>
          </button>

          {/* TABS 2-8: روزهای هفته شنبه تا جمعه */}
          {weekDays.map((dayItem) => {
            const isSelected = activeDateTab === dayItem.iso;

            let cardClass =
              'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface hover:bg-m3-surface-container-high';

            if (isSelected) {
              cardClass =
                'bg-m3-primary text-m3-on-primary border-m3-primary font-bold shadow-sm';
            } else if (dayItem.isToday) {
              cardClass =
                'border-2 border-m3-primary text-m3-primary font-bold bg-m3-primary-container/20';
            }

            return (
              <button
                key={dayItem.iso}
                type="button"
                onClick={() => {
                  setActiveDateTab(dayItem.iso);
                  onSelectDate(dayItem.date);
                }}
                className={`w-full h-[116px] rounded-[24px] border transition-all m3-state-layer flex flex-col items-center justify-center p-2 relative text-center ${cardClass}`}
              >
                {/* 'امروز' Badge at Top */}
                {dayItem.isToday && (
                  <span
                    className={`absolute top-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full font-bold leading-none ${
                      isSelected
                        ? 'bg-m3-on-primary text-m3-primary'
                        : 'bg-m3-primary text-m3-on-primary'
                    }`}
                  >
                    امروز
                  </span>
                )}

                {/* 1. NUMBER: عدد بالا، بزرگتر و بولد */}
                <span className="text-2xl font-black leading-tight tracking-tight font-sans">
                  {dayItem.dayNumberFa}
                </span>

                {/* 2. MONTH: عنوان ماه پایین عدد */}
                <span className="text-[11px] font-medium opacity-75 leading-none mt-0.5">
                  {dayItem.monthName}
                </span>

                {/* 3. DAY NAME: عنوان روز (شنبه و...) */}
                <span className="text-xs font-semibold whitespace-nowrap mt-2">
                  {dayItem.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Filters, Search, and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Active Title + Status Chips */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs font-bold text-m3-on-surface">
            {activeDateTitle} ({toPersianDigits(filteredTasks.length)})
          </span>

          <div className="flex items-center gap-1 bg-m3-surface-container-high p-0.5 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-m3-surface-container-lowest text-m3-on-surface font-semibold shadow-2xs'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'pending'
                  ? 'bg-m3-surface-container-lowest text-m3-on-surface font-semibold shadow-2xs'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface'
              }`}
            >
              در انتظار
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'completed'
                  ? 'bg-m3-surface-container-lowest text-m3-on-surface font-semibold shadow-2xs'
                  : 'text-m3-on-surface-variant hover:text-m3-on-surface'
              }`}
            >
              انجام‌شده
            </button>
          </div>
        </div>

        {/* Search & Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در تسک‌ها..."
              className="w-36 sm:w-48 pr-8 pl-3 py-1.5 rounded-xl bg-m3-surface-container-high border-none text-xs text-m3-on-surface placeholder-m3-on-surface-variant/70 focus:ring-1 focus:ring-m3-primary outline-none"
            />
            <Search className="w-3.5 h-3.5 text-m3-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs bg-m3-surface-container-high text-m3-on-surface px-2 py-1.5 rounded-xl border-none outline-none cursor-pointer"
          >
            <option value="all">همه اولویت‌ها</option>
            <option value="high">فقط فوری</option>
            <option value="medium">متوسط</option>
            <option value="low">عادی</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-m3-surface-container-high text-m3-on-surface px-2 py-1.5 rounded-xl border-none outline-none cursor-pointer"
          >
            <option value="all">دسته‌ها</option>
            <option value="work">کاری</option>
            <option value="personal">شخصی</option>
            <option value="learning">یادگیری</option>
            <option value="shopping">خرید</option>
            <option value="other">متفرقه</option>
          </select>
        </div>
      </div>

      {/* SECTION 4: Task List */}
      <div className="space-y-2.5 min-h-[240px] max-h-[520px] overflow-y-auto pr-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center text-m3-on-surface-variant/70">
            <div className="w-16 h-16 rounded-full bg-m3-surface-container-high flex items-center justify-center mb-3">
              <Inbox className="w-8 h-8 opacity-60" />
            </div>
            <p className="text-sm font-semibold text-m3-on-surface">
              هیچ کاری در این بخش وجود ندارد!
            </p>
            <p className="text-xs mt-1 text-m3-on-surface-variant">
              برای افزودن کار روزانه جدید، دکمه «تسک جدید» در بالا را بزنید.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="mt-3 text-xs font-bold text-m3-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن اولین کار</span>
            </button>
          </div>
        )}
      </div>

      {/* Snackbar / Undo Notification */}
      {lastDeletedTask && (
        <div className="absolute bottom-4 left-4 right-4 z-40 bg-m3-on-surface text-m3-surface px-4 py-3 rounded-2xl shadow-m3-3 flex items-center justify-between gap-3 animate-slideUp">
          <span className="text-xs font-medium truncate">
            کار «{lastDeletedTask.title}» حذف شد.
          </span>
          <button
            onClick={handleUndo}
            className="text-xs font-bold text-m3-primary hover:underline flex-shrink-0"
          >
            بازگردانی (Undo)
          </button>
        </div>
      )}

      {/* Modal for Adding / Editing Task (POPUP) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialTask={editingTask}
        defaultDate={selectedDate || today}
        is24Hour={is24Hour}
      />

      {/* Modal for Monthly Excel Export (POPUP) */}
      <TaskExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tasks={tasks}
      />
    </div>
  );
};
