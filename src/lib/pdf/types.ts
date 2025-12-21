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
}

export interface PDFText {
  content: string;
  metadata: PDFMetadata;
}
