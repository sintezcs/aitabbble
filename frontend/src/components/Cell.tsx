"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { TableCell } from '@/components/ui/table';
import { CellProps } from '@/types/spreadsheet';

export function Cell({
  rowId,
  colId,
  value,
  isSelected,
  hasFormula,
  isCalculating = false,
  onCellClick,
  onCellChange,
}: CellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCellClick(rowId, colId);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const processedValue = processValue(editValue);
    if (processedValue !== value) {
      onCellChange(rowId, colId, processedValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const processValue = (inputValue: string): string | number | boolean | null => {
    if (inputValue === '') return null;
    
    // Try to parse as number
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && isFinite(numValue)) {
      return numValue;
    }
    
    // Check for boolean
    if (inputValue.toLowerCase() === 'true') return true;
    if (inputValue.toLowerCase() === 'false') return false;
    
    // Return as string
    return inputValue;
  };

  const displayValue = value === null || value === undefined ? '' : value.toString();

  return (
    <TableCell
      className={`
        relative p-0 border border-border/50 cursor-pointer min-w-[120px] h-10
        transition-all duration-200 hover:bg-accent/50
        ${isSelected ? 'ring-2 ring-primary ring-inset bg-primary/10' : ''}
        ${isCalculating ? 'calculating-cell' : ''}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="cell-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
      ) : (
        <div className="flex items-center justify-between p-2 w-full h-full">
          <span className="flex-1 truncate text-sm">
            {displayValue}
          </span>
          <div className="flex items-center space-x-1">
            {hasFormula && !isCalculating && (
              <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
            )}
            {isCalculating && (
              <div className="flex space-x-1 items-center">
                <span className="text-sm magic-sparkles">✨</span>
                <span className="text-sm magic-sparkles">✨</span>
                <span className="text-sm magic-sparkles">✨</span>
              </div>
            )}
          </div>
        </div>
      )}
    </TableCell>
  );
} 