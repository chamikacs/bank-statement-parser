/**
 * Layer 2: Candidate Row Detection
 * 
 * Identifies lines that likely contain transaction data using pattern matching
 * and heuristics. This layer filters out non-transaction lines to reduce
 * false positives and improve parsing accuracy.
 */

import type { CandidateLine } from './types';

/**
 * Date patterns to detect
 * Ordered by specificity (most specific first)
 */
const DATE_PATTERNS = [
  // ISO format: 2024-01-15
  /\b\d{4}-\d{2}-\d{2}\b/,
  
  // DD/MM/YYYY or MM/DD/YYYY with various separators
  /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\b/,
  
  // DD MMM YYYY: 15 Jan 2024, 15-Jan-2024
  /\b\d{1,2}[\s\-](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-]*\d{4}\b/i,
  
  // MMM DD, YYYY: Jan 15, 2024
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i,
  
  // Shorter formats: DD/MM/YY or MM/DD/YY
  /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}\b/,
];

/**
 * Amount patterns to detect
 * Matches currency amounts in various formats
 */
const AMOUNT_PATTERNS = [
  // Standard with optional currency symbol: $1,234.56 or 1234.56
  /(?:^|\s)[$£€₹]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s|$)/,
  
  // Parentheses for negative: (1,234.56)
  /\(\d{1,3}(?:,\d{3})*(?:\.\d{2})?\)/,
  
  // With CR/DR suffix: 1234.56 CR
  /\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:CR|DR)/i,
  
  // Negative sign: -1234.56
  /(?:^|\s)-\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s|$)/,
];

/**
 * Check if line contains a date pattern
 * 
 * @param line - Line to check
 * @returns True if line contains a date
 */
export function hasDatePattern(line: string): boolean {
  return DATE_PATTERNS.some((pattern) => pattern.test(line));
}

/**
 * Check if line contains an amount pattern
 * 
 * @param line - Line to check
 * @returns True if line contains an amount
 */
export function hasAmountPattern(line: string): boolean {
  return AMOUNT_PATTERNS.some((pattern) => pattern.test(line));
}

/**
 * Check if line contains a balance (similar to amount, usually at end)
 * 
 * Heuristic: If line has multiple amounts, last one is likely balance
 * 
 * @param line - Line to check
 * @returns True if line likely has a balance
 */
export function hasBalancePattern(line: string): boolean {
  // Count amount matches
  let matchCount = 0;
  for (const pattern of AMOUNT_PATTERNS) {
    const matches = line.match(new RegExp(pattern, 'g'));
    if (matches) {
      matchCount += matches.length;
    }
  }
  
  // If we have 2+ amounts, last is likely balance
  return matchCount >= 2;
}

/**
 * Check if line has good structure for a transaction
 * 
 * Good structure indicators:
 * - Multiple tokens separated by whitespace
 * - Contains both text and numbers
 * - Not too short, not too long
 * 
 * @param line - Line to check
 * @returns True if line has good structure
 */
export function hasGoodStructure(line: string): boolean {
  // Split into tokens
  const tokens = line.split(/\s+/);
  
  // Need at least 3 tokens (date, description, amount)
  if (tokens.length < 3) {
    return false;
  }
  
  // Check for mix of text and numbers
  const hasText = /[a-zA-Z]{2,}/.test(line);
  const hasNumbers = /\d+/.test(line);
  
  return hasText && hasNumbers;
}

/**
 * Detect candidate transaction lines
 * 
 * Analyzes each line and assigns candidate status based on:
 * - Presence of date
 * - Presence of amount
 * - Presence of balance
 * - Overall structure
 * 
 * @param lines - Normalized lines from Layer 1
 * @returns Array of candidate lines with metadata
 * 
 * @example
 * ```typescript
 * const lines = ["15/01/2024 Grocery Store -125.50 2450.75"];
 * const candidates = detectCandidates(lines);
 * // candidates[0].hasDate === true
 * // candidates[0].hasAmount === true
 * // candidates[0].likelyTransaction === true
 * ```
 */
export function detectCandidates(lines: string[]): CandidateLine[] {
  return lines.map((line, index) => {
    const hasDate = hasDatePattern(line);
    const hasAmount = hasAmountPattern(line);
    const hasBalance = hasBalancePattern(line);
    const goodStructure = hasGoodStructure(line);
    
    // A line is likely a transaction if:
    // - It has a date AND an amount
    // - OR it has good structure with at least date OR amount
    const likelyTransaction = 
      (hasDate && hasAmount) ||
      (goodStructure && (hasDate || hasAmount));
    
    return {
      line,
      lineNumber: index + 1,
      hasDate,
      hasAmount,
      hasBalance,
      likelyTransaction,
    };
  });
}

/**
 * Filter candidates to only likely transactions
 * 
 * @param candidates - All candidates from detection
 * @returns Only candidates marked as likely transactions
 */
export function filterLikelyCandidates(candidates: CandidateLine[]): CandidateLine[] {
  return candidates.filter((c) => c.likelyTransaction);
}
