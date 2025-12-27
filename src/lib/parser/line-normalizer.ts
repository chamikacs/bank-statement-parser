/**
 * Layer 1: Line Normalization
 * 
 * Prepares raw text for parsing by cleaning and filtering lines.
 * This layer removes noise like headers, footers, page numbers, and
 * standardizes whitespace to make pattern matching more reliable.
 */

/**
 * Common header/footer patterns to filter out
 * These patterns match bank statement noise that should be ignored
 */
const NOISE_PATTERNS = [
  // Page numbers
  /^page\s+\d+/i,
  /^\d+\s+of\s+\d+$/i,
  
  // Common bank headers
  /^statement\s+period/i,
  /^account\s+number/i,
  /^account\s+summary/i,
  /^opening\s+balance/i,
  /^closing\s+balance/i,
  /^total\s+(debits?|credits?)/i,
  
  // Table headers
  /^date\s+(description|details)/i,
  /^(debit|credit|balance)$/i,
  /^amount\s+balance$/i,
  
  // Legal/disclaimer text (usually very long or all caps)
  /^[A-Z\s]{50,}$/,
  
  // Lines that are just symbols or separators
  /^[\-=_\s*]{10,}$/,
  
  // Continued markers
  /^(continued|cont\.|contd)/i,
];

/**
 * Minimum line length to consider (avoid noise)
 */
const MIN_LINE_LENGTH = 10;

/**
 * Maximum line length (avoid paragraphs/disclaimers)
 */
const MAX_LINE_LENGTH = 300;

/**
 * Split text into individual lines
 * 
 * @param text - Raw extracted text
 * @returns Array of individual lines
 */
export function splitIntoLines(text: string): string[] {
  return text.split('\n');
}

/**
 * Normalize a single line
 * 
 * Cleans individual line by:
 * - Trimming whitespace
 * - Removing excessive internal spacing
 * - Standardizing spacing around punctuation
 * 
 * @param line - Raw line
 * @returns Normalized line
 */
export function normalizeLine(line: string): string {
  // Trim leading/trailing whitespace
  let normalized = line.trim();
  
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s{2,}/g, ' ');
  
  // Normalize spacing around common separators
  // E.g., "Date:  15/01/2024" → "Date: 15/01/2024"
  normalized = normalized.replace(/\s*:\s*/g, ': ');
  
  return normalized;
}

/**
 * Check if line is noise (header/footer/separator)
 * 
 * @param line - Line to check
 * @returns True if line should be filtered out
 */
export function isNoiseLine(line: string): boolean {
  // Empty or too short
  if (line.length < MIN_LINE_LENGTH) {
    return true;
  }
  
  // Too long (likely disclaimer or paragraph)
  if (line.length > MAX_LINE_LENGTH) {
    return true;
  }
  
  // Check against noise patterns
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(line)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter out noise lines from array
 * 
 * @param lines - Array of lines
 * @returns Filtered lines without noise
 */
export function filterNoiseLines(lines: string[]): string[] {
  return lines.filter((line) => !isNoiseLine(line));
}

/**
 * Complete line normalization pipeline
 * 
 * Applies all normalization steps:
 * 1. Split into lines
 * 2. Normalize each line
 * 3. Filter noise
 * 4. Remove empty results
 * 
 * @param text - Raw extracted text
 * @returns Clean, normalized lines ready for parsing
 * 
 * @example
 * ```typescript
 * const rawText = "Page 1\\n\\nDate       Description     Amount\\n15/01/2024 Grocery Store   -125.50\\n";
 * const lines = normalizeLines(rawText);
 * // Result: ["15/01/2024 Grocery Store -125.50"]
 * ```
 */
export function normalizeLines(text: string): string[] {
  // Step 1: Split into lines
  const lines = splitIntoLines(text);
  
  // Step 2: Normalize each line
  const normalizedLines = lines.map(normalizeLine);
  
  // Step 3: Filter noise
  const cleanLines = filterNoiseLines(normalizedLines);
  
  // Step 4: Remove any empty lines that slipped through
  return cleanLines.filter((line) => line.length > 0);
}
