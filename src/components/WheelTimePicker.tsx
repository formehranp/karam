import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { toPersianDigits } from '../utils/jalali';

interface WheelTimePickerProps {
  value: string; // "HH:mm" (24-hour format, e.g. "09:00" or "14:30")
  onChange: (newTime: string) => void;
  is24Hour?: boolean;
}

const ITEM_HEIGHT = 40; // Height of each row in px
const VISIBLE_COUNT = 5; // Number of items visible in the window (odd number)
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 200px
const SPACER_HEIGHT = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2; // 80px

interface ColumnProps<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  renderItem: (item: T, isSelected: boolean, distance: number) => React.ReactNode;
  widthClass?: string;
  ariaLabel: string;
}

function WheelColumn<T>({
  items,
  selectedIndex,
  onSelect,
  renderItem,
  widthClass = 'w-16',
  ariaLabel,
}: ColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync scroll position when selectedIndex changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const targetTop = selectedIndex * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - targetTop) > 2) {
      isProgrammaticScroll.current = true;
      el.scrollTo({ top: targetTop, behavior: 'smooth' });

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 300);
    }
  }, [selectedIndex]);

  // Handle native scroll snap detection
  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    const el = scrollRef.current;
    if (!el) return;

    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    if (clamped !== selectedIndex) {
      onSelect(clamped);
    }
  }, [items.length, onSelect, selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIndex > 0) onSelect(selectedIndex - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedIndex < items.length - 1) onSelect(selectedIndex + 1);
    }
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      aria-label={ariaLabel}
      className={`relative h-[200px] ${widthClass} overflow-y-auto no-scrollbar snap-y snap-mandatory outline-none focus-visible:ring-1 focus-visible:ring-m3-primary/30 rounded-xl cursor-ns-resize`}
      style={{
        scrollSnapType: 'y mandatory',
      }}
    >
      {/* Top Spacer so first item lands in the exact center */}
      <div style={{ height: SPACER_HEIGHT }} className="shrink-0 pointer-events-none" />

      {/* List items */}
      {items.map((item, index) => {
        const distance = Math.abs(index - selectedIndex);
        const isSelected = index === selectedIndex;
        return (
          <div
            key={index}
            role="option"
            aria-selected={isSelected}
            onClick={() => {
              onSelect(index);
              const el = scrollRef.current;
              if (el) {
                el.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
              }
            }}
            style={{ height: ITEM_HEIGHT }}
            className="flex items-center justify-center snap-center shrink-0 cursor-pointer select-none"
          >
            {renderItem(item, isSelected, distance)}
          </div>
        );
      })}

      {/* Bottom Spacer so last item lands in the exact center */}
      <div style={{ height: SPACER_HEIGHT }} className="shrink-0 pointer-events-none" />
    </div>
  );
}

export const WheelTimePicker: React.FC<WheelTimePickerProps> = ({
  value,
  onChange,
  is24Hour = false,
}) => {
  // Parse incoming value "HH:mm"
  const { hour24, minute } = useMemo(() => {
    const [hStr, mStr] = (value || '09:00').split(':');
    const h = parseInt(hStr || '9', 10);
    const m = parseInt(mStr || '0', 10);
    return {
      hour24: isNaN(h) ? 9 : Math.max(0, Math.min(23, h)),
      minute: isNaN(m) ? 0 : Math.max(0, Math.min(59, m)),
    };
  }, [value]);

  // 12-hour breakdown
  const isPm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  // Items lists
  const hours24Items = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const hours12Items = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutesItems = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const periods = useMemo(() => ['am', 'pm'], []);

  // Selected Indices
  const selectedHourIndex = is24Hour ? hour24 : hours12Items.indexOf(hour12);
  const selectedMinuteIndex = minute;
  const selectedPeriodIndex = isPm ? 1 : 0;

  // Emit 24h change
  const handleHourSelect = (index: number) => {
    let newH24: number;
    if (is24Hour) {
      newH24 = index;
    } else {
      const h12 = hours12Items[index];
      newH24 = isPm ? (h12 % 12) + 12 : h12 % 12;
    }
    const hStr = newH24.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const handleMinuteSelect = (index: number) => {
    const hStr = hour24.toString().padStart(2, '0');
    const mStr = index.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const handlePeriodSelect = (index: number) => {
    const targetPm = index === 1;
    let newH24: number;
    if (targetPm && hour24 < 12) {
      newH24 = hour24 + 12;
    } else if (!targetPm && hour24 >= 12) {
      newH24 = hour24 - 12;
    } else {
      newH24 = hour24;
    }
    const hStr = newH24.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  // Helper for styling items based on distance from center
  const getItemClass = (isSelected: boolean, distance: number) => {
    if (isSelected) {
      return 'text-m3-on-surface font-extrabold text-xl scale-110 tracking-wider';
    }
    if (distance === 1) {
      return 'text-m3-on-surface-variant font-medium text-base opacity-60 scale-100';
    }
    if (distance === 2) {
      return 'text-m3-on-surface-variant font-normal text-xs opacity-30 scale-90';
    }
    return 'text-m3-on-surface-variant font-light text-[11px] opacity-15 scale-75';
  };

  return (
    <div
      dir="ltr"
      className="relative w-full max-w-xs mx-auto py-2 flex items-center justify-center font-sans tabular-nums select-none"
    >
      {/* Central Selection Pill (Horizontal rounded bar matching uploaded screenshot) */}
      <div
        className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-11 rounded-2xl bg-m3-surface-container-highest/80 border border-m3-outline-variant/30 shadow-2xs pointer-events-none transition-colors"
      />

      {/* Wheel Columns Container with Vertical Depth Gradient Fade Mask */}
      <div
        className="relative z-10 flex items-center justify-center w-full gap-2 px-2"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        }}
      >
        {/* HOURS COLUMN */}
        <WheelColumn
          ariaLabel="ساعت"
          items={is24Hour ? hours24Items : hours12Items}
          selectedIndex={selectedHourIndex >= 0 ? selectedHourIndex : 0}
          onSelect={handleHourSelect}
          widthClass={is24Hour ? 'w-20' : 'w-16'}
          renderItem={(h, isSelected, distance) => (
            <span className={`transition-all duration-150 ${getItemClass(isSelected, distance)}`}>
              {is24Hour ? toPersianDigits(h.toString().padStart(2, '0')) : toPersianDigits(h)}
            </span>
          )}
        />

        {/* FIXED COLON SEPARATOR */}
        <div className="flex items-center justify-center h-10 text-xl font-black text-m3-on-surface px-1 select-none">
          :
        </div>

        {/* MINUTES COLUMN */}
        <WheelColumn
          ariaLabel="دقیقه"
          items={minutesItems}
          selectedIndex={selectedMinuteIndex}
          onSelect={handleMinuteSelect}
          widthClass="w-16"
          renderItem={(m, isSelected, distance) => (
            <span className={`transition-all duration-150 ${getItemClass(isSelected, distance)}`}>
              {toPersianDigits(m.toString().padStart(2, '0'))}
            </span>
          )}
        />

        {/* AM / PM COLUMN (Only in 12-Hour Mode) */}
        {!is24Hour && (
          <WheelColumn
            ariaLabel="قبل/بعدازظهر"
            items={periods}
            selectedIndex={selectedPeriodIndex}
            onSelect={handlePeriodSelect}
            widthClass="w-16 ml-1"
            renderItem={(p, isSelected, distance) => (
              <span className={`transition-all duration-150 ${getItemClass(isSelected, distance)}`}>
                {p}
              </span>
            )}
          />
        )}
      </div>
    </div>
  );
};
