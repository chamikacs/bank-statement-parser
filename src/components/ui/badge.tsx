import React from 'react';

/**
 * Badge Component
 * 
 * Status badge for displaying transaction status, parse results, etc.
 */

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: `
    bg-[var(--color-success-100)] text-[var(--color-success-700)]
    border-[var(--color-success-200)]
    dark:bg-[var(--color-success-700)]/20 dark:text-[var(--color-success-500)]
  `,
  error: `
    bg-[var(--color-error-100)] text-[var(--color-error-700)]
    border-[var(--color-error-200)]
    dark:bg-[var(--color-error-700)]/20 dark:text-[var(--color-error-500)]
  `,
  warning: `
    bg-[var(--color-warning-100)] text-[var(--color-warning-700)]
    border-[var(--color-warning-200)]
    dark:bg-[var(--color-warning-700)]/20 dark:text-[var(--color-warning-500)]
  `,
  info: `
    bg-[var(--color-info-100)] text-[var(--color-info-700)]
    border-[var(--color-info-200)]
    dark:bg-[var(--color-info-700)]/20 dark:text-[var(--color-info-500)]
  `,
  neutral: `
    bg-[var(--muted)] text-[var(--muted-foreground)]
    border-[var(--border)]
  `,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-2.5 py-1 text-sm font-medium',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  children,
  className = '',
}) => {
  const baseStyles = `
    inline-flex items-center gap-1
    rounded-full border
    transition-colors duration-[var(--transition-fast)]
  `;

  const classes = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
};
