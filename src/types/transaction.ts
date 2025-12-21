/**
 * Transaction Type Definitions
 * 
 * Core domain model for bank statement transactions
 */

export interface Transaction {
  /**
   * Transaction date in ISO 8601 format (YYYY-MM-DD)
   */
  date: string;
  
  /**
   * Transaction description/narrative
   */
  description: string;
  
  /**
   * Debit amount (money out)
   */
  debit?: number;
  
  /**
   * Credit amount (money in)
   */
  credit?: number;
  
  /**
   * Account balance after transaction
   */
  balance?: number;
  
  /**
   * Original raw line from PDF for debugging and reference
   */
  rawLine: string;
}

/**
 * Result of parsing operations
 */
export interface ParseResult {
  transactions: Transaction[];
  errors: ParseError[];
  metadata: ParseMetadata;
}

/**
 * Parse error information
 */
export interface ParseError {
  line: number;
  rawLine: string;
  message: string;
}

/**
 * Metadata about the parsing operation
 */
export interface ParseMetadata {
  totalLines: number;
  parsedLines: number;
  skippedLines: number;
  parseDate: string;
}
