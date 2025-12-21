'use client';

import React, { useRef, useState } from 'react';
import { Button, Alert } from '@/components/ui';
import { isPDF } from '@/lib/utils/validation';

/**
 * PDF Uploader Component
 * 
 * Drag-and-drop file upload with visual feedback
 */

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    setError(null);

    if (files.length === 0) {
      return;
    }

    if (files.length > 1) {
      setError('Please select only one PDF file at a time');
      return;
    }

    const file = files[0];

    if (!isPDF(file)) {
      setError('Please select a valid PDF file');
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload PDF file"
        aria-disabled={disabled}
        className={`
          relative border-2 border-dashed rounded-xl p-12
          transition-all duration-[var(--transition-base)]
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[var(--color-primary-500)]'}
          ${isDragging ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]' : 'border-[var(--border)] bg-muted/30'}
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2
        `}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]' : 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]'}
            transition-colors duration-[var(--transition-base)]
          `}>
            <svg className="w-8 h-8 text-[var(--color-primary-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {/* Text */}
          <div>
            <p className="text-lg font-semibold text-foreground mb-1">
              {isDragging ? 'Drop your PDF here' : 'Drop PDF here or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground">
              Digital bank statement in PDF format (max 10MB)
            </p>
          </div>

          {/* Browse Button */}
          {!isDragging && (
            <Button
              variant="primary"
              size="lg"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="mt-2"
            >
              Select PDF File
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="sr-only"
          aria-label="PDF file input"
          disabled={disabled}
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
    </div>
  );
};
