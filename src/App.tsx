import React, { useState, useEffect } from 'react';
import { ClockHeader } from './components/ClockHeader';
import { SearchBar } from './components/SearchBar';
import { QuickLinks } from './components/QuickLinks';
import { TaskManager } from './components/TaskManager';
import { CalendarModal } from './components/CalendarModal';
import { SettingsModal } from './components/SettingsModal';
import { useChromeStorage } from './hooks/useChromeStorage';
import { useTasks } from './hooks/useTasks';
import { UserSettings, JalaliDate, QuickLink, Task } from './types';
import { getTodayJalali } from './utils/jalali';

const DEFAULT_LINKS: QuickLink[] = [
  { id: 'ql-1', title: 'گوگل', url: 'https://google.com' },
  { id: 'ql-2', title: 'یوتیوب', url: 'https://youtube.com' },
  { id: 'ql-3', title: 'گیت‌هاب', url: 'https://github.com' },
  { id: 'ql-4', title: 'دیجی‌کالا', url: 'https://digikala.com' },
  { id: 'ql-5', title: 'جیمیل', url: 'https://mail.google.com' },
  { id: 'ql-6', title: 'چت‌جی‌پی‌تی', url: 'https://chatgpt.com' },
];

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'system',
  colorTheme: 'blue',
  clockFormat24: true,
  showSeconds: true,
  showQuickLinks: true,
  userName: '',
  quickLinks: DEFAULT_LINKS,
  city: 'tehran',
  showWeather: true,
};

export const App: React.FC = () => {
  const [settings, setSettings] = useChromeStorage<UserSettings>(
    'user_settings',
    DEFAULT_SETTINGS
  );

  const currentSettings = settings || DEFAULT_SETTINGS;

  const [selectedDate, setSelectedDate] = useState<JalaliDate>(() => getTodayJalali());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    tasks,
    setTasks,
    todayProgress,
    todayCompletedTasks,
    todayTasks,
    tasksDatesSet,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleTask,
    getTasksCountForDate,
  } = useTasks();

  // Apply Theme Mode (Light/Dark/System) and Color Theme to HTML document
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute('data-theme', currentSettings.colorTheme || 'blue');

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (currentSettings.themeMode === 'dark') {
        root.classList.add('dark');
      } else if (currentSettings.themeMode === 'light') {
        root.classList.remove('dark');
      } else {
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    const listener = () => {
      if (currentSettings.themeMode === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [currentSettings.themeMode, currentSettings.colorTheme]);

  const toggleThemeMode = () => {
    setSettings((prev) => {
      const nextMode = prev.themeMode === 'dark' ? 'light' : 'dark';
      return { ...prev, themeMode: nextMode };
    });
  };

  const handleUpdateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Quick Links Handlers
  const handleAddLink = (newLink: QuickLink) => {
    setSettings((prev) => ({
      ...prev,
      quickLinks: [...(prev.quickLinks || []), newLink],
    }));
  };

  const handleRemoveLink = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      quickLinks: (prev.quickLinks || []).filter((l) => l.id !== id),
    }));
  };

  const handleImportAll = (data: { tasks: Task[]; settings: Partial<UserSettings> }) => {
    if (data.tasks) {
      setTasks(data.tasks);
    }
    if (data.settings) {
      setSettings((prev) => ({ ...prev, ...data.settings }));
    }
  };

  return (
    <div className="min-h-screen bg-m3-surface text-m3-on-surface flex flex-col justify-between selection:bg-m3-primary/20 selection:text-m3-primary font-sans transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        {/* Header: Live Clock, Iran Time, Greeting & Controls (Calendar popup, Theme, Settings) */}
        <ClockHeader
          settings={currentSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleTheme={toggleThemeMode}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        {/* Quick Search Bar */}
        <SearchBar />

        {/* Quick Links Row (Dastyar-style customizable shortcuts) */}
        {currentSettings.showQuickLinks && (
          <QuickLinks
            links={currentSettings.quickLinks || DEFAULT_LINKS}
            onAddLink={handleAddLink}
            onRemoveLink={handleRemoveLink}
          />
        )}

        {/* Hero Tasks Section with Week Days Strip */}
        <main className="w-full mt-2">
          <TaskManager
            tasks={tasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            todayProgress={todayProgress}
            todayCompletedCount={todayCompletedTasks.length}
            todayTotalCount={todayTasks.length}
            is24Hour={currentSettings.clockFormat24}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onRestoreTask={restoreTask}
            onToggleTask={toggleTask}
          />
        </main>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full text-center py-4 text-xs text-m3-on-surface-variant/70 flex items-center justify-center gap-2">
        <span className="text-sm font-black text-m3-primary select-none">
          کارام
        </span>
        <span>•</span>
        <span>بر پایه متریال دیزاین ۳ (Material You)</span>
        <span>•</span>
        <span>کاملاً آفلاین و سریع</span>
      </footer>

      {/* Calendar Pop-up Dialog */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setIsCalendarOpen(false);
        }}
        tasksDatesSet={tasksDatesSet}
        getTasksCountForDate={getTasksCountForDate}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={currentSettings}
        onUpdateSettings={handleUpdateSettings}
        tasks={tasks}
        onImportAll={handleImportAll}
      />
    </div>
  );
};

export default App;
