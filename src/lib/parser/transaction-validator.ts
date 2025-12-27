/**
 * Layer 4: Transaction Validator
 * 
 * Validates parsed transactions and calculates confidence scores.
 * Each transaction is scored 0-100 based on completeness and quality.
 */

import type { Transaction } from '@/types/transaction';
import type { ConfidenceFactors, ParsedTransaction } from './types';

/**
 * Confidence score weights
 */
const CONFIDENCE_WEIGHTS = {
  hasValidDate: 30,
  hasAmount: 25,
  hasDescription: 15,
  hasBalance: 10,
  amountFormatValid: 10,
  dateInReasonableRange: 10,
};

/**
 * Calculate confidence factors for a transaction
 * 
 * @param transaction - Transaction to analyze
 * @returns Confidence factors with boolean flags
 */
export function calculateConfidenceFactors(transaction: Transaction): ConfidenceFactors {
  // Check if date is valid and parseable
  const hasValidDate = Boolean(
    transaction.date &&
    /^\d{4}-\d{2}-\d{2}$/.test(transaction.date) &&
    !isNaN(new Date(transaction.date).getTime())
  );
  
 // Check if date is in reasonable range (not future, not too old)
  const dateInReasonableRange = hasValidDate && isDateReasonable(transaction.date);
  
  // Check if has at least one amount
  const hasAmount = Boolean(transaction.debit || transaction.credit);
  
  // Check if amount format is valid (positive number)
  const amountFormatValid = Boolean(
    (transaction.debit === undefined || transaction.debit >= 0) &&
    (transaction.credit === undefined || transaction.credit >= 0)
  );
  
  // Check if has meaningful description
  const hasDescription = Boolean(
    transaction.description &&
    transaction.description.length >= 3 &&
    /[a-zA-Z]+/.test(transaction.description)
  );
  
  // Check if has balance
  const hasBalance = Boolean(
    transaction.balance !== undefined &&
    transaction.balance >= 0
  );
  
  return {
    hasValidDate,
    hasAmount,
    hasDescription,
    hasBalance,
    amountFormatValid,
    dateInReasonableRange,
  };
}

/**
 * Check if date is in reasonable range for bank statements
 * 
 * @param dateStr - ISO date string
 * @returns True if date is reasonable
 */
function isDateReasonable(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  
  // Not in future
  if (date > now) return false;
  
  // Not older than 5 years
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  if (date < fiveYearsAgo) return false;
  
  return true;
}

/**
 * Calculate total confidence score
 * 
 * @param factors - Confidence factors
 * @returns Score 0-100
 */
export function calculateConfidenceScore(factors: ConfidenceFactors): number {
  let score = 0;
  
  if (factors.hasValidDate) score += CONFIDENCE_WEIGHTS.hasValidDate;
  if (factors.hasAmount) score += CONFIDENCE_WEIGHTS.hasAmount;
  if (factors.hasDescription) score += CONFIDENCE_WEIGHTS.hasDescription;
  if (factors.hasBalance) score += CONFIDENCE_WEIGHTS.hasBalance;
  if (factors.amountFormatValid) score += CONFIDENCE_WEIGHTS.amountFormatValid;
  if (factors.dateInReasonableRange) score += CONFIDENCE_WEIGHTS.dateInReasonableRange;
  
  return score;
}

/**
 * Validate and score a transaction
 * 
 * @param transaction - Transaction to validate
 * @returns Parsed transaction with confidence score and issues
 * 
 * @example
 * ```typescript
 * const validated = validateTransaction({
 *   date: "2024-01-15",
 *   description: "Grocery Store",
 *   debit: 125.50,
 *   balance: 2450.75,
 *   rawLine: "..."
 * });
 * // validated.confidence === 90
 * // validated.issues === []
 * ```
 */
export function validateTransaction(transaction: Transaction): ParsedTransaction {
  const factors = calculateConfidenceFactors(transaction);
  const confidence = calculateConfidenceScore(factors);
  const issues: string[] = [];
  
  // Identify specific issues
  if (!factors.hasValidDate) {
    issues.push('Invalid or missing date');
  }
  
  if (!factors.hasAmount) {
    issues.push('No transaction amount found');
  }
  
  if (!factors.hasDescription) {
    issues.push('Missing or invalid description');
  }
  
  if (!factors.dateInReasonableRange) {
    issues.push('Date is outside reasonable range');
  }
  
  if (!factors.amountFormatValid) {
    issues.push('Amount format is invalid');
  }
  
  return {
    ...transaction,
    confidence,
    factors,
    issues,
  };
}

/**
 * Check if transaction passes minimum requirements
 * 
 * @param transaction - Parsed transaction
 * @param minConfidence - Minimum confidence threshold (default: 60)
 * @returns True if transaction is acceptable
 */
export function isValidTransaction(
  transaction: ParsedTransaction,
  minConfidence: number = 60
): boolean {
  // Must meet minimum confidence
  if (transaction.confidence < minConfidence) return false;
  
  // Must have required fields
  if (!transaction.factors.hasValidDate) return false;
  if (!transaction.factors.hasAmount) return false;
  
  return true;
}
