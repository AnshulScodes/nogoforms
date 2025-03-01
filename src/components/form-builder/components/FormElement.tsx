import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { FormElement as FormElementType } from '../types';
import { ResizeHandle } from './ResizeHandle';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';

/**
 * FormElement Component
 * 
 * Renders a form element in the form builder.
 * Handles selection, dragging, and resizing of elements.
 * 
 * @param element - The form element to render
 * @param isSelected - Whether the element is currently selected
 * @param onSelect - Callback when the element is selected
 * @param onUpdate - Callback when the element is updated
 * @param onDelete - Callback when the element is deleted
 * @param onDragStart - Callback when dragging starts
 * @param onDragEnd - Callback when dragging ends
 */
interface FormElementProps {
  element: FormElementType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormElementType>) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export const FormElement: React.FC<FormElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const handleResize = (dimensions: { width: number; height: number; percentage: number }) => {
    onUpdate(element.id, {
      width: dimensions.width,
      height: dimensions.height,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, element.id);
    }
  };

  // Determine column width class based on element's columnWidth property
  const getColumnWidthClass = () => {
    switch (element.columnWidth) {
      case '1/2': return 'w-1/2';
      case '1/3': return 'w-1/3';
      case '2/3': return 'w-2/3';
      case '1/4': return 'w-1/4';
      case '3/4': return 'w-3/4';
      default: return 'w-full';
    }
  };

  // Render different element types
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input placeholder={element.placeholder} />
            {element.helpText && <p className="text-xs text-muted-foreground">{element.helpText}</p>}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input type="number" placeholder={element.placeholder} min={element.validation?.min} max={element.validation?.max} />
            {element.helpText && <p className="text-xs text-muted-foreground">{element.helpText}</p>}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Textarea placeholder={element.placeholder} />
            {element.helpText && <p className="text-xs text-muted-foreground">{element.helpText}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <div className="space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox id={`${element.id}-option-${index}`} />
                  <Label htmlFor={`${element.id}-option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            {element.helpText && <p className="text-xs text-muted-foreground">{element.helpText}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={element.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {element.helpText && <p className="text-xs text-muted-foreground">{element.helpText}</p>}
          </div>
        );
      
      case 'date':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <div className="border rounded-md p-2">
              <Calendar mode="single" />
            </div>
            {element.helpText && <p className="text-xs text-muted-foreground">{element.helpText}</p>}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2 w-full">
            <Label>{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                {element.helpText || 'Upload files up to 10MB'}
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="w-full">
            {element.imageSrc ? (
              <div className={cn(
                "relative",
                element.imagePosition === 'right' ? 'text-right' : 'text-left'
              )}>
                <img 
                  src={element.imageSrc} 
                  alt={element.label || 'Image'} 
                  className={cn(
                    "rounded-md",
                    element.imageSize === 'small' ? 'max-w-[200px] max-h-[200px]' : 
                    element.imageSize === 'large' ? 'max-w-full' : 'max-w-[400px] max-h-[400px]'
                  )}
                />
                {element.label && <p className="text-sm mt-2">{element.label}</p>}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium">Image Placeholder</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {element.label || 'Add an image URL in the properties panel'}
                </p>
              </div>
            )}
          </div>
        );
      
      case 'grid':
        return (
          <div 
            className={cn(
              "w-full grid gap-4",
              `grid-cols-${element.gridColumns || 2}`
            )}
            style={{
              gridTemplateColumns: `repeat(${element.gridColumns || 2}, 1fr)`,
              gap: `${element.gridGap || 4}px`
            }}
          >
            {Array.from({ length: (element.gridColumns || 2) * (element.gridRows || 1) }).map((_, index) => (
              <div key={index} className="border border-dashed rounded-md p-4 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Grid Cell {index + 1}</p>
              </div>
            ))}
          </div>
        );
      
      case 'column':
        return (
          <div className="w-full border border-dashed rounded-md p-4 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Column Container</p>
          </div>
        );
      
      case 'row':
        return (
          <div className="w-full border border-dashed rounded-md p-4 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Row Container</p>
          </div>
        );
      
      default:
        return <div>Unknown element type: {element.type}</div>;
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "relative p-4 rounded-md transition-all",
        getColumnWidthClass(),
        isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50",
        element.isResizable ? "resize" : ""
      )}
      style={{
        width: typeof element.width === 'number' ? `${element.width}px` : element.width,
        height: typeof element.height === 'number' ? `${element.height}px` : element.height,
      }}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {renderElementContent()}
      
      {isSelected && element.isResizable && (
        <ResizeHandle 
          onResize={handleResize}
          minWidth={200}
          minHeight={50}
          initialWidth={typeof element.width === 'number' ? element.width : undefined}
          initialHeight={typeof element.height === 'number' ? element.height : undefined}
          parentRef={elementRef}
        />
      )}
      
      {isSelected && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-3 -right-3 h-6 w-6 rounded-full shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}; 