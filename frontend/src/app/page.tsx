"use client";

import React, { useState } from 'react';
import { SpreadsheetArea } from '@/components/SpreadsheetArea';
import { AiSidebar } from '@/components/AiSidebar';
import { ColumnDef, Row, SelectedCell } from '@/types/spreadsheet';

// Initial data setup
const initialColumns: ColumnDef[] = [
  { id: 'col1', label: 'Name', width: 150 },
  { id: 'col2', label: 'Age', width: 100 },
  { id: 'col3', label: 'City', width: 150 },
  { id: 'col4', label: 'Salary', width: 120 },
  { id: 'col5', label: 'Department', width: 150 },
];

const initialData: Row[] = [
  { id: 'row1', col1: 'John Doe', col2: 28, col3: 'New York', col4: 75000, col5: 'Engineering' },
  { id: 'row2', col1: 'Jane Smith', col2: 32, col3: 'Los Angeles', col4: 82000, col5: 'Marketing' },
  { id: 'row3', col1: 'Bob Johnson', col2: 45, col3: 'Chicago', col4: 95000, col5: 'Sales' },
  { id: 'row4', col1: 'Alice Brown', col2: 29, col3: 'Boston', col4: 78000, col5: 'Engineering' },
  { id: 'row5', col1: 'Charlie Wilson', col2: 36, col3: 'Seattle', col4: 88000, col5: 'Product' },
];

export default function Home() {
  const [columns, setColumns] = useState<ColumnDef[]>(initialColumns);
  const [data, setData] = useState<Row[]>(initialData);
  const [aiFormulas, setAiFormulas] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [calculatingCell, setCalculatingCell] = useState<SelectedCell | null>(null);

  const handleCellClick = (rowId: string, colId: string) => {
    setSelectedCell({ rowId, colId });
  };

  const handleMainClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Deselect if clicking outside the table area but not in the sidebar
    if (!target.closest('table') && !target.closest('.ai-sidebar') && !target.closest('button')) {
      setSelectedCell(null);
    }
  };

  const handleCellChange = (rowId: string, colId: string, value: string | number | boolean | null) => {
    setData(prevData => 
      prevData.map(row => 
        row.id === rowId 
          ? { ...row, [colId]: value }
          : row
      )
    );
  };

  const handleColumnLabelChange = (columnId: string, newLabel: string) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === columnId 
          ? { ...col, label: newLabel }
          : col
      )
    );
  };

  const handleAddRow = () => {
    const newRowId = `row${data.length + 1}`;
    const newRow: Row = { id: newRowId };
    
    // Initialize empty values for all columns
    columns.forEach(col => {
      newRow[col.id] = null;
    });

    setData(prevData => [...prevData, newRow]);
  };

  const handleAddColumn = () => {
    const newColId = `col${columns.length + 1}`;
    const newColumn: ColumnDef = {
      id: newColId,
      label: `Column ${columns.length + 1}`,
      width: 120,
    };

    setColumns(prevColumns => [...prevColumns, newColumn]);
    
    // Add the new column to all existing rows
    setData(prevData => 
      prevData.map(row => ({
        ...row,
        [newColId]: null,
      }))
    );
  };

  const handleRemoveRow = () => {
    if (!selectedCell) return;
    
    // Don't allow removing the last row
    if (data.length <= 1) return;
    
    // Remove the row
    setData(prevData => prevData.filter(row => row.id !== selectedCell.rowId));
    
    // Clear AI formulas for the removed row
    setAiFormulas(prevFormulas => {
      const newFormulas = { ...prevFormulas };
      Object.keys(newFormulas).forEach(cellId => {
        if (cellId.startsWith(`${selectedCell.rowId}-`)) {
          delete newFormulas[cellId];
        }
      });
      return newFormulas;
    });
    
    // Clear selection
    setSelectedCell(null);
  };

  const handleRemoveColumn = () => {
    if (!selectedCell) return;
    
    // Don't allow removing the last column
    if (columns.length <= 1) return;
    
    // Remove the column
    setColumns(prevColumns => prevColumns.filter(col => col.id !== selectedCell.colId));
    
    // Remove the column from all rows
    setData(prevData => 
      prevData.map(row => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [selectedCell.colId]: _, ...remainingCols } = row;
        return remainingCols as Row;
      })
    );
    
    // Clear AI formulas for the removed column
    setAiFormulas(prevFormulas => {
      const newFormulas = { ...prevFormulas };
      Object.keys(newFormulas).forEach(cellId => {
        if (cellId.endsWith(`-${selectedCell.colId}`)) {
          delete newFormulas[cellId];
        }
      });
      return newFormulas;
    });
    
    // Clear selection
    setSelectedCell(null);
  };

  const handleFormulaChange = (cellId: string, formula: string) => {
    setAiFormulas(prev => ({
      ...prev,
      [cellId]: formula,
    }));
  };

  const handleCellValueUpdate = (rowId: string, colId: string, value: string | number | boolean | null) => {
    handleCellChange(rowId, colId, value);
  };

  const handleCalculationStart = (rowId: string, colId: string) => {
    setCalculatingCell({ rowId, colId });
  };

  const handleCalculationEnd = () => {
    setCalculatingCell(null);
  };

  return (
    <main className="h-screen bg-background text-foreground" onClick={handleMainClick}>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] h-full">
        {/* Main Spreadsheet Area */}
        <div className="flex flex-col overflow-hidden">
          <SpreadsheetArea
            columns={columns}
            data={data}
            selectedCell={selectedCell}
            calculatingCell={calculatingCell}
            aiFormulas={aiFormulas}
            onCellClick={handleCellClick}
            onCellChange={handleCellChange}
            onColumnLabelChange={handleColumnLabelChange}
            onAddRow={handleAddRow}
            onAddColumn={handleAddColumn}
            onRemoveRow={handleRemoveRow}
            onRemoveColumn={handleRemoveColumn}
          />
        </div>

        {/* AI Sidebar */}
        <div className="hidden lg:flex flex-col overflow-hidden ai-sidebar">
          <AiSidebar
            selectedCell={selectedCell}
            aiFormulas={aiFormulas}
            columns={columns}
            data={data}
            onFormulaChange={handleFormulaChange}
            onCellValueUpdate={handleCellValueUpdate}
            onCalculationStart={handleCalculationStart}
            onCalculationEnd={handleCalculationEnd}
          />
        </div>
      </div>
    </main>
  );
}
