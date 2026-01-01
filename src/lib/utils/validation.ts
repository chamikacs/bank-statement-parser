/**
 * Validation Utilities
 * 
 * Common validation functions for transactions and data
 */

import type { Transaction } from '@/types/transaction';

/**
 * Validate that a transaction has required fields
 */
export function isValidTransaction(transaction: Partial<Transaction>): transaction is Transaction {
  return (
    typeof transaction.date === 'string' &&
    transaction.date.length > 0 &&
    typeof transaction.description === 'string' &&
    transaction.description.length > 0 &&
    typeof transaction.rawLine === 'string' &&
    (transaction.debit !== undefined || transaction.credit !== undefined)
  );
}

/**
 * Validate ISO date format (YYYY-MM-DD)
 */
export function isValidISODate(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate that a file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validate PDF file with detailed error messages
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  errorDetails?: string;
}

export function validatePDFFile(file: File, maxSizeMB: number = 10): FileValidationResult {
  // Check file type
  if (!isPDF(file)) {
    return {
      valid: false,
      error: 'Invalid file type',
      errorDetails: 'Please select a PDF file. Other file formats are not supported.',
    };
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: 'File too large',
      errorDetails: `File size is ${formatFileSize(file.size)}. Maximum allowed size is ${maxSizeMB}MB.`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Empty file',
      errorDetails: 'The selected file appears to be empty. Please select a valid PDF file.',
    };
  }

  return { valid: true };
}
