/**
 * CSV Type Definitions
 * 
 * Types for CSV generation domain
 */

export interface CSVConfig {
  delimiter: string;
  includeHeaders: boolean;
  dateFormat: 'iso' | 'locale';
  amountFormat: 'decimal' | 'accounting';
}

export interface CSVGenerationResult {
  csv: string;
  rowCount: number;
  fileName: string;
}
