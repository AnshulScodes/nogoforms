import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash2 } from "lucide-react";
import { FormBlock } from "@/sdk";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  block?: FormBlock;
  onAddField: (type: FormBlock["type"], rowIndex: number, colIndex: number) => void;
  onUpdateField?: (id: string, updates: Partial<FormBlock>) => void;
  onDeleteField?: (id: string) => void;
  fieldGroups: Record<string, string[]>;
  isEmpty?: boolean;
  isHighlighted: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (elementId: string) => void;
}

const GridCell: React.FC<GridCellProps> = ({
  rowIndex,
  colIndex,
  block,
  onAddField,
  onUpdateField,
  onDeleteField,
  fieldGroups,
  isEmpty = true,
  isHighlighted,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Render the field preview based on its type
  const renderFieldPreview = () => {
    if (!block) return null;

    if (["heading", "paragraph"].includes(block.type)) {
      return block.type === "heading" ? (
        <h3 className="text-lg font-semibold">{block.label}</h3>
      ) : (
        <p className="text-gray-600">{block.label}</p>
      );
    }

    switch (block.type) {
      case "textarea":
        return <Textarea placeholder={block.placeholder} className="mt-2" />;
      case "select":
        return (
          <select className="w-full p-2 border rounded mt-2">
            <option value="" disabled selected>
              {block.placeholder || "Select an option"}
            </option>
            {block.options?.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="mt-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              {block.label}
            </label>
          </div>
        );
      case "radio":
        return (
          <div className="mt-2 space-y-1">
            {block.options?.map((option, i) => (
              <label key={i} className="flex items-center">
                <input type="radio" name={`radio-${block.id}`} className="mr-2" />
                {option}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <Input
            type={block.type}
            placeholder={block.placeholder}
            className="mt-2"
          />
        );
    }
  };

  return (
    <Card className={`p-4 min-h-[100px] ${isEmpty ? 'flex items-center justify-center' : ''}`}>
      {isEmpty ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem disabled className="font-semibold">Basic Fields</DropdownMenuItem>
            {fieldGroups.basic.map((type) => (
              <DropdownMenuItem key={type} onClick={() => onAddField(type as FormBlock["type"], rowIndex, colIndex)}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Field
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="font-semibold">Choice Fields</DropdownMenuItem>
            {fieldGroups.choice.map((type) => (
              <DropdownMenuItem key={type} onClick={() => onAddField(type as FormBlock["type"], rowIndex, colIndex)}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Field
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="font-semibold">Advanced Fields</DropdownMenuItem>
            {fieldGroups.advanced.map((type) => (
              <DropdownMenuItem key={type} onClick={() => onAddField(type as FormBlock["type"], rowIndex, colIndex)}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Field
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="font-semibold">Layout Elements</DropdownMenuItem>
            {fieldGroups.layout.map((type) => (
              <DropdownMenuItem key={type} onClick={() => onAddField(type as FormBlock["type"], rowIndex, colIndex)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-full">
          {block && (
            <>
              <div className="flex items-center justify-between mb-2">
                <Input
                  value={block.label}
                  onChange={(e) => onUpdateField?.(block.id, { label: e.target.value })}
                  className="font-medium w-auto"
                />
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Field Settings</DialogTitle>
                      </DialogHeader>
                      {/* Field settings content would go here */}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteField?.(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Field preview */}
              <div className="mt-2">
                {block.imageSrc && (
                  <div className={`flex items-center gap-2 mb-2 ${block.imagePosition === "right" ? "justify-end" : "justify-start"}`}>
                    <img 
                      src={block.imageSrc} 
                      alt={`Preview for ${block.label}`}
                      className={`object-cover rounded ${
                        block.imageSize === "small" ? "h-16 w-16" : 
                        block.imageSize === "large" ? "h-32 w-32" : "h-24 w-24"
                      }`}
                    />
                  </div>
                )}
                
                {renderFieldPreview()}
              </div>
              
              {/* Resizable handle */}
              <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '3px 3px',
                  backgroundPosition: 'bottom right',
                  opacity: 0.5
                }}
              />
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default GridCell;
