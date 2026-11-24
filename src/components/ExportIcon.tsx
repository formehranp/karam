import React from 'react';

interface ExportIconProps {
  className?: string;
}

/**
 * Modern duotone SVG export icon with vertical upward arrow:
 * - Rounded tray/box outline at the bottom with soft primary tint
 * - Straight vertical arrow pointing UP with solid primary color
 */
export const ExportIcon: React.FC<ExportIconProps> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Tray / Box Container (Soft matching color) */}
    <path
      d="M4 12V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-m3-primary opacity-45 dark:opacity-55"
    />
    {/* Vertical Upward Arrow (Solid vibrant primary color) */}
    <path
      d="M12 15V3.5M7 8L12 3L17 8"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-m3-primary"
    />
  </svg>
);
