"use client";

import React, { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ColumnDef, Row, SelectedCell, CalculateRequest } from '@/types/spreadsheet';
import { calculateFormula, ApiError } from '@/lib/api';

interface AiSidebarProps {
  selectedCell: SelectedCell | null;
  aiFormulas: Record<string, string>;
  columns: ColumnDef[];
  data: Row[];
  onFormulaChange: (cellId: string, formula: string) => void;
  onCellValueUpdate: (rowId: string, colId: string, value: string | number | boolean | null) => void;
  onCalculationStart?: (rowId: string, colId: string) => void;
  onCalculationEnd?: (rowId: string, colId: string) => void;
}

export function AiSidebar({
  selectedCell,
  aiFormulas,
  columns,
  data,
  onFormulaChange,
  onCellValueUpdate,
  onCalculationStart,
  onCalculationEnd,
}: AiSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCellId = selectedCell ? `${selectedCell.rowId}-${selectedCell.colId}` : null;
  const currentFormula = selectedCellId ? aiFormulas[selectedCellId] || '' : '';

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

  const handleFormulaChange = (value: string) => {
    if (selectedCellId) {
      onFormulaChange(selectedCellId, value);
    }
  };

  const handleRunFormula = async () => {
    if (!selectedCell || !currentFormula.trim()) return;

    setIsLoading(true);
    setError(null);

    // Notify that calculation is starting
    onCalculationStart?.(selectedCell.rowId, selectedCell.colId);

    try {
      const request: CalculateRequest = {
        formula: currentFormula,
        target_cell: {
          row_id: selectedCell.rowId,
          col_id: selectedCell.colId,
        },
        columns,
        data,
      };

      const result = await calculateFormula(request);
      
      // If we get here, the API call was successful and validation passed
      onCellValueUpdate(selectedCell.rowId, selectedCell.colId, result.result);
      setError(null);
    } catch (err) {
      console.error('Error running AI formula:', err);
      
      // Handle our custom ApiError with user-friendly messages
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        // Fallback for unexpected errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
      // Notify that calculation has ended
      onCalculationEnd?.(selectedCell.rowId, selectedCell.colId);
    }
  };

  const canRunFormula = selectedCell && currentFormula.trim() && !isLoading;

  return (
    <div className="h-full bg-card border-l border-border p-6 flex flex-col space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">AI Formulas</h2>
        <p className="text-sm text-muted-foreground">
          Write natural language formulas and let AI calculate results
        </p>
      </div>

      {!selectedCell ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-muted/20 rounded-lg flex items-center justify-center">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Select a cell to view its AI formula
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">
              Formula for Cell ({position?.colLabel} {position?.row})
            </h3>
            <div className="text-xs text-muted-foreground mb-3">
              Row: {position?.row}, Column: {position?.col}
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-4">
            <div>
              <label htmlFor="formula-input" className="block text-sm font-medium text-foreground mb-2">
                AI Formula
              </label>
              <Textarea
                id="formula-input"
                placeholder="e.g., Calculate the sum of cells A1 to A10, then multiply by 0.15 for tax"
                value={currentFormula}
                onChange={(e) => handleFormulaChange(e.target.value)}
                className="min-h-[120px] resize-none bg-background/50 border-border"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleRunFormula}
              disabled={!canRunFormula}
              className="skeuomorphic-btn text-white font-medium"
              variant="default"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run AI Formula
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 