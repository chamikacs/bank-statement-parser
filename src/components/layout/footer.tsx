import React from 'react';
import { Alert } from '@/components/ui';

/**
 * Application Footer
 * 
 * Displays limitations, privacy notes, and attribution
 */

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8">
        {/* Limitations Notice */}
        <div className="mb-6">
          <Alert variant="info">
            <div className="space-y-2">
              <p className="font-medium">Important Limitations</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Only <strong>digital (text-based) PDFs</strong> are supported</li>
                <li>Scanned images or OCR is <strong>not supported</strong></li>
                <li>Transaction parsing depends on consistent formatting</li>
                <li>Review parsed data before use — accuracy not guaranteed</li>
              </ul>
            </div>
          </Alert>
        </div>

        {/* Privacy & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">🔒 Privacy First</h3>
            <p>
              All processing happens <strong>in your browser</strong>. Your files never leave your device.
              No data is uploaded to any server.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">⚡ Free & Open</h3>
            <p>
              This tool is completely free to use with no registration required.
              Built with Next.js, TypeScript, and pdfjs-dist.
            </p>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            Bank Statement to CSV Converter © {new Date().getFullYear()}
            {' · '}
            <span className="font-mono text-xs">v1.0.0</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
