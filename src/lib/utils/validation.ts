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
