/**
 * PDF Type Definitions
 * 
 * Types for PDF processing domain
 */

export interface PDFMetadata {
  fileName: string;
  fileSize: number;
  pageCount: number;
  extractionDate: string;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
}

export interface PDFText {
  content: string;
  metadata: PDFMetadata;
}

export interface ExtractionProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  message: string;
}

export interface ExtractionOptions {
  onProgress?: (progress: ExtractionProgress) => void;
  signal?: AbortSignal;
}

export interface ExtractionResult {
  text: string;
  pageCount: number;
  metadata: PDFMetadata;
}

export class PDFExtractionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = 'PDFExtractionError';
  }
}
