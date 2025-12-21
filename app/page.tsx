'use client';

import React, { useState } from 'react';
import { MainLayout, Header, Footer } from '@/components/layout';
import {
  PDFUploader,
  ProgressIndicator,
  TransactionPreview,
  ExportActions,
} from '@/components/converter';
import { Button, Alert, Card } from '@/components/ui';
import type { AppState } from '@/types/app-state';
import type { Transaction, ParseMetadata } from '@/types/transaction';

/**
 * Main Application Page
 * 
 * Bank Statement to CSV Converter
 */

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ status: 'empty' });

  // Mock file upload handler (will be replaced with real implementation)
  const handleFileSelect = async (file: File) => {
    try {
      // Set loading state
      setAppState({
        status: 'loading',
        step: 1,
        message: 'Extracting text from PDF...',
        progress: 0,
      });

      // Simulate step 1
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAppState({
        status: 'loading',
        step: 1,
        message: 'Reading PDF pages...',
        progress: 30,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate step 2
      setAppState({
        status: 'loading',
        step: 2,
        message: 'Analyzing transaction patterns...',
        progress: 50,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAppState({
        status: 'loading',
        step: 2,
        message: 'Parsing dates and amounts...',
        progress: 70,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate step 3
      setAppState({
        status: 'loading',
        step: 3,
        message: 'Validating transaction data...',
        progress: 90,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful parsing
      const mockTransactions: Transaction[] = [
        {
          date: '2024-01-15',
          description: 'Grocery Store Purchase - Whole Foods',
          debit: 125.50,
          balance: 2450.75,
          rawLine: '15/01/2024 Grocery Store Purchase - Whole Foods -125.50 2450.75',
        },
        {
          date: '2024-01-16',
          description: 'Salary Deposit - ACME Corp',
          credit: 3500.00,
          balance: 5950.75,
          rawLine: '16/01/2024 Salary Deposit - ACME Corp +3500.00 5950.75',
        },
        {
          date: '2024-01-17',
          description: 'Utility Bill Payment - Electric Company',
          debit: 89.25,
          balance: 5861.50,
          rawLine: '17/01/2024 Utility Bill Payment - Electric Company -89.25 5861.50',
        },
        {
          date: '2024-01-18',
          description: 'Online Purchase - Amazon.com',
          debit: 45.99,
          balance: 5815.51,
          rawLine: '18/01/2024 Online Purchase - Amazon.com -45.99 5815.51',
        },
        {
          date: '2024-01-20',
          description: 'ATM Withdrawal',
          debit: 100.00,
          balance: 5715.51,
          rawLine: '20/01/2024 ATM Withdrawal -100.00 5715.51',
        },
      ];

      const mockMetadata: ParseMetadata = {
        totalLines: 50,
        parsedLines: 45,
        skippedLines: 5,
        parseDate: new Date().toISOString(),
      };

      setAppState({
        status: 'success',
        transactions: mockTransactions,
        metadata: mockMetadata,
        fileName: file.name,
      });
    } catch (error) {
      setAppState({
        status: 'error',
        message: 'Failed to parse PDF file',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        canRetry: true,
      });
    }
  };

  const handleExport = () => {
    if (appState.status !== 'success') return;

    // Mock CSV export (will be replaced with real implementation)
    const csv = [
      'Date,Description,Debit,Credit,Balance',
      ...appState.transactions.map((t) =>
        [
          t.date,
          `"${t.description}"`,
          t.debit || '',
          t.credit || '',
          t.balance || '',
        ].join(',')
      ),
    ].join('\n');

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = appState.fileName.replace('.pdf', '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setAppState({ status: 'empty' });
  };

  return (
    <MainLayout>
      <Header />

      <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 sm:px-8">
        {/* Empty State */}
        {appState.status === 'empty' && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
                Convert Bank Statements to CSV
              </h2>
              <p className="text-lg text-muted-foreground">
                Upload your PDF bank statement and get a clean, organized CSV file in seconds.
                Fast, secure, and completely free.
              </p>
            </div>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto">
              <PDFUploader onFileSelect={handleFileSelect} />
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              <Card padding="lg" shadow="sm" className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[var(--color-primary-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">100% Private</h3>
                <p className="text-sm text-muted-foreground">
                  All processing happens in your browser. Your data never leaves your device.
                </p>
              </Card>

              <Card padding="lg" shadow="sm" className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[var(--color-success-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Convert thousands of transactions in seconds with our optimized parser.
                </p>
              </Card>

              <Card padding="lg" shadow="sm" className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-info-100)] dark:bg-[var(--color-info-900)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[var(--color-info-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Always Free</h3>
                <p className="text-sm text-muted-foreground">
                  No hidden fees, no subscriptions. Use it as much as you need, completely free.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Loading State */}
        {appState.status === 'loading' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <Card padding="lg" shadow="md">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
                Processing Your Bank Statement
              </h2>
              <ProgressIndicator
                currentStep={appState.step}
                progress={appState.progress}
                message={appState.message}
              />
            </Card>
          </div>
        )}

        {/* Error State */}
        {appState.status === 'error' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Alert variant="error" title="Parsing Failed">
              <div className="space-y-3">
                <p>{appState.message}</p>
                {appState.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Technical details</summary>
                    <pre className="mt-2 p-3 bg-[var(--color-error-50)] dark:bg-[var(--color-error-950)] rounded text-xs overflow-x-auto">
                      {appState.details}
                    </pre>
                  </details>
                )}
              </div>
            </Alert>

            <Card padding="lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Common Issues</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-600)] mt-0.5">•</span>
                  <span>Make sure the PDF contains <strong>text data</strong>, not just scanned images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-600)] mt-0.5">•</span>
                  <span>PDF should be a valid bank statement with transaction data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-primary-600)] mt-0.5">•</span>
                  <span>File size should be less than 10MB</span>
                </li>
              </ul>

              <div className="flex gap-3 mt-6">
                {appState.canRetry && (
                  <Button variant="primary" onClick={handleReset}>
                    Try Another File
                  </Button>
                )}
                <Button variant="outline" onClick={handleReset}>
                  Start Over
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Success State */}
        {appState.status === 'success' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success-100)] dark:bg-[var(--color-success-900)] mb-4">
                <svg className="w-8 h-8 text-[var(--color-success-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Successfully Parsed!
              </h2>
              <p className="text-lg text-muted-foreground">
                Your bank statement has been converted. Review the data below.
              </p>
            </div>

            <TransactionPreview
              transactions={appState.transactions}
              metadata={appState.metadata}
              fileName={appState.fileName}
            />

            <ExportActions
              onExport={handleExport}
              onReset={handleReset}
              transactionCount={appState.transactions.length}
            />
          </div>
        )}
      </main>

      <Footer />
    </MainLayout>
  );
}
