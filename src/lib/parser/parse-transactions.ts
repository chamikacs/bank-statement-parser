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
    console.log('  ❌ No date found in line:', line);
    return null; // Can't parse without date
  }
  
  console.log('  ✅ Date extracted:', dateResult.value, '(confidence:', dateResult.confidence + '%)');
  
  // Layer 3b: Extract amounts (pass date to help isolate amounts section)
  const amounts = extractAmounts(line, dateResult.original);
  const { transactionAmount, balance: balanceAmount } = classifyAmounts(amounts);
  
  console.log('  💰 Amounts found:', amounts.length, '- Transaction:', transactionAmount?.value, 'Balance:', balanceAmount?.value);
  
  if (!transactionAmount) {
    console.log('  ❌ No transaction amount found');
    return null; // Can't parse without amount
  }
  
  // Smart debit/credit detection based on description keywords
  // This helps classify transactions from bank statements that use PAYMENTS/RECEIPTS columns
  let finalIsDebit = transactionAmount.isDebit;
  let finalIsCredit = transactionAmount.isCredit;
  
  // Check for debit keywords in the line
  const hasDebitKeyword = [
    'KAS-IB-TRF TO',
    'KAS-cc',
    'KAS-chamika',  
    'KAS-EFT-Chg',
    'Cash advance',
  ].some(keyword => line.includes(keyword));
  
  // Check for credit keywords in the line
  const hasCreditKeyword = [
    'KAS-IB-TRF FROM',
    'OPENING BALANCE',
    'DEPOSIT',
  ].some(keyword => line.includes(keyword));
  
  // Override classification based on keywords (only  if not already explicitly set by pattern)
  if (!transactionAmount.isCredit && !transactionAmount.isDebit) {
    if (hasDebitKeyword) {
      finalIsDebit = true;
      finalIsCredit = false;
      console.log('  🔍 Detected DEBIT from keyword');
    } else if (hasCreditKeyword) {
      finalIsDebit = false;
      finalIsCredit = true;
      console.log('  🔍 Detected CREDIT from keyword');
    }
  }
  
  // Layer 3c: Extract description
  const amountTexts = amounts.map((a) => a.original);
  const description = extractDescription(line, dateResult.original, amountTexts);
  console.log('  📝 Description:', description);
  
  // Layer 3d: Extract balance - it's the last amount with "Cr" or "Dr"
  // Look for pattern like "6,588.00 Cr" at the end
  const balancePattern = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s+(?:Cr|Dr)\s*$/i;
  const balanceMatch = line.match(balancePattern);
  let balance: number | undefined;
  
  if (balanceMatch) {
    const balanceStr = balanceMatch[1].replace(/,/g, '');
    balance = parseFloat(balanceStr);
    console.log('  💼 Balance extracted:', balance);
  }
  
  // Build transaction using bank statement terminology
  const transaction: Transaction = {
    date: dateResult.value,
    description,
    payment: finalIsDebit ? transactionAmount.value : undefined,    // PAYMENTS column
    receipt: finalIsCredit ? transactionAmount.value : undefined,   // RECEIPTS column
    balance: balance,                                                // BALANCE column
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
  console.log('🔍 [PARSER] Starting transaction parsing...');
  console.log('📝 [PARSER] Input text length:', text.length, 'characters');
  console.log('⚙️ [PARSER] Options:', options);
  
  // Set defaults
  const opts: Required<ParsingOptions> = {
    minConfidence: options.minConfidence ?? 50, // Lowered from 60 to accept more valid transactions
    dateFormat: options.dateFormat ?? 'auto',
    strict: options.strict ?? false,
  };
  
  console.log('\n📋 [LAYER 1] Normalizing lines...');
  // Layer 1: Normalize lines
  const normalized = normalizeLines(text);
  console.log('✅ [LAYER 1] Normalized lines count:', normalized.length);
  console.log('📄 [LAYER 1] First 5 lines:', normalized.slice(0, 5));
  
  console.log('\n🎯 [LAYER 2] Detecting candidate transaction lines...');
  // Layer 2: Detect candidates
  const candidates = detectCandidates(normalized);
  const likelyCandidates = filterLikelyCandidates(candidates);
  console.log('✅ [LAYER 2] Total candidates:', candidates.length);
  console.log('✅ [LAYER 2] Likely transaction candidates:', likelyCandidates.length);
  if (likelyCandidates.length > 0) {
    console.log('📄 [LAYER 2] First candidate:', likelyCandidates[0]);
  }
  
  console.log('\n⚙️ [LAYER 3 & 4] Parsing and validating candidates...');
  // Layer 3 & 4: Parse each candidate
  const parsed: ParsedTransaction[] = [];
  const skipped: SkippedLine[] = [];
  
  for (const candidate of likelyCandidates) {
    const transaction = parseLine(candidate.line, candidate.lineNumber, opts);
    
    if (!transaction) {
      console.log('❌ [PARSER] Failed to parse line', candidate.lineNumber + ':', candidate.line);
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
      console.log('✅ [PARSER] Accepted transaction (confidence:', transaction.confidence + '%):', transaction.description);
      parsed.push(transaction);
    } else {
      console.log('⚠️ [PARSER] Rejected low-confidence transaction (', transaction.confidence + '%):', transaction.description);
      skipped.push({
        line: candidate.line,
        lineNumber: candidate.lineNumber,
        reason: `Low confidence (${transaction.confidence}%). Issues: ${transaction.issues.join(', ')}`,
        confidence: transaction.confidence,
      });
    }
  }
  
  console.log('\n📊 [RESULTS] Parsing complete!');
  console.log('✅ Accepted transactions:', parsed.length);
  console.log('❌ Skipped lines:', skipped.length);
  
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
    payment: t.payment,
    receipt: t.receipt,
    balance: t.balance,
    rawLine: t.rawLine,
  }));
  
  return {
    transactions,
    skipped,
    metadata,
  };
}
