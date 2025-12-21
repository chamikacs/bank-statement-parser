'use client';

import React from 'react';
import { Button } from '@/components/ui';

/**
 * Export Actions Component
 * 
 * CSV export controls and secondary actions
 */

interface ExportActionsProps {
  onExport: () => void;
  onReset: () => void;
  isExporting?: boolean;
  transactionCount: number;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onExport,
  onReset,
  isExporting = false,
  transactionCount,
}) => {
  return (
    <div className="bg-muted/30 border border-border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-foreground">
            Ready to Export
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''} will be exported to CSV format
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={onReset}
            disabled={isExporting}
          >
            Start Over
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            onClick={onExport}
            isLoading={isExporting}
          >
            {isExporting ? 'Generating...' : 'Download CSV'}
          </Button>
        </div>
      </div>
    </div>
  );
};
