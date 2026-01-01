/**
 * PDF Text Extraction Utility
 * 
 * Robust PDF text extraction with pdfjs-dist
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { normalizeExtractedText, cleanPageText } from './normalize-text';
import type {
  ExtractionOptions,
  ExtractionResult,
  PDFMetadata,
  PDFExtractionError,
} from './types';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Extract text from a single PDF page
 */
async function extractPageText(page: pdfjsLib.PDFPageProxy): Promise<string> {
  try {
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => {
        // TextItem has 'str' property, TextMarkedContent does not
        if ('str' in item) {
          return item.str;
        }
        return '';
      })
      .join(' ');
    
    return cleanPageText(text);
  } catch (error) {
    console.error('Error extracting page text:', error);
    return '';
  }
}

/**
 * Extract metadata from PDF document
 */
async function extractMetadata(
  pdf: PDFDocumentProxy,
  fileName: string,
  fileSize: number
): Promise<PDFMetadata> {
  try {
    const metadata = await pdf.getMetadata();
    const info = metadata.info as Record<string, unknown>;
    
    return {
      fileName,
      fileSize,
      pageCount: pdf.numPages,
      extractionDate: new Date().toISOString(),
      title: typeof info?.Title === 'string' ? info.Title : undefined,
      author: typeof info?.Author === 'string' ? info.Author : undefined,
      subject: typeof info?.Subject === 'string' ? info.Subject : undefined,
      creator: typeof info?.Creator === 'string' ? info.Creator : undefined,
      producer: typeof info?.Producer === 'string' ? info.Producer : undefined,
    };
  } catch (error) {
    // If metadata extraction fails, return basic metadata
    return {
      fileName,
      fileSize,
      pageCount: pdf.numPages,
      extractionDate: new Date().toISOString(),
    };
  }
}

/**
 * Main PDF text extraction function
 * 
 * Extracts text from a PDF file with progress reporting
 */
export async function extractPdfText(
  file: File,
  options: ExtractionOptions = {}
): Promise<ExtractionResult> {
  const { onProgress, signal } = options;

  try {
    // Check if cancelled before starting
    if (signal?.aborted) {
      throw createError(
        'CANCELLED',
        'Extraction cancelled',
        'The extraction was cancelled before it started'
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Check if cancelled after file read
    if (signal?.aborted) {
      throw createError('CANCELLED', 'Extraction cancelled', 'The extraction was cancelled');
    }

    // Load PDF document
    let pdf: PDFDocumentProxy;
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdf = await loadingTask.promise;
    } catch (error) {
      if (error instanceof Error && error.name === 'PasswordException') {
        throw createError(
          'PASSWORD_PROTECTED',
          'PDF is password protected',
          'This tool does not support encrypted or password-protected PDFs. Please remove the password and try again.'
        );
      } else if (error instanceof Error && error.name === 'InvalidPDFException') {
        throw createError(
          'INVALID_PDF',
          'Invalid PDF file',
          'The file does not appear to be a valid PDF document. Please check the file and try again.'
        );
      } else {
        throw createError(
          'LOAD_FAILED',
          'Failed to load PDF',
          error instanceof Error ? error.message : 'An unknown error occurred while loading the PDF'
        );
      }
    }

    // Extract metadata
    const metadata = await extractMetadata(pdf, file.name, file.size);

    // Extract text from all pages
    const pageTexts: string[] = [];
    const totalPages = pdf.numPages;

    // Report initial progress
    onProgress?.({
      currentPage: 0,
      totalPages,
      percentage: 0,
      message: `Loaded PDF with ${totalPages} page${totalPages !== 1 ? 's' : ''}`,
    });

    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      // Check if cancelled
      if (signal?.aborted) {
        throw createError('CANCELLED', 'Extraction cancelled', 'The extraction was cancelled by the user');
      }

      // Get page
      const page = await pdf.getPage(pageNum);

      // Extract text
      const pageText = await extractPageText(page);
      pageTexts.push(pageText);

      // Report progress
      const percentage = Math.round((pageNum / totalPages) * 100);
      onProgress?.({
        currentPage: pageNum,
        totalPages,
        percentage,
        message: `Extracting page ${pageNum} of ${totalPages}...`,
      });
    }

    // Combine all page texts
    const rawText = pageTexts.join('\n\n');

    // Normalize combined text
    const normalizedText = normalizeExtractedText(rawText);

    // Check if any text was extracted
    if (!normalizedText || normalizedText.trim().length === 0) {
      throw createError(
        'NO_TEXT',
        'No text found in PDF',
        'This PDF appears to contain only images or scanned content. This tool requires digital PDFs with selectable text.'
      );
    }

    // Return result
    return {
      text: normalizedText,
      pageCount: totalPages,
      metadata,
    };
  } catch (error) {
    // Re-throw PDFExtractionError as-is
    if (error instanceof Error && error.name === 'PDFExtractionError') {
      throw error;
    }

    // Wrap other errors
    throw createError(
      'EXTRACTION_FAILED',
      'Failed to extract text from PDF',
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
  }
}

/**
 * Helper to create PDFExtractionError
 */
function createError(code: string, message: string, details?: string): PDFExtractionError {
  const error = new Error(message) as PDFExtractionError;
  error.name = 'PDFExtractionError';
  error.code = code;
  error.details = details;
  return error;
}
