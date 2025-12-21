/**
 * File Metadata Types
 * 
 * Types for uploaded file information
 */

export interface FileMetadata {
  name: string;
  size: number;
  formattedSize: string;
  type: string;
  lastModified: Date;
}

export interface PDFFileInfo extends FileMetadata {
  pageCount?: number;
  isTextBased?: boolean;
}
