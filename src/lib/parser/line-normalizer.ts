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
 * Split text into lines, with fallback for poorly formatted PDFs
 * 
 * Some PDFs don't preserve line breaks properly, so we need to detect
 * transaction boundaries by looking for date patterns.
 */
function smartSplitLines(text: string): string[] {
  // First, try normal line splitting
  let lines = text.split('\n');
  
  // If we got very few lines (< 5) but text is long, 
  // the PDF probably doesn't have proper line breaks
  if (lines.length < 5 && text.length > 500) {
    console.log('⚠️ [PARSER] PDF has poor line breaks, using smart splitting...');
    
    // Try to split by date patterns
    // Common bank statement date formats at line start
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,  // DD/MM/YY or DD/MM/YYYY
      /(\d{4}-\d{2}-\d{2})/g,           // YYYY-MM-DD
    ];
    
    let bestSplit = lines;
    
    for (const pattern of datePatterns) {
      const parts: string[] = [];
      let lastIndex = 0;
      const matches = text.matchAll(pattern);
      
      for (const match of matches) {
        if (match.index && match.index > lastIndex) {
          const chunk = text.substring(lastIndex, match.index).trim();
          if (chunk.length > 0) {
            parts.push(chunk);
          }
          lastIndex = match.index;
        }
      }
      
      // Add the last chunk
      if (lastIndex < text.length) {
        const chunk = text.substring(lastIndex).trim();
        if (chunk.length > 0) {
          parts.push(chunk);
        }
      }
      
      // Use this split if it produced more lines
      if (parts.length > bestSplit.length) {
        bestSplit = parts;
        console.log('✅ [PARSER] Smart split produced', parts.length, 'lines');
      }
    }
    
    lines = bestSplit;
  }
  
  return lines;
}

/**
 * Complete line normalization pipeline
 * 
 * Applies all normalization steps:
 * 1. Smart split into lines (handles poor line breaks)
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
  // Step 1: Smart split into lines
  const lines = smartSplitLines(text);
  
  // Step 2: Normalize each line
  const normalizedLines = lines.map(normalizeLine);
  
  // Step 3: Filter noise
  const cleanLines = filterNoiseLines(normalizedLines);
  
  // Step 4: Remove any empty lines that slipped through
  return cleanLines.filter((line) => line.length > 0);
}
