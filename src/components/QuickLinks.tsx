import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { QuickLink } from '../types';
import { QuickLinkModal } from './QuickLinkModal';

interface QuickLinksProps {
  links: QuickLink[];
  onAddLink: (link: QuickLink) => void;
  onRemoveLink: (id: string) => void;
}

export const QuickLinks: React.FC<QuickLinksProps> = ({
  links,
  onAddLink,
  onRemoveLink,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveModal = (data: { title: string; url: string }) => {
    onAddLink({
      id: 'link-' + Date.now(),
      title: data.title,
      url: data.url,
    });
  };

  // Helper to safely open link in a new tab
  const handleOpenLink = (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let formatted = url.trim();
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: formatted, active: true });
        return;
      }
    } catch {
      // Fallback
    }

    window.open(formatted, '_blank', 'noopener,noreferrer');
  };

  // Helper to get favicon or fallback
  const getFaviconUrl = (url: string) => {
    try {
      let formatted = url.trim();
      if (!/^https?:\/\//i.test(formatted)) {
        formatted = `https://${formatted}`;
      }
      const parsed = new URL(formatted);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-1 px-2 select-none">
      <div className="flex items-center justify-center flex-wrap gap-3">
        {/* ADD SHORTCUT BUTTON: Opens standard M3 popup modal */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group relative w-11 h-11 rounded-full bg-m3-surface-container-low hover:bg-m3-surface-container-high border border-dashed border-m3-outline-variant/70 text-m3-on-surface-variant hover:text-m3-primary flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs"
          title="افزودن میانبر جدید (پاپ‌آپ)"
          aria-label="افزودن میانبر جدید"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {/* Tooltip on hover */}
          <div className="absolute -bottom-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 px-2 py-0.5 rounded-xl bg-m3-on-surface text-m3-surface text-[11px] font-bold whitespace-nowrap shadow-md z-30 scale-95 group-hover:scale-100">
            افزودن سایت
          </div>
        </button>

        {/* SHORTCUTS: Icon-only round circles with hover tooltip */}
        {links.map((link) => (
          <div
            key={link.id}
            onClick={(e) => handleOpenLink(link.url, e)}
            className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-m3-surface-container hover:bg-m3-surface-container-high border border-m3-outline-variant/30 hover:border-m3-outline-variant/60 transition-all duration-200 hover:scale-105 shadow-2xs cursor-pointer"
          >
            {/* Clickable Icon: Opens in new tab */}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleOpenLink(link.url, e)}
              className="w-full h-full flex items-center justify-center p-2.5"
              aria-label={link.title}
              title={`باز کردن ${link.title} در تب جدید`}
            >
              <img
                src={getFaviconUrl(link.url)}
                alt={link.title}
                className="w-5 h-5 rounded-full object-contain pointer-events-none"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </a>

            {/* Hover Tooltip with Website Name */}
            <div className="absolute -bottom-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 px-2.5 py-1 rounded-xl bg-m3-on-surface text-m3-surface text-[11px] font-bold whitespace-nowrap shadow-md z-30 scale-95 group-hover:scale-100">
              {link.title}
            </div>

            {/* Delete button (visible on hover) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveLink(link.id);
              }}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-m3-error text-m3-on-error flex items-center justify-center transition-all shadow-xs z-20 hover:scale-110"
              title="حذف میانبر"
              aria-label="حذف میانبر"
            >
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          </div>
        ))}
      </div>

      {/* Standard M3 Design Popup Modal */}
      <QuickLinkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};
