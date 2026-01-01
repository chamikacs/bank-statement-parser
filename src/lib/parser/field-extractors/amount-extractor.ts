/**
 * Layer 3b: Amount Extractor
 * 
 * Extracts monetary amounts from transaction lines and determines
 * whether they represent debits or credits.
 */

import type { ExtractedAmount } from '../types';



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
 * Uses right-to-left extraction to get only valid transaction amounts.
 * Bank statement format: Date | Particulars | Payments | Receipts | Balance
 * 
 * Strategy:
 * 1. Extract ALL properly formatted amounts from the entire line (with commas, decimals, or Cr/Dr)
 * 2. Take only the LAST 2-3 amounts (rightmost = transaction + balance)
 * 3. Ignore plain numbers without formatting (these are usually from descriptions)
 * 
 * @param line - Line to extract amounts from
 * @param dateText - Optional date text to remove
 * @returns Array of extracted amounts (max 2-3, rightmost only)
 * 
 * @example
 * ```typescript
 * const amounts = extractAmounts("17/11/25 Cash advance 432572******5281 6,000.00 6,063.00 Cr");
 * // Finds: [6000.00, 6063.00] - takes only last 2 properly formatted amounts
 * // Ignores: 432572 (no commas, no decimals, not at end)
 * ```
 */
export function extractAmounts(line: string, dateText?: string): ExtractedAmount[] {
  console.log('  🔍 Analyzing line for amounts:', line);
  
  // Step 1: Remove date from beginning
  let workingLine = line;
  if (dateText) {
    workingLine = line.replace(dateText, '').trim();
  } else {
    workingLine = line.replace(/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\s+/, '').trim();
  }
  
  console.log('  📝 After removing date:', workingLine);
  
  // Step 2: Extract ONLY properly formatted amounts (prioritize high-confidence patterns)
  // We'll use a stricter set of patterns that avoid plain numbers
  const strictPatterns = [
    {
      // CR/DR suffix (highest confidence) - MUST extract these
      pattern: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s+(?:CR|DR))\b/gi,
      isDebit: null, // Will be determined by CR/DR
      confidence: 100,
    },
    {
      // Amounts with commas AND decimals: 1,234.56 or 432,572.00
      pattern: /\b(\d{1,3}(?:,\d{3})+\.\d{2})\b/g,
      isDebit: null,
      confidence: 90,
    },
    {
      // Amounts with decimals only (no commas): 123.45 or 6000.00
      // Only if they have .XX decimal format
      pattern: /\b(\d+\.\d{2})\b/g,
      isDebit: null,
      confidence: 75,
    },
  ];
  
  const allAmounts: Array<ExtractedAmount & { position: number }> = [];
  
  for (const { pattern, isDebit: defaultIsDebit, confidence: baseConfidence } of strictPatterns) {
    const matches = workingLine.matchAll(pattern);
    
    for (const match of matches) {
      const fullMatch = match[0];
      let amountStr = match[1] || fullMatch;
      
      // Start with defaults from pattern (may be null)
      let isDebit: boolean = defaultIsDebit ?? false;
      let isCredit: boolean = (defaultIsDebit === false);
      
      // Check if this is a CR/DR amount and override
      if (/CR\b/i.test(amountStr)) {
        isCredit = true;
        isDebit = false;
        amountStr = amountStr.replace(/\s*CR\s*$/i, '').trim();
      } else if (/DR\b/i.test(amountStr)) {
        isDebit = true;
        isCredit = false;
        amountStr = amountStr.replace(/\s*DR\s*$/i, '').trim();
      }
      
      const value = parseAmount(amountStr);
      
      // Validate amount
      if (value <= 0 || value > 10000000) continue;
      
      allAmounts.push({
        value,
        original: fullMatch.trim(),
        isDebit,
        isCredit,
        confidence: baseConfidence,
        position: match.index || 0,
      });
    }
  }

  
  // Sort by position
  allAmounts.sort((a, b) => a.position - b.position);
  
  console.log('  🔢 All formatted amounts found:', allAmounts.map(a => ({ value: a.value, pos: a.position })));
  
  // Step 3: Take only the LAST 2-3 amounts (these are payment/receipt/balance)
  // Bank statements typically have: [...description...] [payment OR receipt] [balance]
  // Or: [...description...] [payment] [receipt] [balance]
  const maxAmountsToKeep = 3;
  const selectedAmounts = allAmounts.slice(-maxAmountsToKeep);
  
  console.log('  ✅ Selected rightmost amounts:', selectedAmounts.map(a => ({ value: a.value, isCredit: a.isCredit })));
  
  // Remove the position property
  const results: ExtractedAmount[] = selectedAmounts.map(({ position, ...rest }) => rest);
  
  return results;
}

/**
 * Classify amounts as transaction amount vs balance
 * 
 * Heuristic: In most bank statements, the last amount is balance
 * For statements with PAYMENTS and RECEIPTS columns, we need to look at patterns
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
  
  // Multiple amounts: last is likely balance, first/middle is transaction
  const balance = amounts[amounts.length - 1];
  
  // If we have exactly 2 amounts, first is transaction
  if (amounts.length === 2) {
    const transaction = amounts[0];
    
    // Important: Don't let the balance's Cr/Dr classification override the transaction
    // The transaction amount should keep its original classification
    return { transactionAmount: transaction, balance };
  }
  
  // More than 2: could be debit+credit+balance or multiple transactions
  // For now, take the first non-balance amount
  const transactionAmount = amounts[0];
  
  return { transactionAmount, balance };
}
