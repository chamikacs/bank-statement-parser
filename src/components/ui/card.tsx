import React from 'react';

/**
 * Card Component
 * 
 * Container component with consistent styling for content sections
 */

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps {
  children: React.ReactNode;  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowStyles = {
  none: '',
  sm: 'shadow-[var(--shadow-sm)]',
  md: 'shadow-[var(--shadow-md)]',
  lg: 'shadow-[var(--shadow-lg)]',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
}) => {
  const baseStyles = `
    bg-white dark:bg-[var(--color-neutral-900)]
    border border-[var(--border)]
    rounded-xl
    transition-shadow duration-[var(--transition-base)]
  `;

  const classes = `
    ${baseStyles}
    ${paddingStyles[padding]}
    ${shadowStyles[shadow]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-[var(--border)] pb-4 mb-4 ${className}`.trim()}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-t border-[var(--border)] pt-4 mt-4 ${className}`.trim()}>
      {children}
    </div>
  );
};
