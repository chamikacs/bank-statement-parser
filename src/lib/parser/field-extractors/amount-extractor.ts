/**
 * Layer 3b: Amount Extractor
 * 
 * Extracts monetary amounts from transaction lines and determines
 * whether they represent debits or credits.
 */

import type { ExtractedAmount } from '../types';

/**
 * Amount extraction patterns
 * Each pattern captures different ways amounts appear in bank statements
 */
const AMOUNT_EXTRACTION_PATTERNS = [
  {
    // Parentheses indicate negative (debit): (1,234.56) or ($1,234.56)
    pattern: /\((?:[$£€₹])?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\)/,
    isDebit: true,
    confidence: 95,
  },
  {
    // Explicit negative sign: -$1,234.56 or -1234.56
    pattern: /(?:^|\s)-\s*(?:[$£€₹])?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    isDebit: true,
    confidence: 95,
  },
  {
    // DR suffix (debit): 1,234.56 DR
    pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*DR\b/i,
    isDebit: true,
    confidence: 100,
  },
  {
    // CR suffix (credit): 1,234.56 CR
    pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*CR\b/i,
    isDebit: false,
    confidence: 100,
  },
  {
    // Standard format with currency symbol: $1,234.56 or £1234.56
    pattern: /(?:^|\s)([$£€₹])\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    isDebit: null, // Ambiguous - need context
    confidence: 70,
  },
  {
    // Standard format without currency: 1,234.56 or 1234.56
    pattern: /(?:^|\s)(\d{1,3}(?:,\d{3})*(?:\.\d{2}))(?:\s|$)/,
    isDebit: null, // Ambiguous - need context
    confidence: 60,
  },
];

/**
 * Parse amount string to number
 * 
 * @param amountStr - Amount string (may include commas)
 * @returns Parsed number
 */
function parseAmount(amountStr: string): number {
  // Remove commas and parse
  const cleaned = amountStr.replace(/,/g, '');
  return parseFloat(cleaned);
}

/**
 * Extract all amounts from a line
 * 
 * Finds all monetary amounts in a line using various patterns.
 * Returns them in order of appearance.
 * 
 * @param line - Line to extract amounts from
 * @returns Array of extracted amounts
 * 
 * @example
 * ```typescript
 * const amounts = extractAmounts("15/01/2024 Purchase -125.50 2450.75");
 * // amounts[0] = { value: 125.50, isDebit: true, isCredit: false, ... }
 * // amounts[1] = { value: 2450.75, isDebit: false/null, ... } (balance)
 * ```
 */
export function extractAmounts(line: string): ExtractedAmount[] {
  const results: Array<ExtractedAmount & { position: number }> = [];
  
  // Try each pattern
  for (const { pattern, isDebit: defaultIsDebit, confidence: baseConfidence } of AMOUNT_EXTRACTION_PATTERNS) {
    const matches = line.matchAll(new RegExp(pattern, 'g'));
    
    for (const match of matches) {
      // Get the amount string (last captured group)
      const amountStr = match[match.length - 1];
      const value = parseAmount(amountStr);
      
      // Validate amount (must be reasonable)
      if (value <= 0 || value > 10000000) continue; // Skip invalid amounts
      
      // Determine debit/credit
      const isDebit = defaultIsDebit ?? false;
      const isCredit = defaultIsDebit === false; // Only true if explicitly credit
      
      results.push({
        value,
        original: match[0].trim(),
        isDebit,
        isCredit,
        confidence: baseConfidence,
        position: match.index || 0,
      });
    }
  }
  
  // Sort by position in line
  results.sort((a, b) => a.position - b.position);
  
  // Remove duplicates (same amount at similar position)
  const deduped: ExtractedAmount[] = [];
  for (const result of results) {
    const isDuplicate = deduped.some(
      (existing) =>
        Math.abs(existing.value - result.value) < 0.01 &&
        Math.abs((existing as unknown as{ position: number }).position - result.position) < 20
    );
    
    if (!isDuplicate) {
      // Remove position before adding to final result
      const { position: _, ...amount } = result;
      deduped.push(amount);
    }
  }
  
  return deduped;
}

/**
 * Classify amounts as transaction amount vs balance
 * 
 * Heuristic: In most bank statements, the last amount is balance
 * 
 * @param amounts - All extracted amounts
 * @returns Object with transaction amount and balance
 */
export function classifyAmounts(amounts: ExtractedAmount[]): {
  transactionAmount: ExtractedAmount | null;
  balance: ExtractedAmount | null;
} {
  if (amounts.length === 0) {
    return { transactionAmount: null, balance: null };
  }
  
  if (amounts.length === 1) {
    // Only one amount - assume it's transaction amount
    return { transactionAmount: amounts[0], balance: null };
  }
  
  // Multiple amounts: last is likely balance, others are transaction
  const balance = amounts[amounts.length - 1];
  
  // If we have exactly 2 amounts, first is transaction
  if (amounts.length === 2) {
    return { transactionAmount: amounts[0], balance };
  }
  
  // More than 2: could be debit+credit+balance or multiple transactions
  // For now, take the largest non-balance amount
  const nonBalanceAmounts = amounts.slice(0, -1);
  const transactionAmount = nonBalanceAmounts.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  );
  
  return { transactionAmount, balance };
}
