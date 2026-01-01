'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Button, Alert, Badge } from '@/components/ui';
import { validatePDFFile, formatFileSize } from '@/lib/utils/validation';
import type { FileValidationResult } from '@/lib/utils/validation';
import type { PDFFileInfo } from '@/types/file-metadata';

/**
 * Refined PDF Uploader Component
 * 
 * Professional drag-and-drop file upload with react-dropzone
 */

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({
  onFileSelect,
  onFileRemove,
  disabled = false,
  maxSizeMB = 10,
}) => {
  const [error, setError] = useState<FileValidationResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<PDFFileInfo | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors?.[0]?.code === 'too-many-files') {
          setError({
            valid: false,
            error: 'Too many files',
            errorDetails: 'Please select only one PDF file at a time.',
          });
        } else if (rejection.errors?.[0]?.code === 'file-invalid-type') {
          setError({
            valid: false,
            error: 'Invalid file type',
            errorDetails: 'Please select a PDF file (.pdf extension).',
          });
        }
        return;
      }

      // Handle accepted files
      if (acceptedFiles.length === 0) {
        return;
      }

      const file = acceptedFiles[0];

      // Validate file
      const validation = validatePDFFile(file, maxSizeMB);
      if (!validation.valid) {
        setError(validation);
        return;
      }

      // Create file info
      const fileInfo: PDFFileInfo = {
        name: file.name,
        size: file.size,
        formattedSize: formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified),
      };

      setSelectedFile(fileInfo);
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled,
    noClick: disabled,
    noKeyboard: disabled,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    onFileRemove?.();
  };

  // If file is selected, show metadata card
  if (selectedFile) {
    return (
      <div className="space-y-4">
        <div className="border-2 border-[var(--color-success-500)] bg-[var(--color-success-50)] dark:bg-[var(--color-success-950)] rounded-xl p-6">
          <div className="flex items-start gap-4">
            {/* PDF Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--color-success-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <Badge variant="success" size="sm">
                      PDF Document
                    </Badge>
                    <span className="font-mono">{selectedFile.formattedSize}</span>
                    <span className="hidden sm:inline">
                      Added {selectedFile.lastModified.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    aria-label="Remove file"
                    className="flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="ml-1">Remove</span>
                  </Button>
                )}
              </div>

              {/* Success Message */}
              <div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-success-700)] dark:text-[var(--color-success-500)]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">File loaded successfully</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Upload zone
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12
          transition-all duration-[var(--transition-base)]
          ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isDragActive && !isDragReject ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)] scale-[1.02]' : ''}
          ${isDragReject ? 'border-[var(--color-error-500)] bg-[var(--color-error-50)] dark:bg-[var(--color-error-950)]' : ''}
          ${!isDragActive && !disabled ? 'border-[var(--border)] bg-muted/30 hover:border-[var(--color-primary-400)] hover:bg-[var(--color-primary-50)]/50 dark:hover:bg-[var(--color-primary-950)]/50' : ''}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2
        `}
      >
        <input {...getInputProps()} aria-label="PDF file upload" />

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-[var(--transition-base)]
              ${isDragActive && !isDragReject ? 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] scale-110' : ''}
              ${isDragReject ? 'bg-[var(--color-error-100)] dark:bg-[var(--color-error-900)]' : ''}
              ${!isDragActive ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-950)]' : ''}
            `}
          >
            {isDragReject ? (
              <svg className="w-8 h-8 text-[var(--color-error-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className={`w-8 h-8 transition-colors ${
                  isDragActive ? 'text-[var(--color-primary-600)]' : 'text-[var(--color-primary-500)]'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <div>
            {isDragReject ? (
              <>
                <p className="text-lg font-semibold text-[var(--color-error-700)] dark:text-[var(--color-error-500)] mb-1">
                  Invalid file type
                </p>
                <p className="text-sm text-muted-foreground">Only PDF files are accepted</p>
              </>
            ) : isDragActive ? (
              <>
                <p className="text-lg font-semibold text-[var(--color-primary-700)] dark:text-[var(--color-primary-500)] mb-1">
                  Drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground">Release to upload</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Drag & drop your bank statement
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse your files
                </p>
              </>
            )}
          </div>

          {/* Details */}
          {!isDragActive && (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <Badge variant="neutral" size="sm">
                  PDF only
                </Badge>
                <Badge variant="neutral" size="sm">
                  Max {maxSizeMB}MB
                </Badge>
                <Badge variant="neutral" size="sm">
                  Digital text required
                </Badge>
              </div>
            </div>
          )}

          {/* Browse Button */}
          {!isDragActive && !disabled && (
            <Button
              variant="primary"
              size="lg"
              className="mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Select PDF File
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" title={error.error} dismissible onDismiss={() => setError(null)}>
          {error.errorDetails}
        </Alert>
      )}

      {/* Help Text */}
      {!error && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Make sure your PDF contains text data, not scanned images
          </p>
        </div>
      )}
    </div>
  );
};
