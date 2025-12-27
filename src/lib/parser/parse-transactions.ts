/**
 * Main Transaction Parsing Engine
 * 
 * Orchestrates all parsing layers to convert raw PDF text into
 * structured transactions with confidence scores.
 * 
 * Architecture:
 * Layer 1: Line Normalization
 * Layer 2: Candidate Detection
 * Layer 3: Field Extraction (date, amount, description, balance)
 * Layer 4: Validation & Confidence Scoring
 */

import type { Transaction } from '@/types/transaction';
import type { ParsingOptions, ParsingResult, SkippedLine, ParsedTransaction } from './types';

// Layer imports
import { normalizeLines } from './line-normalizer';
import { detectCandidates, filterLikelyCandidates } from './candidate-detector';
import { extractDate } from './field-extractors/date-extractor';
import { extractAmounts, classifyAmounts } from './field-extractors/amount-extractor';
import { extractDescription } from './field-extractors/description-extractor';
import { extractBalance } from './field-extractors/balance-extractor';
import { validateTransaction, isValidTransaction } from './transaction-validator';

/**
 * Parse a single candidate line into a transaction
 * 
 * @param line - Candidate line to parse
 * @param lineNumber - Line number for tracking
 * @param options - Parsing options
 * @returns Parsed transaction or null if parsing failed
 */
function parseLine(
  line: string,
  lineNumber: number,
  options: ParsingOptions
): ParsedTransaction | null {
  // Layer 3a: Extract date
  const preferDDMM = options.dateFormat !== 'MM/DD/YYYY';
  const dateResult = extractDate(line, preferDDMM);
  
  if (!dateResult) {
    return null; // Can't parse without date
  }
  
  // Layer 3b: Extract amounts
  const amounts = extractAmounts(line);
  const { transactionAmount, balance: balanceAmount } = classifyAmounts(amounts);
  
  if (!transactionAmount) {
    return null; // Can't parse without amount
  }
  
  // Layer 3c: Extract description
  const amountTexts = amounts.map((a) => a.original);
  const description = extractDescription(line, dateResult.original, amountTexts);
  
  // Layer 3d: Extract balance
  const balanceResult = balanceAmount || extractBalance(line, transactionAmount.original);
  
  // Build transaction
  const transaction: Transaction = {
    date: dateResult.value,
    description,
    debit: transactionAmount.isDebit ? transactionAmount.value : undefined,
    credit: transactionAmount.isCredit ? transactionAmount.value : undefined,
    balance: balanceResult?.value,
    rawLine: line,
  };
  
  // Layer 4: Validate and score
  const validated = validateTransaction(transaction);
  
  return validated;
}

/**
 * Parse transactions from extracted PDF text
 * 
 * This is the main entry point for the parsing engine.
 * It orchestrates all 4 layers to produce validated transactions.
 * 
 * @param text - Extracted PDF text from Layer 0 (PDF extraction)
 * @param options - Parsing options
 * @returns Parsing result with transactions, skipped lines, and metadata
 * 
 * @example
 * ```typescript
 * const text = await extractPdfText(file);
 * const result = await parseTransactions(text, { minConfidence: 70 });
 * 
 * console.log(`Parsed ${result.transactions.length} transactions`);
 * console.log(`Average confidence: ${result.metadata.avgConfidence}%`);
 * ```
 */
export async function parseTransactions(
  text: string,
  options: ParsingOptions = {}
): Promise<ParsingResult> {
  // Set defaults
  const opts: Required<ParsingOptions> = {
    minConfidence: options.minConfidence ?? 60,
    dateFormat: options.dateFormat ?? 'auto',
    strict: options.strict ?? false,
  };
  
  // Layer 1: Normalize lines
  const normalized = normalizeLines(text);
  
  // Layer 2: Detect candidates
  const candidates = detectCandidates(normalized);
  const likelyCandidates = filterLikelyCandidates(candidates);
  
  // Layer 3 & 4: Parse each candidate
  const parsed: ParsedTransaction[] = [];
  const skipped: SkippedLine[] = [];
  
  for (const candidate of likelyCandidates) {
    const transaction = parseLine(candidate.line, candidate.lineNumber, opts);
    
    if (!transaction) {
      skipped.push({
        line: candidate.line,
        lineNumber: candidate.lineNumber,
        reason: 'Failed to extract required fields',
        confidence: 0,
      });
      continue;
    }
    
    // Check if meets minimum confidence
    if (isValidTransaction(transaction, opts.minConfidence)) {
      parsed.push(transaction);
    } else {
      skipped.push({
        line: candidate.line,
        lineNumber: candidate.lineNumber,
        reason: `Low confidence (${transaction.confidence}%). Issues: ${transaction.issues.join(', ')}`,
        confidence: transaction.confidence,
      });
    }
  }
  
  // Sort transactions by date (oldest first)
  const sorted = parsed.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Calculate average confidence
  const avgConfidence = sorted.length > 0
    ? Math.round(sorted.reduce((sum, t) => sum + t.confidence, 0) / sorted.length)
    : 0;
  
  // Build metadata
  const metadata = {
    totalLines: normalized.length,
    candidateLines: likelyCandidates.length,
    parsedTransactions: sorted.length,
    skippedLines: skipped.length,
    avgConfidence,
    parseDate: new Date().toISOString(),
  };
  
  // Convert ParsedTransaction to Transaction (remove metadata)
  const transactions: Transaction[] = sorted.map((t) => ({
    date: t.date,
    description: t.description,
    debit: t.debit,
    credit: t.credit,
    balance: t.balance,
    rawLine: t.rawLine,
  }));
  
  return {
    transactions,
    skipped,
    metadata,
  };
}
