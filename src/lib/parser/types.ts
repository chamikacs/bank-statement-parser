/**
 * Parser Type Definitions
 * 
 * Types for transaction parsing domain
 */

import type { Transaction } from '@/types/transaction';

/**
 * Parsing options for customizing parser behavior
 */
export interface ParsingOptions {
  minConfidence?: number;     // Minimum confidence score to accept (default: 60)
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'auto'; // Expected date format
  strict?: boolean;           // If true, reject all low confidence transactions
}

/**
 * Candidate line detected by Layer 2
 */
export interface CandidateLine {
  line: string;
  lineNumber: number;
  hasDate: boolean;
  hasAmount: boolean;
  hasBalance: boolean;
  likelyTransaction: boolean;
}

/**
 * Confidence scoring factors
 */
export interface ConfidenceFactors {
  hasValidDate: boolean;        // +30 points
  hasAmount: boolean;            // +25 points
  hasDescription: boolean;       // +15 points
  hasBalance: boolean;           // +10 points
  amountFormatValid: boolean;    // +10 points
  dateInReasonableRange: boolean; // +10 points
}

/**
 * Parsed transaction with confidence metadata
 */
export interface ParsedTransaction extends Transaction {
  confidence: number; // 0-100
  factors: ConfidenceFactors;
  issues: string[];   // List of parsing issues/warnings
}

/**
 * Skipped line with reason
 */
export interface SkippedLine {
  line: string;
  lineNumber: number;
  reason: string;
  confidence: number;
}

/**
 * Parsing result metadata
 */
export interface ParsingMetadata {
  totalLines: number;
  candidateLines: number;
  parsedTransactions: number;
  skippedLines: number;
  avgConfidence: number;
  parseDate: string;
}

/**
 * Complete parsing result
 */
export interface ParsingResult {
  transactions: Transaction[];
  skipped: SkippedLine[];
  metadata: ParsingMetadata;
}

/**
 * Extracted date information
 */
export interface ExtractedDate {
  value: string;      // ISO format YYYY-MM-DD
  original: string;   // Original text
  format: string;     // Detected format
  confidence: number; // 0-100
}

/**
 * Extracted amount information
 */
export interface ExtractedAmount {
  value: number;
  original: string;
  isDebit: boolean;
  isCredit: boolean;
  confidence: number;
}

/**
 * Extracted balance information
 */
export interface ExtractedBalance {
  value: number;
  original: string;
  confidence: number;
}
