import React from 'react';

/**
 * Table Component
 * 
 * Professional data table component for displaying transactions
 * Supports TypeScript generics for type-safe data rendering
 */

export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

const alignmentStyles = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className={`w-full border-collapse ${className}`.trim()}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-[var(--muted)] ${className}`.trim()}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className = '', onClick }) => {
  const baseStyles = `
    border-b border-[var(--border)] last:border-0
    transition-colors duration-[var(--transition-fast)]
  `;
  
  const interactiveStyles = onClick ? 'cursor-pointer hover:bg-[var(--muted)]/50' : '';

  return (
    <tr
      className={`${baseStyles} ${interactiveStyles} ${className}`.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className = '', 
  align = 'left' 
}) => {
  return (
    <th
      className={`
        px-4 py-3
        text-sm font-semibold
        text-[var(--foreground)]
        ${alignmentStyles[align]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  align = 'left' 
}) => {
  return (
    <td
      className={`
        px-4 py-3
        text-sm
        text-[var(--foreground)]
        ${alignmentStyles[align]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </td>
  );
};
