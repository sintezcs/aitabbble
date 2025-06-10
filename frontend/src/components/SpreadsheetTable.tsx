"use client";

import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from '@/components/ui/table';
import { Cell } from './Cell';
import { EditableColumnHeader } from './EditableColumnHeader';
import { ColumnDef, Row, SelectedCell } from '@/types/spreadsheet';

interface SpreadsheetTableProps {
  columns: ColumnDef[];
  data: Row[];
  selectedCell: SelectedCell | null;
  calculatingCell: SelectedCell | null;
  aiFormulas: Record<string, string>;
  onCellClick: (rowId: string, colId: string) => void;
  onCellChange: (rowId: string, colId: string, value: string | number | boolean | null) => void;
  onColumnLabelChange: (columnId: string, newLabel: string) => void;
}

export function SpreadsheetTable({
  columns,
  data,
  selectedCell,
  calculatingCell,
  aiFormulas,
  onCellClick,
  onCellChange,
  onColumnLabelChange,
}: SpreadsheetTableProps) {
  const getCellId = (rowId: string, colId: string) => `${rowId}-${colId}`;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="overflow-auto max-h-[calc(100vh-200px)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className="border-r border-border/50 last:border-r-0 min-w-[120px] h-10 hover:bg-muted/70 transition-colors p-0"
                  style={{ width: column.width }}
                >
                  <EditableColumnHeader
                    column={column}
                    onLabelChange={onColumnLabelChange}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/20 border-b border-border/50 last:border-b-0"
              >
                {columns.map((column) => {
                  const cellId = getCellId(row.id, column.id);
                  const isSelected = selectedCell?.rowId === row.id && selectedCell?.colId === column.id;
                  const isCalculating = calculatingCell?.rowId === row.id && calculatingCell?.colId === column.id;
                  const hasFormula = Boolean(aiFormulas[cellId]);
                  const cellValue = row[column.id];

                  return (
                    <Cell
                      key={cellId}
                      rowId={row.id}
                      colId={column.id}
                      value={cellValue}
                      isSelected={isSelected}
                      isCalculating={isCalculating}
                      hasFormula={hasFormula}
                      onCellClick={onCellClick}
                      onCellChange={onCellChange}
                    />
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 