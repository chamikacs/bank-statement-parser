/**
 * Parser Type Definitions
 * 
 * Types for transaction parsing domain
 */

export interface ParserConfig {
  dateFormats: string[];
  amountPattern: RegExp;
  descriptionMinLength: number;
}

export interface ParserResult {
  success: boolean;
  linesProcessed: number;
  linesParsed: number;
  linesSkipped: number;
}
