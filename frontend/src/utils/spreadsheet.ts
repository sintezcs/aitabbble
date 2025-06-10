/**
 * Generate a cell ID from row and column IDs
 */
export function getCellId(rowId: string, colId: string): string {
  return `${rowId}-${colId}`;
}

/**
 * Parse a cell ID back into row and column IDs
 */
export function parseCellId(cellId: string): { rowId: string; colId: string } | null {
  const parts = cellId.split('-');
  if (parts.length !== 2) return null;
  
  return {
    rowId: parts[0],
    colId: parts[1],
  };
}

/**
 * Convert column index to Excel-style column label (A, B, C, ..., AA, AB, etc.)
 */
export function getColumnLabel(index: number): string {
  let result = '';
  let num = index;
  
  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
    if (num < 0) break;
  }
  
  return result;
}

/**
 * Generate a unique row ID
 */
export function generateRowId(existingIds: string[]): string {
  let counter = 1;
  let newId = `row${counter}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `row${counter}`;
  }
  
  return newId;
}

/**
 * Generate a unique column ID
 */
export function generateColumnId(existingIds: string[]): string {
  let counter = 1;
  let newId = `col${counter}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `col${counter}`;
  }
  
  return newId;
} 