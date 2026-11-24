import React, { useRef, useState } from 'react';
import {
  X,
  Palette,
  Clock,
  User,
  Download,
  Upload,
  Bookmark,
  Check,
  AlertCircle,
  CloudSun,
} from 'lucide-react';
import { UserSettings, ColorTheme, ThemeMode, Task } from '../types';
import { IRAN_CITIES } from '../utils/weather';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  tasks: Task[];
  onImportAll: (data: { tasks: Task[]; settings: Partial<UserSettings> }) => void;
}

const COLOR_THEMES: { id: ColorTheme; label: string; previewClass: string }[] = [
  { id: 'blue', label: 'آبی گوگل', previewClass: 'bg-[#1a73e8]' },
  { id: 'emerald', label: 'سبز زمردی', previewClass: 'bg-[#0f825a]' },
  { id: 'purple', label: 'بنفش', previewClass: 'bg-[#704fb3]' },
  { id: 'amber', label: 'کهربایی', previewClass: 'bg-[#b26c00]' },
  { id: 'slate', label: 'طوسی مینیمال', previewClass: 'bg-[#475569]' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  tasks,
  onImportAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  // Export JSON
  const handleExport = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      tasks,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `fortask-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed && Array.isArray(parsed.tasks)) {
          onImportAll({
            tasks: parsed.tasks,
            settings: parsed.settings || {},
          });
          setImportStatus('پشتیبان با موفقیت بازیابی شد.');
          setIsError(false);
        } else {
          throw new Error('ساختار فایل پشتیبان معتبر نیست.');
        }
      } catch (err) {
        console.error('Import error:', err);
        setImportStatus('خطا در خواندن فایل پشتیبان!');
        setIsError(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-m3-surface-container rounded-3xl border border-m3-outline-variant/30 shadow-m3-3 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-m3-outline-variant/20">
          <h3 className="text-lg font-bold text-m3-on-surface flex items-center gap-2">
            <Palette className="w-5 h-5 text-m3-primary" />
            <span>تنظیمات و شخصی‌سازی</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-m3-on-surface-variant hover:bg-m3-surface-container-highest transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-m3-on-surface">
          {/* Status Message */}
          {importStatus && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
                isError
                  ? 'bg-m3-error-container text-m3-on-error-container'
                  : 'bg-m3-primary-container text-m3-on-primary-container'
              }`}
            >
              {isError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              <span>{importStatus}</span>
            </div>
          )}

          {/* Theme Mode Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-m3-on-surface-variant">
              حالت روشنایی (Light / Dark)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: 'روشن' },
                  { id: 'dark', label: 'تاریک' },
                  { id: 'system', label: 'سیستم' },
                ] as { id: ThemeMode; label: string }[]
              ).map((mode) => {
                const isSelected = settings.themeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onUpdateSettings({ themeMode: mode.id })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-m3-primary text-m3-on-primary border-m3-primary shadow-xs'
                        : 'bg-m3-surface-container-lowest border-m3-outline-variant/30 text-m3-on-surface-variant hover:bg-m3-surface-container-high'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material You Color Themes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-m3-on-surface-variant">
              پالت رنگی Material Design 3
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_THEMES.map((theme) => {
                const isSelected = settings.colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onUpdateSettings({ colorTheme: theme.id })}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-m3-primary bg-m3-primary/10 ring-2 ring-m3-primary/30 font-bold'
                        : 'border-m3-outline-variant/30 bg-m3-surface-container-lowest hover:bg-m3-surface-container-high'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${theme.previewClass}`} />
                    <span className="text-xs">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clock Options */}
          <div className="space-y-3 pt-2 border-t border-m3-outline-variant/20">
            <div className="flex items-center gap-2 text-xs font-bold text-m3-on-surface-variant">
              <Clock className="w-4 h-4 text-m3-primary" />
              <span>تنظیمات ساعت زنده</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 cursor-pointer">
                <span className="text-xs font-medium">فرمت ۲۴ ساعته</span>
                <input
                  type="checkbox"
                  checked={settings.clockFormat24}
                  onChange={(e) => onUpdateSettings({ clockFormat24: e.target.checked })}
                  className="w-4 h-4 accent-m3-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 cursor-pointer">
                <span className="text-xs font-medium">نمایش ثانیه</span>
                <input
                  type="checkbox"
                  checked={settings.showSeconds}
                  onChange={(e) => onUpdateSettings({ showSeconds: e.target.checked })}
                  className="w-4 h-4 accent-m3-primary rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Personalization */}
          <div className="space-y-3 pt-2 border-t border-m3-outline-variant/20">
            <div className="flex items-center gap-2 text-xs font-bold text-m3-on-surface-variant">
              <User className="w-4 h-4 text-m3-primary" />
              <span>پیام خوش‌آمدگویی</span>
            </div>

            <input
              type="text"
              value={settings.userName}
              onChange={(e) => onUpdateSettings({ userName: e.target.value })}
              placeholder="نام شما (اختیاری، مثلا: علی)"
              className="w-full px-4 py-2.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 focus:border-m3-primary outline-none text-xs text-m3-on-surface"
            />

            <label className="flex items-center justify-between p-3 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 cursor-pointer">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-m3-primary" />
                <span>نمایش نوار دسترسی سریع به سایت‌ها (Quick Links)</span>
              </span>
              <input
                type="checkbox"
                checked={settings.showQuickLinks}
                onChange={(e) => onUpdateSettings({ showQuickLinks: e.target.checked })}
                className="w-4 h-4 accent-m3-primary rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Weather & City Selection */}
          <div className="space-y-3 pt-2 border-t border-m3-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-m3-on-surface-variant">
                <CloudSun className="w-4 h-4 text-m3-primary" />
                <span>آب و هوا و شهر انتخابی</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-m3-on-surface-variant">نمایش دما در هدر</span>
                <input
                  type="checkbox"
                  checked={settings.showWeather !== false}
                  onChange={(e) => onUpdateSettings({ showWeather: e.target.checked })}
                  className="w-4 h-4 accent-m3-primary rounded cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-m3-on-surface-variant">
                انتخاب شهر برای وضعیت آب و هوا
              </label>
              <select
                value={settings.city || 'tehran'}
                onChange={(e) => onUpdateSettings({ city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 focus:border-m3-primary outline-none text-xs text-m3-on-surface cursor-pointer"
              >
                {IRAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Backup & Restore (JSON Export / Import) */}
          <div className="space-y-3 pt-2 border-t border-m3-outline-variant/20">
            <label className="block text-xs font-bold text-m3-on-surface-variant">
              پشتیبان‌گیری و بازیابی اطلاعات
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-m3-surface-container-highest hover:bg-m3-outline-variant/40 text-xs font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>خروجی JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-m3-surface-container-highest hover:bg-m3-outline-variant/40 text-xs font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>بازیابی JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-m3-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-m3-primary text-m3-on-primary font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            بستن و ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};
