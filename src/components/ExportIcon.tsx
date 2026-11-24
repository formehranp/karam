import React from 'react';

interface ExportIconProps {
  className?: string;
}

/**
 * Modern duotone SVG export icon inspired by Material Design 3 / iOS:
 * - Rounded box outline with soft primary tint
 * - Bold outward diagonal arrow with solid primary color
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
    {/* Box Outline (Soft matching color) */}
    <path
      d="M12 4H7C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V12"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-m3-primary opacity-45 dark:opacity-55"
    />
    {/* Outward Arrow (Solid vibrant primary color) */}
    <path
      d="M10 14L20 4M20 4H14M20 4V10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-m3-primary"
    />
  </svg>
);
