"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDeletionDialog } from './ConfirmDeletionDialog';
import { SpreadsheetTable } from './SpreadsheetTable';
import { ColumnDef, Row, SelectedCell } from '@/types/spreadsheet';

interface SpreadsheetAreaProps {
  columns: ColumnDef[];
  data: Row[];
  selectedCell: SelectedCell | null;
  calculatingCell: SelectedCell | null;
  aiFormulas: Record<string, string>;
  onCellClick: (rowId: string, colId: string) => void;
  onCellChange: (rowId: string, colId: string, value: string | number | boolean | null) => void;
  onColumnLabelChange: (columnId: string, newLabel: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onRemoveRow: () => void;
  onRemoveColumn: () => void;
}

export function SpreadsheetArea({
  columns,
  data,
  selectedCell,
  calculatingCell,
  aiFormulas,
  onCellClick,
  onCellChange,
  onColumnLabelChange,
  onAddRow,
  onAddColumn,
  onRemoveRow,
  onRemoveColumn,
}: SpreadsheetAreaProps) {
  const [removeRowDialogOpen, setRemoveRowDialogOpen] = useState(false);
  const [removeColumnDialogOpen, setRemoveColumnDialogOpen] = useState(false);

  const getSelectedCellPosition = () => {
    if (!selectedCell) return null;
    
    const rowIndex = data.findIndex(row => row.id === selectedCell.rowId);
    const colIndex = columns.findIndex(col => col.id === selectedCell.colId);
    
    return {
      row: rowIndex + 1,
      col: colIndex + 1,
      colLabel: columns[colIndex]?.label || 'Unknown'
    };
  };

  const position = getSelectedCellPosition();

  const handleRemoveRowConfirm = () => {
    onRemoveRow();
  };

  const handleRemoveColumnConfirm = () => {
    onRemoveColumn();
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onAddRow}
          className="skeuomorphic-btn text-white font-medium px-4 py-2 rounded-md"
          variant="secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
        <Button
          onClick={onAddColumn}
          className="skeuomorphic-btn text-white font-medium px-4 py-2 rounded-md"
          variant="secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Column
        </Button>
        <Button
          onClick={() => setRemoveRowDialogOpen(true)}
          disabled={!selectedCell}
          className="skeuomorphic-btn text-white font-medium px-4 py-2 rounded-md"
          variant="secondary"
        >
          <Minus className="w-4 h-4 mr-2" />
          Remove Row
        </Button>
        <Button
          onClick={() => setRemoveColumnDialogOpen(true)}
          disabled={!selectedCell}
          className="skeuomorphic-btn text-white font-medium px-4 py-2 rounded-md"
          variant="secondary"
        >
          <Minus className="w-4 h-4 mr-2" />
          Remove Column
        </Button>
      </div>

      {/* Spreadsheet Table */}
      <div className="flex-1 overflow-hidden">
        <SpreadsheetTable
          columns={columns}
          data={data}
          selectedCell={selectedCell}
          calculatingCell={calculatingCell}
          aiFormulas={aiFormulas}
          onCellClick={onCellClick}
          onCellChange={onCellChange}
          onColumnLabelChange={onColumnLabelChange}
        />
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDeletionDialog
        open={removeRowDialogOpen}
        onOpenChange={setRemoveRowDialogOpen}
        onConfirm={handleRemoveRowConfirm}
        title="Remove Row"
        description={`Are you sure you want to remove row ${position?.row}? This action cannot be undone and will delete all data in this row including any AI formulas.`}
        actionLabel="Remove Row"
      />

      <ConfirmDeletionDialog
        open={removeColumnDialogOpen}
        onOpenChange={setRemoveColumnDialogOpen}
        onConfirm={handleRemoveColumnConfirm}
        title="Remove Column"
        description={`Are you sure you want to remove column "${position?.colLabel}"? This action cannot be undone and will delete all data in this column including any AI formulas.`}
        actionLabel="Remove Column"
      />
    </div>
  );
} 