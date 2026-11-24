import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Check } from 'lucide-react';
import { useChromeStorage } from '../hooks/useChromeStorage';
import { toPersianDigits } from '../utils/jalali';

export const Scratchpad: React.FC = () => {
  const [content, setContent] = useChromeStorage<string>(
    'user_scratchpad',
    'یادداشت‌های سریع، شماره تلفن‌ها یا ایده‌های لحظه‌ای خود را اینجا بنویسید...'
  );

  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [content]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید یادداشت سریع را پاک کنید؟')) {
      setContent('');
    }
  };

  const charCount = content ? content.length : 0;
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Textarea */}
      <textarea
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اینجا بنویسید..."
        className="w-full p-3.5 rounded-2xl bg-m3-surface-container-lowest border border-m3-outline-variant/30 focus:border-m3-primary focus:outline-none text-xs md:text-sm text-m3-on-surface resize-none leading-relaxed transition-all placeholder-m3-on-surface-variant/60"
      />

      {/* Footer Tools */}
      <div className="flex items-center justify-between text-xs text-m3-on-surface-variant">
        <div className="flex items-center gap-3">
          <span className="opacity-80">
            {toPersianDigits(charCount)} کاراکتر • {toPersianDigits(wordCount)} کلمه
          </span>
          {isSaved && (
            <span className="text-m3-primary text-[11px] font-medium flex items-center gap-1 animate-fadeIn">
              <Check className="w-3 h-3" />
              <span>ذخیره شد</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-m3-surface-container-high hover:bg-m3-surface-container-highest text-m3-on-surface text-[11px] font-medium transition-colors"
            title="کپی در حافظه"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-semibold">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی</span>
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={!content}
            className="p-1 rounded-xl hover:bg-m3-surface-container-highest text-m3-on-surface-variant hover:text-m3-error disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="پاک کردن متن"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
