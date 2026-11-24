export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'work' | 'personal' | 'learning' | 'shopping' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // Jalali YYYY-MM-DD, e.g., '1403-09-04'
  reminderTime?: string; // HH:mm format, e.g., '14:30'
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  createdAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorTheme = 'blue' | 'emerald' | 'purple' | 'amber' | 'slate';

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  iconName?: string;
}

export interface UserSettings {
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  clockFormat24: boolean;
  showSeconds: boolean;
  showQuickLinks: boolean;
  userName: string;
  quickLinks: QuickLink[];
  city?: string;
  showWeather?: boolean;
}

export type SideWidgetTab = 'notes' | 'pomodoro' | 'weather';

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
}

export type FilterStatus = 'all' | 'today' | 'selected' | 'pending' | 'completed';
