/**
 * Application State Types
 * 
 * State management types for the converter application
 */

import type { Transaction, ParseMetadata } from './transaction';

export type AppStatus = 'empty' | 'loading' | 'error' | 'success';

export type AppState = 
  | { status: 'empty' }
  | { status: 'loading'; step: number; message: string; progress: number }
  | { status: 'error'; message: string; details?: string; canRetry: boolean }
  | { status: 'success'; transactions: Transaction[]; metadata: ParseMetadata; fileName: string };

export interface ParsingStep {
  id: number;
  label: string;
  description: string;
  icon: string;
}

export const PARSING_STEPS: ParsingStep[] = [
  {
    id: 1,
    label: 'Extracting',
    description: 'Reading PDF content',
    icon: 'document',
  },
  {
    id: 2,
    label: 'Parsing',
    description: 'Identifying transactions',
    icon: 'processing',
  },
  {
    id: 3,
    label: 'Validating',
    description: 'Verifying data quality',
    icon: 'check',
  },
];
