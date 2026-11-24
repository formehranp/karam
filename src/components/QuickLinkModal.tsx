import React, { useState, useEffect } from 'react';
import { X, Globe, Link2, Sparkles, Check } from 'lucide-react';

interface QuickLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; url: string }) => void;
}

// Popular suggestions to quickly add shortcuts
const PRESET_SUGGESTIONS = [
  { title: 'گوگل', url: 'https://google.com' },
  { title: 'یوتیوب', url: 'https://youtube.com' },
  { title: 'چت‌جی‌پی‌تی', url: 'https://chatgpt.com' },
  { title: 'گیت‌هاب', url: 'https://github.com' },
  { title: 'دیجی‌کالا', url: 'https://digikala.com' },
  { title: 'ویکی‌پدیا', url: 'https://fa.wikipedia.org' },
  { title: 'آپارات', url: 'https://aparat.com' },
];

export const QuickLinkModal: React.FC<QuickLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setUrl('');
      setError('');
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('لطفاً عنوان میانبر را وارد کنید');
      return;
    }
    if (!url.trim()) {
      setError('لطفاً آدرس وب‌سایت را وارد کنید');
      return;
    }

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onSave({
      title: title.trim(),
      url: formattedUrl,
    });
    onClose();
  };

  const getFaviconPreview = (targetUrl: string) => {
    try {
      let formatted = targetUrl.trim();
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `https://${formatted}`;
      }
      const parsed = new URL(formatted);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  const previewIcon = url.trim() ? getFaviconPreview(url) : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-m3-surface-container rounded-3xl p-6 shadow-2xl border border-m3-outline-variant/30 flex flex-col gap-5 scale-in animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-m3-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-m3-primary-container text-m3-primary flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-m3-on-surface">
                افزودن میانبر جدید
              </h3>
              <p className="text-xs text-m3-on-surface-variant mt-0.5">
                دسترسی سریع به وب‌سایت‌های پرکاربرد
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

        {/* Live Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-m3-surface-container-low border border-m3-outline-variant/20">
          <div className="w-11 h-11 rounded-full bg-m3-surface-container-high border border-m3-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {previewIcon ? (
              <img
                src={previewIcon}
                alt="پیش‌نمایش"
                className="w-5 h-5 rounded-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-5 h-5 text-m3-on-surface-variant/60" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-m3-on-surface truncate">
              {title.trim() || 'عنوان میانبر'}
            </span>
            <span className="text-[11px] text-m3-on-surface-variant/70 truncate font-sans" dir="ltr">
              {url.trim() || 'https://...'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-m3-on-surface">عنوان سایت</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: دیجی‌کالا، گیت‌هاب یا ویکی‌پدیا"
              className="w-full px-4 py-2.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/40 focus:border-m3-primary focus:ring-2 focus:ring-m3-primary/20 outline-none text-xs text-m3-on-surface placeholder-m3-on-surface-variant/50 transition-all font-medium"
              autoFocus
            />
          </div>

          {/* URL Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-m3-on-surface">آدرس اینترنتی (URL)</label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/40 focus:border-m3-primary focus:ring-2 focus:ring-m3-primary/20 outline-none text-xs text-m3-on-surface placeholder-m3-on-surface-variant/50 transition-all font-sans"
              />
              <Link2 className="w-4 h-4 text-m3-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Preset Suggestions */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-m3-on-surface-variant">
              <Sparkles className="w-3.5 h-3.5 text-m3-primary" />
              <span>پیشنهادهای آماده برای افزودن سریع:</span>
            </div>
            <div className="flex items-center flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setTitle(preset.title);
                    setUrl(preset.url);
                    if (error) setError('');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-m3-surface-container-low hover:bg-m3-surface-container-highest text-m3-on-surface border border-m3-outline-variant/20 transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs font-medium text-m3-error bg-m3-error-container/40 px-3 py-1.5 rounded-xl">
              {error}
            </p>
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
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 active:scale-95 text-xs font-bold transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>افزودن میانبر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
