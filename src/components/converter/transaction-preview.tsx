import React from 'react';
import {
  Card,
  CardHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from '@/components/ui';
import type { Transaction, ParseMetadata } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils/format';

/**
 * Transaction Preview Component
 * 
 * Displays parsed transactions in a table with summary statistics
 */

interface TransactionPreviewProps {
  transactions: Transaction[];
  metadata: ParseMetadata;
  fileName: string;
}

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({
  transactions,
  metadata,
  fileName,
}) => {
  // Calculate summary statistics using bank statement terminology
  const totalReceipts = transactions.reduce((sum, t) => sum + (t.receipt || 0), 0);
  const totalPayments = transactions.reduce((sum, t) => sum + (t.payment || 0), 0);
  const netChange = totalReceipts - totalPayments;

  // Get date range
  const dates = transactions.map((t) => new Date(t.date));
  const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" shadow="sm">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-3xl font-bold text-foreground">{transactions.length}</p>
          </div>
        </Card>

        <Card padding="md" shadow="sm">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Receipts</p>
            <p className="text-3xl font-bold text-[var(--color-success-600)]">
              {formatCurrency(totalReceipts)}
            </p>
          </div>
        </Card>

        <Card padding="md" shadow="sm">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-3xl font-bold text-[var(--color-error-600)]">
              {formatCurrency(totalPayments)}
            </p>
          </div>
        </Card>

        <Card padding="md" shadow="sm">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Net Change</p>
            <p
              className={`text-3xl font-bold ${
                netChange >= 0 ? 'text-[var(--color-success-600)]' : 'text-[var(--color-error-600)]'
              }`}
            >
              {netChange >= 0 ? '+' : ''}
              {formatCurrency(netChange)}
            </p>
          </div>
        </Card>
      </div>

      {/* Metadata Info */}
      <Card padding="md" shadow="sm">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">File:</span>
            <span className="font-medium font-mono text-foreground">{fileName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Date Range:</span>
            <span className="font-medium text-foreground">
              {formatDate(earliestDate)} — {formatDate(latestDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Parsed:</span>
            <Badge variant="success" size="sm">
              {metadata.parsedLines} / {metadata.totalLines} lines
            </Badge>
          </div>
          {metadata.skippedLines > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Skipped:</span>
              <Badge variant="warning" size="sm">
                {metadata.skippedLines} lines
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Transaction Table */}
      <Card padding="none" shadow="sm">
        <CardHeader>
          <div className="px-6">
            <h2 className="text-xl font-semibold text-foreground">Transaction Details</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Review your parsed transactions before exporting
            </p>
          </div>
        </CardHeader>

        <div className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead align="right">Payments</TableHead>
                <TableHead align="right">Receipts</TableHead>
                <TableHead align="right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <span className="font-mono text-sm whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-2">{transaction.description}</span>
                  </TableCell>
                  <TableCell align="right">
                    {transaction.payment ? (
                      <span className="text-[var(--color-error-600)] font-medium font-mono">
                        {formatCurrency(transaction.payment)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {transaction.receipt ? (
                      <span className="text-[var(--color-success-600)] font-medium font-mono">
                        {formatCurrency(transaction.receipt)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {transaction.balance !== undefined ? (
                      <span className="font-mono font-medium">
                        {formatCurrency(transaction.balance)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
