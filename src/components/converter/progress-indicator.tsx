import React from 'react';
import { PARSING_STEPS } from '@/types/app-state';

/**
 * Progress Indicator Component
 * 
 * Step-based progress visualization with animated transitions
 */

interface ProgressIndicatorProps {
  currentStep: number;
  progress: number;
  message: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  progress,
  message,
}) => {
  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Processing...</span>
          <span className="text-sm font-mono text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted" aria-hidden="true" />
        <div
          className="absolute top-6 left-0 h-0.5 bg-[var(--color-primary-600)] transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (PARSING_STEPS.length - 1)) * 100}%` }}
          aria-hidden="true"
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {PARSING_STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isPending = currentStep < step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / PARSING_STEPS.length}%` }}
              >
                {/* Step Circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 relative z-10
                    ${isCompleted ? 'bg-[var(--color-primary-600)] border-[var(--color-primary-600)]' : ''}
                    ${isActive ? 'bg-[var(--color-primary-100)] border-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] scale-110' : ''}
                    ${isPending ? 'bg-background border-muted' : ''}
                  `}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <div className="w-3 h-3 bg-[var(--color-primary-600)] rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-muted rounded-full" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Message */}
      <div className="text-center">
        <p
          className="text-base text-muted-foreground animate-pulse"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </div>

      {/* Loading Spinner */}
      <div className="flex justify-center">
        <svg
          className="animate-spin h-8 w-8 text-[var(--color-primary-600)]"
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
      </div>
    </div>
  );
};
