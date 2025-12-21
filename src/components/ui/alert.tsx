import React from 'react';

/**
 * Alert Component
 * 
 * Display important messages, errors, warnings, and informational content
 */

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  success: `
    bg-[var(--color-success-50)] border-[var(--color-success-200)]
    text-[var(--color-success-700)]
    dark:bg-[var(--color-success-700)]/10 dark:border-[var(--color-success-700)]/30
  `,
  error: `
    bg-[var(--color-error-50)] border-[var(--color-error-200)]
    text-[var(--color-error-700)]
    dark:bg-[var(--color-error-700)]/10 dark:border-[var(--color-error-700)]/30
  `,
  warning: `
    bg-[var(--color-warning-50)] border-[var(--color-warning-200)]
    text-[var(--color-warning-700)]
    dark:bg-[var(--color-warning-700)]/10 dark:border-[var(--color-warning-700)]/30
  `,
  info: `
    bg-[var(--color-info-50)] border-[var(--color-info-200)]
    text-[var(--color-info-700)]
    dark:bg-[var(--color-info-700)]/10 dark:border-[var(--color-info-700)]/30
  `,
};

const iconMap: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const baseStyles = `
    relative flex gap-3 p-4 rounded-lg border
    animate-fade-in
  `;

  const classes = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} role="alert">
      <div className="flex-shrink-0 mt-0.5">
        {iconMap[variant]}
      </div>
      
      <div className="flex-1">
        {title && (
          <h3 className="font-semibold mb-1">
            {title}
          </h3>
        )}
        <div className={title ? 'text-sm' : ''}>
          {children}
        </div>
      </div>

      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-auto opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
