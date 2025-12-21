/**
 * PDF Utilities
 * 
 * Centralized exports for PDF processing
 */

export { extractPdfText } from './extract-text';
export {
  normalizeExtractedText,
  normalizeLineBreaks,
  normalizeWhitespace,
  removeControlCharacters,
  cleanPageText,
} from './normalize-text';

export type {
  PDFMetadata,
  PDFText,
  ExtractionProgress,
  ExtractionOptions,
  ExtractionResult,
} from './types';

export { PDFExtractionError } from './types';
