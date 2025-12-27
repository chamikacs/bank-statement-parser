/**
 * Layer 3a: Date Extractor
 * 
 * Extracts and normalizes dates from transaction lines.
 * Handles multiple date formats and converts them to ISO format (YYYY-MM-DD).
 */

import type { ExtractedDate } from '../types';

/**
 * Date extraction patterns with their format identifiers
 * Patterns are ordered by specificity to avoid false matches
 */
const DATE_EXTRACTION_PATTERNS = [
  {
    // ISO format: 2024-01-15
    pattern: /\b(\d{4})-(\d{2})-(\d{2})\b/,
    format: 'YYYY-MM-DD',
    parser: (match: RegExpMatchArray): { year: number; month: number; day: number } | null => {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      return { year, month, day };
    },
  },
  {
    // DD/MM/YYYY (European): 15/01/2024, 15-01-2024
    pattern: /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/,
    format: 'DD/MM/YYYY',
    parser: (match: RegExpMatchArray, preferDDMM: boolean = true): { year: number; month: number; day: number } | null => {
      const part1 = parseInt(match[1], 10);
      const part2 = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      // Heuristic to detect DD/MM vs MM/DD:
      // If part1 > 12, it must be day
      // If part2 > 12, it must be day (so part1 is month)
      // Otherwise, use preference
      let day: number;
      let month: number;
      
      if (part1 > 12) {
        day = part1;
        month = part2;
      } else if (part2 > 12) {
        day = part2;
        month = part1;
      } else {
        // Ambiguous - use preference
        if (preferDDMM) {
          day = part1;
          month = part2;
        } else {
          day = part2;
          month = part1;
        }
      }
      
      return { year, month, day };
    },
  },
  {
    // DD MMM YYYY: 15 Jan 2024, 15-Jan-2024
    pattern: /\b(\d{1,2})[\s\-](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-]*(\d{4})\b/i,
    format: 'DD MMM YYYY',
    parser: (match: RegExpMatchArray): { year: number; month: number; day: number } | null => {
      const day = parseInt(match[1], 10);
      const monthStr = match[2];
      const year = parseInt(match[3], 10);
      const month = parseMonthName(monthStr);
      
      if (!month) return null;
      
      return { year, month, day };
    },
  },
  {
    // MMM DD, YYYY: Jan 15, 2024
    pattern: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/i,
    format: 'MMM DD YYYY',
    parser: (match: RegExpMatchArray): { year: number; month: number; day: number } | null => {
      const monthStr = match[1];
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      const month = parseMonthName(monthStr);
      
      if (!month) return null;
      
      return { year, month, day };
    },
  },
  {
    // DD/MM/YY: 15/01/24
    pattern: /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})\b/,
    format: 'DD/MM/YY',
    parser: (match: RegExpMatchArray, preferDDMM: boolean = true): { year: number; month: number; day: number } | null => {
      const part1 = parseInt(match[1], 10);
      const part2 = parseInt(match[2], 10);
      const yearShort = parseInt(match[3], 10);
      
      // Convert 2-digit year to 4-digit (assume 2000-2099)
      const year = yearShort < 50 ? 2000 + yearShort : 1900 + yearShort;
      
      // Same DD/MM vs MM/DD heuristic as above
      let day: number;
      let month: number;
      
      if (part1 > 12) {
        day = part1;
        month = part2;
      } else if (part2 > 12) {
        day = part2;
        month = part1;
      } else {
        if (preferDDMM) {
          day = part1;
          month = part2;
        } else {
          day = part2;
          month = part1;
        }
      }
      
      return { year, month, day };
    },
  },
];

/**
 * Month name to number mapping
 */
const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Parse month name to number
 * 
 * @param monthStr - Month name (Jan, January, etc.)
 * @returns Month number (1-12) or null if invalid
 */
function parseMonthName(monthStr: string): number | null {
  const normalized = monthStr.toLowerCase();
  return MONTH_NAMES[normalized] || null;
}

/**
 * Validate date components
 * 
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @returns True if date is valid
 */
function isValidDate(year: number, month: number, day: number): boolean {
  // Basic bounds check
  if (year < 1990 || year > new Date().getFullYear() + 1) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check if date exists (e.g., Feb 30 doesn't exist)
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Check if date is in reasonable range for bank statements
 * 
 * @param year - Year
 * @param month - Month
 * @param day - Day
 * @returns True if date is in reasonable range
 */
function isDateInReasonableRange(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const oneMonthFuture = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  // Most bank statements are within last year and not in future
  return date >= oneYearAgo && date <= oneMonthFuture;
}

/**
 * Format date to ISO format (YYYY-MM-DD)
 * 
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @returns ISO formatted date string
 */
function formatToISO(year: number, month: number, day: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Extract date from a line
 * 
 * Tries multiple patterns and returns the first valid match.
 * Includes confidence scoring based on format specificity and date validity.
 * 
 * @param line - Line to extract date from
 * @param preferDDMM - Prefer DD/MM format for ambiguous dates (default: true)
 * @returns Extracted date or null if no valid date found
 * 
 * @example
 * ```typescript
 * const result = extractDate("15/01/2024 Purchase -50.00");
 * // result.value === "2024-01-15"
 * // result.format === "DD/MM/YYYY"
 * // result.confidence === 90
 * ```
 */
export function extractDate(line: string, preferDDMM: boolean = true): ExtractedDate | null {
  for (const { pattern, format, parser } of DATE_EXTRACTION_PATTERNS) {
    const match = line.match(pattern);
    if (!match) continue;
    
    // Parse date components
    const parsed = parser(match, preferDDMM);
    if (!parsed) continue;
    
    const { year, month, day } = parsed;
    
    // Validate date
    if (!isValidDate(year, month, day)) continue;
    
    // Format to ISO
    const isoDate = formatToISO(year, month, day);
    
    // Calculate confidence
    let confidence = 70; // Base confidence
    
    // Bonus for specific formats
    if (format === 'YYYY-MM-DD') confidence = 100; // ISO is unambiguous
    if (format.includes('MMM')) confidence += 20;  // Month names are unambiguous
    if (isDateInReasonableRange(year, month, day)) confidence += 10;
    
    confidence = Math.min(confidence, 100);
    
    return {
      value: isoDate,
      original: match[0],
      format,
      confidence,
    };
  }
  
  return null;
}
