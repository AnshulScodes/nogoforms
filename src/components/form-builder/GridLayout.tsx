import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Grid2X2, Grid3X3 } from "lucide-react";
import { FormBlock } from "@/sdk";
import GridCell from './GridCell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GridLayoutProps {
  elements: FormBlock[];
  onAddElement: (type: FormBlock["type"], rowIndex: number, colIndex: number) => void;
  onDeleteRow: (rowIndex: number) => void;
  onUpdateElement?: (id: string, updates: Partial<FormBlock>) => void;
  onDeleteElement?: (id: string) => void;
  fieldGroups: Record<string, string[]>;
}

// Grid layout templates
const GRID_TEMPLATES = {
  "1-column": [1],
  "2-column": [1, 1],
  "3-column": [1, 1, 1],
  "2-1": [2, 1],
  "1-2": [1, 2],
  "1-1-1": [1, 1, 1],
  "2-1-1": [2, 1, 1],
  "1-2-1": [1, 2, 1],
  "1-1-2": [1, 1, 2],
};

const GridLayout = forwardRef<{ addRow: (template?: string) => void; deleteRow: (rowIndex: number) => void }, GridLayoutProps>(({
  elements,
  onAddElement,
  onDeleteRow,
  onUpdateElement,
  onDeleteElement,
  fieldGroups
}, ref) => {
  const [rows, setRows] = useState<Array<{ template: string, cells: number[] }>>([
    { template: "1-column", cells: [1] }
  ]);

  const addRow = (template: string = "1-column") => {
    const newRow = {
      template,
      cells: GRID_TEMPLATES[template as keyof typeof GRID_TEMPLATES] || [1]
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowIndex: number) => {
    const newRows = [...rows];
    newRows.splice(rowIndex, 1);
    setRows(newRows);
  };

  // Expose the addRow and deleteRow functions via ref
  useImperativeHandle(ref, () => ({
    addRow,
    deleteRow
  }));

  const changeRowTemplate = (rowIndex: number, template: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      template,
      cells: GRID_TEMPLATES[template as keyof typeof GRID_TEMPLATES] || [1]
    };
    setRows(newRows);
  };

  // Get elements for a specific cell
  const getElementsForCell = (rowIndex: number, colIndex: number) => {
    return elements.filter(
      element => element.rowIndex === rowIndex && element.colIndex === colIndex
    );
  };

  // Get the first element in a cell (we're assuming one element per cell for simplicity)
  const getElementForCell = (rowIndex: number, colIndex: number) => {
    return elements.find(
      element => element.rowIndex === rowIndex && element.colIndex === colIndex
    );
  };

  // Get all unique row indexes from elements
  const getUniqueRowIndexes = () => {
    const rowIndexes = elements
      .map(element => element.rowIndex || 0)
      .filter(index => index !== undefined);
    
    // If we have elements with row indexes, use those
    if (rowIndexes.length > 0) {
      return [...new Set(rowIndexes)].sort((a, b) => a - b);
    }
    
    // Otherwise, use the rows from our state
    return Array.from({ length: rows.length }, (_, i) => i);
  };

  // Ensure we have enough rows in our state
  const ensureRows = () => {
    const uniqueRowIndexes = getUniqueRowIndexes();
    const maxRowIndex = Math.max(...uniqueRowIndexes, 0);
    
    if (maxRowIndex >= rows.length) {
      const newRows = [...rows];
      for (let i = rows.length; i <= maxRowIndex; i++) {
        newRows.push({ template: "1-column", cells: [1] });
      }
      setRows(newRows);
    }
  };

  // Call ensureRows when elements change
  React.useEffect(() => {
    ensureRows();
  }, [elements]);

  return (
    <div className="space-y-6">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="border border-dashed border-gray-300 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-medium text-gray-500">Row {rowIndex + 1}</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor={`template-${rowIndex}`} className="text-xs">Layout:</Label>
                <Select
                  value={row.template}
                  onValueChange={(value) => changeRowTemplate(rowIndex, value)}
                >
                  <SelectTrigger id={`template-${rowIndex}`} className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-column">1 Column</SelectItem>
                    <SelectItem value="2-column">2 Columns</SelectItem>
                    <SelectItem value="3-column">3 Columns</SelectItem>
                    <SelectItem value="2-1">2/3 + 1/3</SelectItem>
                    <SelectItem value="1-2">1/3 + 2/3</SelectItem>
                    <SelectItem value="1-1-1">1/3 + 1/3 + 1/3</SelectItem>
                    <SelectItem value="2-1-1">2/4 + 1/4 + 1/4</SelectItem>
                    <SelectItem value="1-2-1">1/4 + 2/4 + 1/4</SelectItem>
                    <SelectItem value="1-1-2">1/4 + 1/4 + 2/4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDeleteRow(rowIndex)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Row
            </Button>
          </div>
          
          <div className="grid gap-4" style={{ 
            gridTemplateColumns: row.cells.map(cell => `${cell}fr`).join(' ') || "1fr"
          }}>
            {row.cells.map((_, colIndex) => {
              const element = getElementForCell(rowIndex, colIndex);
              const isEmpty = !element;
              
              return (
                <GridCell
                  key={colIndex}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  block={element}
                  isEmpty={isEmpty}
                  onAddField={onAddElement}
                  onUpdateField={onUpdateElement}
                  onDeleteField={onDeleteElement}
                  fieldGroups={fieldGroups}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});

export default GridLayout; 