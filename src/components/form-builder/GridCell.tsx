import React, { useRef, useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash2, GripVertical } from "lucide-react";
import { FormBlock } from "@/sdk";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Draggable } from "react-beautiful-dnd";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  block?: FormBlock;
  onAddField: (type: FormBlock["type"], rowIndex: number, colIndex: number) => void;
  onUpdateField?: (id: string, updates: Partial<FormBlock>) => void;
  onDeleteField?: (id: string) => void;
  fieldGroups: Record<string, string[]>;
  isEmpty?: boolean;
}

const GridCell: React.FC<GridCellProps> = ({
  rowIndex,
  colIndex,
  block,
  onAddField,
  onUpdateField,
  onDeleteField,
  fieldGroups,
  isEmpty = true
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [dropDirection, setDropDirection] = useState<"top" | "bottom">("bottom");
  
  // Determine dropdown direction based on position
  useEffect(() => {
    const updateDropDirection = () => {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // If there's more space above than below, or if there's not enough space below
        if (spaceAbove > spaceBelow || spaceBelow < 300) {
          setDropDirection("top");
        } else {
          setDropDirection("bottom");
        }
      }
    };
    
    updateDropDirection();
    window.addEventListener('scroll', updateDropDirection);
    window.addEventListener('resize', updateDropDirection);
    
    return () => {
      window.removeEventListener('scroll', updateDropDirection);
      window.removeEventListener('resize', updateDropDirection);
    };
  }, []);

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
    <Card 
      ref={cellRef} 
      className={`p-4 min-h-[100px] ${isEmpty ? 'flex items-center justify-center' : ''} transition-all duration-200 hover:shadow-md`}
    >
      {isEmpty ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
              <div className="absolute inset-0 bg-primary/5 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56" 
            align="center"
            side={dropDirection}
            sideOffset={5}
            alignOffset={0}
            avoidCollisions={true}
            collisionPadding={10}
            maxHeight={300}
          >
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
        block && (
          <Draggable draggableId={`field-${block.id}`} index={0}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={`w-full ${snapshot.isDragging ? 'z-50' : ''}`}
              >
                <div className={`${snapshot.isDragging ? 'bg-primary/5 rounded-md p-2 ring-2 ring-primary/20' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 w-full">
                      <div 
                        {...provided.dragHandleProps}
                        className="cursor-grab hover:bg-gray-100 p-1 rounded group"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                      </div>
                      <Input
                        value={block.label}
                        onChange={(e) => onUpdateField?.(block.id, { label: e.target.value })}
                        className="font-medium w-auto"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Field Settings</DialogTitle>
                          </DialogHeader>
                          <Tabs defaultValue="basic">
                            <TabsList className="w-full">
                              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                              <TabsTrigger value="appearance">Appearance</TabsTrigger>
                              <TabsTrigger value="layout">Layout</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="basic" className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Field Type</Label>
                                <Select
                                  value={block.type}
                                  onValueChange={(value: FormBlock["type"]) =>
                                    onUpdateField?.(block.id, { type: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="textarea">Textarea</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                    <SelectItem value="radio">Radio</SelectItem>
                                    <SelectItem value="heading">Heading</SelectItem>
                                    <SelectItem value="paragraph">Paragraph</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {!["heading", "paragraph"].includes(block.type) && (
                                <div className="space-y-2">
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={block.placeholder || ""}
                                    onChange={(e) =>
                                      onUpdateField?.(block.id, {
                                        placeholder: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}
                              
                              {!["heading", "paragraph"].includes(block.type) && (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`required-${block.id}`}
                                    checked={block.required || false}
                                    onCheckedChange={(checked) =>
                                      onUpdateField?.(block.id, { required: !!checked })
                                    }
                                  />
                                  <Label htmlFor={`required-${block.id}`}>Required field</Label>
                                </div>
                              )}
                              
                              {["select", "radio"].includes(block.type) && (
                                <div className="space-y-2">
                                  <Label>Options (one per line)</Label>
                                  <Textarea
                                    value={(block.options || []).join("\n")}
                                    onChange={(e) =>
                                      onUpdateField?.(block.id, {
                                        options: e.target.value.split("\n").filter(Boolean),
                                      })
                                    }
                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                    className="min-h-[100px]"
                                  />
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="appearance" className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Add Image URL</Label>
                                <Input
                                  value={block.imageSrc || ""}
                                  onChange={(e) =>
                                    onUpdateField?.(block.id, {
                                      imageSrc: e.target.value,
                                    })
                                  }
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              
                              {block.imageSrc && (
                                <>
                                  <div className="space-y-2">
                                    <Label>Image Display Mode</Label>
                                    <Select
                                      value={block.imageFullField ? "full" : "inline"}
                                      onValueChange={(value) =>
                                        onUpdateField?.(block.id, { 
                                          imageFullField: value === "full",
                                          imagePosition: value === "full" ? "left" : block.imagePosition || "left"
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="inline">Inline with content</SelectItem>
                                        <SelectItem value="full">Full field (image only)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {!block.imageFullField && (
                                    <>
                                      <div className="space-y-2">
                                        <Label>Image Position</Label>
                                        <Select
                                          value={block.imagePosition || "left"}
                                          onValueChange={(value) =>
                                            onUpdateField?.(block.id, { imagePosition: value as "left" | "right" })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label>Image Size</Label>
                                        <Select
                                          value={block.imageSize || "medium"}
                                          onValueChange={(value) =>
                                            onUpdateField?.(block.id, { imageSize: value as "small" | "medium" | "large" })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="small">Small</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="large">Large</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="layout" className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Column Width</Label>
                                <Select
                                  value={block.columnWidth || "1"}
                                  onValueChange={(value) =>
                                    onUpdateField?.(block.id, { columnWidth: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">Full Width</SelectItem>
                                    <SelectItem value="1/2">Half Width</SelectItem>
                                    <SelectItem value="1/3">One Third</SelectItem>
                                    <SelectItem value="2/3">Two Thirds</SelectItem>
                                    <SelectItem value="1/4">One Quarter</SelectItem>
                                    <SelectItem value="3/4">Three Quarters</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Element Height</Label>
                                <Select
                                  value={block.height || "auto"}
                                  onValueChange={(value) =>
                                    onUpdateField?.(block.id, { height: value as "auto" | "small" | "medium" | "large" })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="small">Small</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="large">Large</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TabsContent>
                          </Tabs>
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
                      block.imageFullField ? (
                        <div className="w-full mb-2">
                          <img 
                            src={block.imageSrc} 
                            alt={`Preview for ${block.label}`}
                            className="w-full max-h-[400px] object-contain rounded"
                          />
                        </div>
                      ) : (
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
                      )
                    )}
                    
                    {/* Only render the field preview if it's not a full-field image */}
                    {(!block.imageSrc || !block.imageFullField) && renderFieldPreview()}
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
                </div>
              </div>
            )}
          </Draggable>
        )
      )}
    </Card>
  );
};

export default GridCell; 