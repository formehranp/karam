import { useMemo, useCallback } from 'react';
import { Task, TaskPriority, TaskCategory } from '../types';
import { useChromeStorage } from './useChromeStorage';
import { formatJalaliDateISO, getTodayJalali } from '../utils/jalali';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    title: 'خوش‌آمدید به کارام! 🎉',
    description: 'اینجا کارهای روزانه و اهداف خود را ثبت و پیگیری کنید.',
    dueDate: formatJalaliDateISO(getTodayJalali()),
    priority: 'high',
    category: 'personal',
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'seed-task-2',
    title: 'برنامه‌ریزی اولویت‌های کاری امروز',
    description: 'تسکی جدید اضافه کنید یا روی تقویم روزهای دیگر را انتخاب نمایید.',
    dueDate: formatJalaliDateISO(getTodayJalali()),
    priority: 'medium',
    category: 'work',
    completed: true,
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'seed-task-3',
    title: 'تنظیم یادآور و تم رنگی Material You',
    description: 'از آیکون چرخ‌دنده بالا تم روشن/تاریک و رنگ دلخواه خود را تنظیم کنید.',
    dueDate: formatJalaliDateISO(getTodayJalali()),
    priority: 'low',
    category: 'learning',
    completed: false,
    createdAt: Date.now() - 10800000,
  },
];

export function useTasks() {
  const [tasks, setTasks, isLoaded] = useChromeStorage<Task[]>('tasks', DEFAULT_TASKS);

  const todayISO = useMemo(() => {
    return formatJalaliDateISO(getTodayJalali());
  }, []);

  const addTask = useCallback(
    (data: {
      title: string;
      description?: string;
      dueDate?: string;
      reminderTime?: string;
      priority?: TaskPriority;
      category?: TaskCategory;
    }): Task => {
      const newTask: Task = {
        id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        dueDate: data.dueDate || todayISO,
        reminderTime: data.reminderTime || undefined,
        priority: data.priority || 'medium',
        category: data.category || 'personal',
        completed: false,
        createdAt: Date.now(),
      };

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [setTasks, todayISO]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    [setTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id: string): Task | undefined => {
      let deleted: Task | undefined;
      setTasks((prev) => {
        deleted = prev.find((t) => t.id === id);
        return prev.filter((t) => t.id !== id);
      });
      return deleted;
    },
    [setTasks]
  );

  const restoreTask = useCallback(
    (task: Task) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev;
        return [task, ...prev];
      });
    },
    [setTasks]
  );

  // Computations for today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayISO);
  }, [tasks, todayISO]);

  const todayCompletedTasks = useMemo(() => {
    return todayTasks.filter((t) => t.completed);
  }, [todayTasks]);

  const todayPendingTasks = useMemo(() => {
    return todayTasks.filter((t) => !t.completed);
  }, [todayTasks]);

  const todayProgress = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((todayCompletedTasks.length / todayTasks.length) * 100);
  }, [todayTasks.length, todayCompletedTasks.length]);

  // Calendar dates with tasks
  const tasksDatesSet = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach((t) => {
      if (t.dueDate) dates.add(t.dueDate);
    });
    return dates;
  }, [tasks]);

  const getTasksCountForDate = useCallback(
    (jalaliISO: string) => {
      return tasks.filter((t) => t.dueDate === jalaliISO).length;
    },
    [tasks]
  );

  return {
    tasks,
    setTasks,
    isLoaded,
    todayISO,
    todayTasks,
    todayCompletedTasks,
    todayPendingTasks,
    todayProgress,
    tasksDatesSet,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleTask,
    getTasksCountForDate,
  };
}
