/**
 * Transaction Type Definitions
 * 
 * Core domain model for bank statement transactions
 */

export interface Transaction {
  /**
   * Transaction date in ISO 8601 format (YYYY-MM-DD)
   * Corresponds to DATE column
   */
  date: string;
  
  /**
   * Transaction description/narrative
   * Corresponds to PARTICULARS column
   */
  description: string;
  
  /**
   * Payment amount (money out)
   * Corresponds to PAYMENTS column
   */
  payment?: number;
  
  /**
   * Receipt amount (money in)
   * Corresponds to RECEIPTS column
   */
  receipt?: number;
  
  /**
   * Account balance after transaction
   * Corresponds to BALANCE column
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
