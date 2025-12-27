/**
 * Layer 3c: Description Extractor
 * 
 * Extracts transaction descriptions from lines by removing dates,
 * amounts, and other metadata to isolate the transaction narrative.
 */

/**
 * Extract description from a transaction line
 * 
 * Strategy:
 * 1. Remove date (if found)
 * 2. Remove all amounts (transaction and balance)
 * 3. Remove common transaction codes
 * 4. Clean and normalize the remaining text
 * 
 * @param line - Original transaction line
 * @param dateText - Detected date text to remove
 * @param amountTexts - Detected amount texts to remove
 * @returns Cleaned description
 * 
 * @example
 * ```typescript
 * const desc = extractDescription(
 *   "15/01/2024 ATM WITHDRAWAL REF:12345 -100.00 2450.75",
 *   "15/01/2024",
 *   ["-100.00", "2450.75"]
 * );
 * // Result: "ATM WITHDRAWAL"
 * ```
 */
export function extractDescription(
  line: string,
  dateText?: string,
  amountTexts: string[] = []
): string {
  let description = line;
  
  // Remove date
  if (dateText) {
    description = description.replace(dateText, '');
  }
  
  // Remove amounts using the original strings provided
  for (const amountText of amountTexts) {
    description = description.replace(amountText, '');
  }
  
  // CRITICAL: Remove all formatted monetary amounts using regex patterns
  // This catches amounts that might not have been in amountTexts
  
  // Pattern 1: Amounts with Cr/Dr suffix: "1,234.56 Cr" or "123.45 DR"
  description = description.replace(/\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s+(?:Cr|DR)\b/gi, '');
  
  // Pattern 2: Amounts with commas and decimals: "1,234.56" or "432,572.00"
  description = description.replace(/\b\d{1,3}(?:,\d{3})+\.\d{2}\b/g, '');
  
  // Pattern 3: Amounts with decimals only: "123.45" or "6000.00"
  // Be careful here - only remove if it looks like a monetary amount (has .00 or .XX pattern)
  description = description.replace(/\b\d+\.\d{2}\b/g, '');
  
  // Remove common transaction reference patterns
  // REF:12345, TXN:ABC123, ID:999
  description = description.replace(/\b(REF|TXN|ID|TRACE|AUTH):\s*[A-Z0-9]+/gi, '');
  
  // Remove standalone transaction codes (6+ alphanumeric)
  description = description.replace(/\b[A-Z0-9]{6,}\b/g, '');
  
  // Clean up whitespace
  description = description.replace(/\s{2,}/g, ' ').trim();
  
  // Remove trailing/leading punctuation or isolated characters
  description = description.replace(/^[,\-\s]+|[,\-\s]+$/g, '');
  
  // If description is too short or empty, return original
  if (description.length < 3) {
    // Fallback: try to extract meaningful text
    const tokens = line.split(/\s+/);
    const textTokens = tokens.filter((t) => /[a-zA-Z]{2,}/.test(t));
    description = textTokens.slice(0, 5).join(' '); // Take first 5 text tokens
  }
  
  // Truncate if too long (likely includes extra info)
  const MAX_DESCRIPTION_LENGTH = 100;
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.substring(0, MAX_DESCRIPTION_LENGTH).trim() + '...';
  }
  
  return description;
}

/**
 * Clean description for better readability
 * 
 * @param description - Raw description
 * @returns Cleaned description
 */
export function cleanDescription(description: string): string {
  // Convert to title case for better readability
  // But preserve all-caps for acronyms (ATM, POS, etc.)
  const words = description.split(' ');
  const cleaned = words.map((word) => {
    // Keep if all caps and short (likely acronym)
    if (word.length <= 4 && word === word.toUpperCase()) {
      return word;
    }
    
    // Otherwise convert to title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return cleaned.join(' ');
}
