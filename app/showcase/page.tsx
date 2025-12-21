'use client';

import React, { useState } from 'react';
import { 
  Button, 
  Badge, 
  Alert, 
  Card, 
  CardHeader, 
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';
import type { Transaction } from '@/types/transaction';

/**
 * Component Showcase
 * 
 * Visual demonstration of all UI components in the design system
 */

export default function ShowcasePage() {
  const [showAlert, setShowAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sample transaction data
  const sampleTransactions: Transaction[] = [
    {
      date: '2024-01-15',
      description: 'Grocery Store Purchase',
      debit: 125.50,
      balance: 2450.75,
      rawLine: '15/01/2024 Grocery Store Purchase -125.50 2450.75',
    },
    {
      date: '2024-01-16',
      description: 'Salary Deposit',
      credit: 3500.00,
      balance: 5950.75,
      rawLine: '16/01/2024 Salary Deposit +3500.00 5950.75',
    },
    {
      date: '2024-01-17',
      description: 'Utility Bill Payment',
      debit: 89.25,
      balance: 5861.50,
      rawLine: '17/01/2024 Utility Bill Payment -89.25 5861.50',
    },
  ];

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-bold text-foreground">
            Design System Showcase
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bank Statement to CSV Converter - UI Component Library
          </p>
        </div>

        {/* Buttons Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Buttons</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All button variants and sizes with interactive states
            </p>
          </CardHeader>

          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-lg font-medium mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-medium mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleLoadingDemo} isLoading={isLoading}>
                  {isLoading ? 'Processing...' : 'Click to Load'}
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Badges Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Badges</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Status indicators for different states
            </p>
          </CardHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="success">Success</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge size="sm">Small Badge</Badge>
                <Badge size="md">Medium Badge</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts Section */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Alerts</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Important messages and notifications
            </p>
          </CardHeader>

          <div className="space-y-4">
            <Alert variant="success" title="Success">
              Your transactions have been parsed successfully. 127 transactions found.
            </Alert>

            <Alert variant="error" title="Error">
              Failed to read PDF file. Please ensure the file is a valid text-based PDF.
            </Alert>

            <Alert variant="warning" title="Warning">
              10 transaction rows could not be parsed. Review the raw data for inconsistencies.
            </Alert>

            <Alert variant="info">
              Select a PDF file to begin parsing your bank statement transactions.
            </Alert>

            {showAlert && (
              <Alert
                variant="info"
                title="Dismissible Alert"
                dismissible
                onDismiss={() => setShowAlert(false)}
              >
                This alert can be dismissed. Click the × button to close it.
              </Alert>
            )}
            {!showAlert && (
              <Button variant="outline" size="sm" onClick={() => setShowAlert(true)}>
                Show Dismissible Alert
              </Button>
            )}
          </div>
        </Card>

        {/* Table Section */}
        <Card className="animate-slide-up" padding="none">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-semibold">Table</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Transaction data display with responsive design
            </p>
          </div>

          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead align="right">Debit</TableHead>
                  <TableHead align="right">Credit</TableHead>
                  <TableHead align="right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      {transaction.debit ? (
                        <span className="text-error-600 font-medium">
                          -${transaction.debit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {transaction.credit ? (
                        <span className="text-success-600 font-medium">
                          +${transaction.credit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <span className="font-mono font-medium">
                        ${transaction.balance?.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Card Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card shadow="sm" className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2">Small Shadow</h3>
            <p className="text-sm text-muted-foreground">
              Subtle elevation for secondary content
            </p>
          </Card>

          <Card shadow="md" className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2">Medium Shadow</h3>
            <p className="text-sm text-muted-foreground">
              Default card elevation for primary content
            </p>
          </Card>

          <Card shadow="lg" className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2">Large Shadow</h3>
            <p className="text-sm text-muted-foreground">
              Prominent elevation for featured content
            </p>
          </Card>
        </div>

        {/* Card with Header/Footer */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-xl font-semibold">Card with Header and Footer</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Structured content sections
            </p>
          </CardHeader>

          <div className="space-y-3">
            <p className="text-muted-foreground">
              This demonstrates a card with distinct header and footer sections,
              useful for forms, dialogs, and structured content areas.
            </p>
            <p className="text-sm text-muted-foreground">
              The design system provides flexible composition through sub-components.
            </p>
          </div>

          <CardFooter>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary">Confirm</Button>
            </div>
          </CardFooter>
        </Card>

        {/* Typography */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Typography</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Font scale and text styles
            </p>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <p className="text-5xl font-bold">Heading 1</p>
              <p className="text-xs text-muted-foreground mt-1">text-5xl font-bold</p>
            </div>
            <div>
              <p className="text-4xl font-bold">Heading 2</p>
              <p className="text-xs text-muted-foreground mt-1">text-4xl font-bold</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">Heading 3</p>
              <p className="text-xs text-muted-foreground mt-1">text-3xl font-semibold</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">Heading 4</p>
              <p className="text-xs text-muted-foreground mt-1">text-2xl font-semibold</p>
            </div>
            <div>
              <p className="text-xl font-medium">Heading 5</p>
              <p className="text-xs text-muted-foreground mt-1">text-xl font-medium</p>
            </div>
            <div>
              <p className="text-base">Body text - The quick brown fox jumps over the lazy dog</p>
              <p className="text-xs text-muted-foreground mt-1">text-base</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Small text - Additional information or helper text
              </p>
              <p className="text-xs text-muted-foreground mt-1">text-sm text-muted-foreground</p>
            </div>
            <div>
              <p className="font-mono text-sm">
                Monospace - 2024-01-15 | $1,234.56 | Transaction ID: TXN-2024-001
              </p>
              <p className="text-xs text-muted-foreground mt-1">font-mono text-sm</p>
            </div>
          </div>
        </Card>

        {/* Color Palette */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Color Palette</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Design system colors
            </p>
          </CardHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Primary</h3>
              <div className="flex gap-2">
                <div className="flex-1 h-16 bg-[var(--color-primary-500)] rounded-lg flex items-end p-2">
                  <span className="text-xs text-white font-medium">500</span>
                </div>
                <div className="flex-1 h-16 bg-[var(--color-primary-600)] rounded-lg flex items-end p-2">
                  <span className="text-xs text-white font-medium">600</span>
                </div>
                <div className="flex-1 h-16 bg-[var(--color-primary-700)] rounded-lg flex items-end p-2">
                  <span className="text-xs text-white font-medium">700</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Neutral</h3>
              <div className="flex gap-2">
                <div className="flex-1 h-16 bg-[var(--color-neutral-100)] rounded-lg border flex items-end p-2">
                  <span className="text-xs font-medium">100</span>
                </div>
                <div className="flex-1 h-16 bg-[var(--color-neutral-300)] rounded-lg flex items-end p-2">
                  <span className="text-xs font-medium">300</span>
                </div>
                <div className="flex-1 h-16 bg-[var(--color-neutral-500)] rounded-lg flex items-end p-2">
                  <span className="text-xs text-white font-medium">500</span>
                </div>
                <div className="flex-1 h-16 bg-[var(--color-neutral-700)] rounded-lg flex items-end p-2">
                  <span className="text-xs text-white font-medium">700</span>
                </div>
                <div className="flex-1 h-16 bg-[var(--color-neutral-900)] rounded-lg flex items-end p-2">
                  <span className="text-xs text-white font-medium">900</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Success</h3>
                <div className="h-12 bg-[var(--color-success-500)] rounded-lg"></div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Error</h3>
                <div className="h-12 bg-[var(--color-error-500)] rounded-lg"></div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Warning</h3>
                <div className="h-12 bg-[var(--color-warning-500)] rounded-lg"></div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Info</h3>
                <div className="h-12 bg-[var(--color-info-500)] rounded-lg"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
