/**
 * Layer 3d: Balance Extractor
 * 
 * Extracts balance information from transaction lines.
 * Balance is typically the last numeric value on a line.
 */

import type { ExtractedBalance } from '../types';

/**
 * Extract balance from a line
 * 
 * Heuristic: Balance is usually the last amount on a line
 * 
 * @param line - Transaction line
 * @param transactionAmountText - Text of transaction amount (to avoid confusion)
 * @returns Extracted balance or null
 * 
 * @example
 * ```typescript
 * const balance = extractBalance(
 *   "15/01/2024 Purchase -125.50 2450.75",
 *   "-125.50"
 * );
 * // Result: { value: 2450.75, ... }
 * ```
 */
export function extractBalance(
  line: string,
  transactionAmountText?: string
): ExtractedBalance | null {
  // Find all numbers that could be balances
  const balancePattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s|$)/g;
  const matches = Array.from(line.matchAll(balancePattern));
  
  if (matches.length === 0) return null;
  
  // If only one match and it's the transaction amount, no balance
  if (matches.length === 1 && transactionAmountText) {
    if (matches[0][0].includes(transactionAmountText.replace(/[^0-9.,]/g, ''))) {
      return null;
    }
  }
  
  // Get the last match (likely balance)
  const lastMatch = matches[matches.length - 1];
  const balanceStr = lastMatch[1];
  const value = parseFloat(balanceStr.replace(/,/g, ''));
  
  // Validate (balance should be reasonable)
  if (value < 0 || value > 100000000) return null;
  
  return {
    value,
    original: lastMatch[0].trim(),
    confidence: matches.length > 1 ? 80 : 60, // Higher confidence if multiple amounts
  };
}
