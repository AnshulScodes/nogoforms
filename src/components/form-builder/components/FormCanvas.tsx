import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { FormElement as FormElementType, FormElementType as ElementType } from '../types';
import { FormElement } from './FormElement';

/**
 * FormCanvas Component
 * 
 * The main canvas area where form elements are placed and arranged.
 * Handles drag and drop, element selection, and grid display.
 * 
 * @param elements - The form elements to display
 * @param selectedElementId - The ID of the currently selected element
 * @param onSelectElement - Callback when an element is selected
 * @param onClearSelection - Callback to clear the current selection
 * @param onUpdateElement - Callback when an element is updated
 * @param onDeleteElement - Callback when an element is deleted
 * @param onDropElement - Callback when an element is dropped on the canvas
 * @param gridVisible - Whether to show the grid
 * @param gridSize - The size of the grid
 */
interface FormCanvasProps {
  elements: Record<string, FormElementType>;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  onUpdateElement: (id: string, updates: Partial<FormElementType>) => void;
  onDeleteElement: (id: string) => void;
  onDropElement: (type: ElementType, x: number, y: number) => void;
  gridVisible: boolean;
  gridSize: number;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onClearSelection,
  onUpdateElement,
  onDeleteElement,
  onDropElement,
  gridVisible,
  gridSize,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only clear selection if clicking directly on the canvas (not on an element)
    if (e.target === canvasRef.current) {
      onClearSelection();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const elementType = e.dataTransfer.getData('application/formbuilder-element') as ElementType;
    if (!elementType) return;
    
    // Get canvas position and calculate drop coordinates
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    onDropElement(elementType, x, y);
  };

  const handleElementDragStart = (e: React.DragEvent, id: string) => {
    // Set data for dragging existing elements
    e.dataTransfer.setData('application/formbuilder-element-id', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleElementDragEnd = (e: React.DragEvent) => {
    // Handle drag end for existing elements
  };

  // Sort elements by their position in the form (if they have x/y coordinates)
  const sortedElements = Object.values(elements).sort((a, b) => {
    if (a.y !== undefined && b.y !== undefined) {
      return a.y - b.y;
    }
    return 0;
  });

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative flex-1 p-8 overflow-auto min-h-[600px] bg-slate-50",
        gridVisible && "bg-grid"
      )}
      style={{
        backgroundSize: `${gridSize}px ${gridSize}px`,
        // Custom property for the grid background
        '--grid-size': `${gridSize}px`,
      } as React.CSSProperties}
      onClick={handleCanvasClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative w-full max-w-3xl mx-auto bg-white rounded-lg shadow-sm min-h-[500px] p-6">
        {sortedElements.map((element) => (
          <FormElement
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onSelect={onSelectElement}
            onUpdate={onUpdateElement}
            onDelete={onDeleteElement}
            onDragStart={handleElementDragStart}
            onDragEnd={handleElementDragEnd}
          />
        ))}
        
        {sortedElements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <p>Drag and drop elements here to build your form</p>
          </div>
        )}
      </div>
    </div>
  );
}; 