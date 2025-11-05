/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

export interface CSVColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

/**
 * Convert an array of objects to CSV string
 */
export function convertToCSV(data: any[], columns: CSVColumn[]): string {
  if (data.length === 0) {
    return columns.map(col => col.header).join(',');
  }

  // Create header row
  const headerRow = columns.map(col => col.header).join(',');

  // Create data rows
  const dataRows = data.map(item => {
    return columns.map(col => {
      let value = getNestedValue(item, col.key);

      // Apply formatter if provided
      if (col.formatter) {
        value = col.formatter(value);
      }

      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Convert to string
      const stringValue = String(value);

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Get nested object value by dot notation key (e.g., 'user.name')
 */
function getNestedValue(obj: any, key: string): any {
  return key.split('.').reduce((current, prop) => current?.[prop], obj);
}

/**
 * Trigger download of CSV file in browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Format date for CSV export
 */
export function formatDateForCSV(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Format currency for CSV export
 */
export function formatCurrencyForCSV(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return value.toFixed(2);
}
