"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ColumnDef } from '@/types/spreadsheet';

interface EditableColumnHeaderProps {
  column: ColumnDef;
  onLabelChange: (columnId: string, newLabel: string) => void;
}

export function EditableColumnHeader({
  column,
  onLabelChange,
}: EditableColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(column.label);
  };

  const handleBlur = () => {
    if (editValue.trim()) {
      onLabelChange(column.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center cursor-pointer"
      onClick={handleClick}
    >
      {isEditing ? (
        <div className="w-full px-2 py-1">
          <input
            ref={inputRef}
            className="w-full px-2 py-1 bg-white text-gray-900 border border-gray-200 rounded text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        </div>
      ) : (
        <span className="font-semibold text-muted-foreground ml-2">
          {column.label}
        </span>
      )}
    </div>
  );
} 