import React from 'react';

/**
 * Application Header
 * 
 * Displays branding and concise explanation
 */

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-gradient-to-r from-background to-[var(--color-primary-50)] dark:to-[var(--color-primary-950)]">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        <div className="flex items-center gap-4">
          {/* Logo/Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-600)] flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          {/* Branding */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bank Statement Converter
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Transform PDF bank statements into CSV spreadsheets — instantly, privately, in your browser
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
