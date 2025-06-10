export interface ColumnDef {
  id: string;
  label: string;
  width?: number;
}

export interface Row {
  id: string;
  [key: string]: string | number | boolean | null;
}

export interface SelectedCell {
  rowId: string;
  colId: string;
}

export interface SpreadsheetState {
  columns: ColumnDef[];
  data: Row[];
  aiFormulas: Record<string, string>;
  selectedCell: SelectedCell | null;
}

export interface CellProps {
  rowId: string;
  colId: string;
  value: string | number | boolean | null;
  isSelected: boolean;
  hasFormula: boolean;
  isCalculating?: boolean;
  onCellClick: (rowId: string, colId: string) => void;
  onCellChange: (rowId: string, colId: string, value: string | number | boolean | null) => void;
}

export interface CalculateRequest {
  formula: string;
  target_cell: {
    row_id: string;
    col_id: string;
  };
  columns: ColumnDef[];
  data: Row[];
}

export interface CalculateResponse {
  result: string | number | boolean | null;
  error?: string;
} 