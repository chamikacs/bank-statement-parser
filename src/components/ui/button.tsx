import React from 'react';

/**
 * Button Component
 * 
 * A versatile, accessible button component with multiple variants and sizes
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-primary-600)] text-white
    hover:bg-[var(--color-primary-700)]
    active:bg-[var(--color-primary-800)]
    disabled:bg-[var(--color-neutral-300)] disabled:text-[var(--color-neutral-500)]
    shadow-sm hover:shadow-md
    transition-all duration-[var(--transition-base)]
  `,
  secondary: `
    bg-[var(--color-neutral-100)] text-[var(--foreground)]
    hover:bg-[var(--color-neutral-200)]
    active:bg-[var(--color-neutral-300)]
    disabled:bg-[var(--color-neutral-100)] disabled:text-[var(--color-neutral-400)]
    dark:bg-[var(--color-neutral-800)] dark:hover:bg-[var(--color-neutral-700)]
    transition-all duration-[var(--transition-base)]
  `,
  outline: `
    border-2 border-[var(--border)] bg-transparent
    text-[var(--foreground)]
    hover:bg-[var(--muted)] hover:border-[var(--color-neutral-400)]
    active:bg-[var(--color-neutral-200)]
    disabled:border-[var(--color-neutral-200)] disabled:text-[var(--color-neutral-400)]
    dark:hover:bg-[var(--color-neutral-800)]
    transition-all duration-[var(--transition-base)]
  `,
  ghost: `
    bg-transparent text-[var(--foreground)]
    hover:bg-[var(--muted)]
    active:bg-[var(--color-neutral-200)]
    disabled:text-[var(--color-neutral-400)]
    dark:hover:bg-[var(--color-neutral-800)]
    transition-all duration-[var(--transition-base)]
  `,
  danger: `
    bg-[var(--color-error-600)] text-white
    hover:bg-[var(--color-error-700)]
    active:bg-[var(--color-error-700)]
    disabled:bg-[var(--color-neutral-300)] disabled:text-[var(--color-neutral-500)]
    shadow-sm hover:shadow-md
    transition-all duration-[var(--transition-base)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-medium rounded-md',
  md: 'px-4 py-2 text-base font-medium rounded-lg',
  lg: 'px-6 py-3 text-lg font-semibold rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, disabled = false, className = '', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2
      disabled:cursor-not-allowed disabled:opacity-60
    `;

    const classes = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
