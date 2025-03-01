import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Link, Trash2, Settings, Image, LayoutGrid, Maximize2, ChevronDown } from "lucide-react";
import { FormBuilderSDK, type FormBlock } from "@/sdk";
import { useToast } from "@/hooks/use-toast";
import FormPreview from "./FormPreview";
import { getFormById } from "@/services/forms";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import GridLayout from "./GridLayout";

interface FormBuilderProps {
  preview?: boolean;
}

// Group field types for better organization
const FIELD_GROUPS = {
  basic: ["text", "email", "number", "textarea"],
  choice: ["select", "checkbox", "radio"],
  advanced: ["date", "time", "tel", "url", "file", "range", "color", "password"],
  layout: ["heading", "paragraph"]
};

// Column width options
const COLUMN_OPTIONS = [
  { value: "1", label: "Full Width" },
  { value: "1/2", label: "Half Width" },
  { value: "1/3", label: "One Third" },
  { value: "2/3", label: "Two Thirds" },
  { value: "1/4", label: "One Quarter" },
  { value: "3/4", label: "Three Quarters" },
];

// Predefined image examples
const IMAGE_EXAMPLES = [
  {
    name: "User Profile",
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Computer",
    src: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Light Bulb",
    src: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=100&q=80"
  },
  {
    name: "Fun",
    src: "https://images.unsplash.com/photo-1501286353178-1ec881214838?auto=format&fit=crop&w=100&q=80"
  }
];

// Helper function to convert column width to CSS class
const getColumnWidthClass = (width: string) => {
  switch (width) {
    case "1/2": return "w-1/2";
    case "1/3": return "w-1/3";
    case "2/3": return "w-2/3";
    case "1/4": return "w-1/4";
    case "3/4": return "w-3/4";
    default: return "w-full";
  }
};

const FormBuilder = ({ preview = false }: FormBuilderProps) => {
  const [elements, setElements] = useState<FormBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState("New Form");
  const [formDescription, setFormDescription] = useState("");
  const [useGridLayout, setUseGridLayout] = useState(false);
  const [currentRow, setCurrentRow] = useState<number | null>(null);
  const { formId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const resizeRef = useRef<HTMLDivElement>(null);
  const gridLayoutRef = useRef<any>(null);

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    try {
      console.log(`📂 Loading form (ID: ${id})...`);
      setLoading(true);
      const form = await getFormById(id);
      setElements(form.form_schema);
      setFormTitle(form.title);
      setFormDescription(form.description || "");
      console.log(`✅ Form "${form.title}" loaded successfully! 📝`);
    } catch (error: any) {
      console.error(`❌ Failed to load form: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load form",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setElements(items);
  };

  const addElement = (type: FormBlock["type"]) => {
    console.log(`➕ Adding new ${type} field...`);
    
    let label = `New ${type} field`;
    let placeholder = `Enter ${type}...`;
    
    // Customize label and placeholder based on field type
    if (type === "heading") {
      label = "Section Heading";
      placeholder = "";
    } else if (type === "paragraph") {
      label = "This is a paragraph text to provide additional information to your form users.";
      placeholder = "";
    }
    
    const newElement: FormBlock = {
      id: crypto.randomUUID(),
      type,
      label,
      placeholder,
      required: false,
      options: ["select", "radio"].includes(type) ? ["Option 1", "Option 2", "Option 3"] : undefined,
      columnWidth: "1", // Default to full width
      rowIndex: currentRow !== null ? currentRow : Math.max(...elements.map(e => e.rowIndex || 0), 0) + 1,
      height: type === "textarea" ? "medium" : "auto",
    };

    setElements([...elements, newElement]);
    console.log(`✅ Added ${type} field successfully! 🧱`);
  };

  // Add a new function to handle adding elements in grid layout
  const addGridElement = (type: FormBlock["type"], rowIndex: number, colIndex: number) => {
    console.log(`➕ Adding new ${type} field to grid at row ${rowIndex}, column ${colIndex}...`);
    
    let label = `New ${type} field`;
    let placeholder = `Enter ${type}...`;
    
    // Customize label and placeholder based on field type
    if (type === "heading") {
      label = "Section Heading";
      placeholder = "";
    } else if (type === "paragraph") {
      label = "This is a paragraph text to provide additional information to your form users.";
      placeholder = "";
    }
    
    const newElement: FormBlock = {
      id: crypto.randomUUID(),
      type,
      label,
      placeholder,
      required: false,
      options: ["select", "radio"].includes(type) ? ["Option 1", "Option 2", "Option 3"] : undefined,
      columnWidth: "1", // Default to full width
      rowIndex,
      colIndex,
      height: type === "textarea" ? "medium" : "auto",
    };
    
    setElements([...elements, newElement]);
    console.log(`✅ Added ${type} field to grid successfully! 🧱`);
  };

  const updateElement = (index: number, updates: Partial<FormBlock>) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], ...updates };
    setElements(newElements);
  };

  const deleteElement = (index: number) => {
    console.log(`🗑️ Deleting field at index ${index}...`);
    const newElements = [...elements];
    const deletedElement = newElements[index];
    newElements.splice(index, 1);
    setElements(newElements);
    console.log(`✅ Deleted "${deletedElement.label}" field 🗑️`);
  };

  // Add a function to delete a row from the grid
  const deleteGridRow = (rowIndex: number) => {
    console.log(`🗑️ Deleting row ${rowIndex}...`);
    
    // Remove elements in this row
    const newElements = elements.filter(element => element.rowIndex !== rowIndex);
    
    // Update rowIndex for elements in rows after the deleted row
    const updatedElements = newElements.map(element => {
      if (element.rowIndex && element.rowIndex > rowIndex) {
        return { ...element, rowIndex: element.rowIndex - 1 };
      }
      return element;
    });
    
    // Update elements state
    setElements(updatedElements);
    
    // Call the GridLayout's deleteRow function through the ref
    if (gridLayoutRef.current && gridLayoutRef.current.deleteRow) {
      gridLayoutRef.current.deleteRow(rowIndex);
    }
    
    console.log(`✅ Deleted row ${rowIndex} 🗑️`);
  };

  // Add a function to update a field in the grid
  const updateGridElement = (id: string, updates: Partial<FormBlock>) => {
    console.log(`✏️ Updating field (ID: ${id})...`);
    const index = elements.findIndex(element => element.id === id);
    if (index === -1) return;
    
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], ...updates };
    setElements(newElements);
    console.log(`✅ Updated field successfully! 🔄`);
  };

  // Add a function to delete a field from the grid
  const deleteGridElement = (id: string) => {
    console.log(`🗑️ Deleting field (ID: ${id})...`);
    const newElements = elements.filter(element => element.id !== id);
    setElements(newElements);
    console.log(`✅ Deleted field successfully! 🗑️`);
  };

  const saveForm = async () => {
    if (!formTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Form title is required",
      });
      return;
    }

    try {
      const builder = new FormBuilderSDK({
        title: formTitle,
        description: formDescription,
        id: formId,
      });

      elements.forEach(element => {
        builder.addBlock(element);
      });

      const form = await builder.save();
      
      toast({
        title: "Success",
        description: "Form saved successfully",
      });

      if (!formId) {
        navigate(`/builder/${form.id}`);
      }
    } catch (error: any) {
      if (error.message?.includes('unique_form_title')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A form with this title already exists. Please choose a different title.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    }
  };

  const copyEmbedCode = () => {
    if (!formId) return;
    
    const embedCode = `<iframe src="${window.location.origin}/form/${formId}?userId=USER_ID&userName=USER_NAME&userEmail=USER_EMAIL" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard. Replace USER_ID, USER_NAME, and USER_EMAIL with your user's information.",
    });
  };

  const copyFormLink = () => {
    if (!formId) return;
    
    const formLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(formLink);
    
    toast({
      title: "Copied!",
      description: "Form link copied to clipboard. Add ?userId=123&userName=John to pass user information.",
    });
  };

  const addNewRow = () => {
    // Get the next row index
    const newRowIndex = Math.max(...elements.map(e => e.rowIndex || 0), 0) + 1;
    
    // Set current row for context
    setCurrentRow(newRowIndex);
    
    // Call the GridLayout's addRow function through the ref
    if (gridLayoutRef.current) {
      gridLayoutRef.current.addRow();
    }
    
    toast({
      title: "New Row Added",
      description: `Row ${newRowIndex} added. Click "Add Field" in any cell to add content.`,
    });
  };

  const getElementsInRow = (rowIndex: number) => {
    return elements.filter(element => element.rowIndex === rowIndex);
  };

  const getUniqueRowIndexes = () => {
    const rowIndexes = elements.map(element => element.rowIndex || 0);
    return [...new Set(rowIndexes)].sort((a, b) => a - b);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      {!preview && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-2xl font-semibold h-auto px-0 border-0 focus-visible:ring-0 w-[300px]"
                placeholder="Enter form title..."
              />
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-sm text-muted-foreground h-auto px-0 border-0 focus-visible:ring-0 w-[500px]"
                placeholder="Enter form description (optional)..."
              />
            </div>
            <div className="flex gap-2">
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUseGridLayout(!useGridLayout)}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  {useGridLayout ? "Standard Layout" : "Grid Layout"}
                </Button>
                
                {useGridLayout && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addNewRow}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56" 
                    align="start"
                    side="bottom"
                    sideOffset={5}
                    alignOffset={0}
                    avoidCollisions={true}
                    collisionPadding={10}
                    maxHeight={300}
                  >
                    <DropdownMenuItem disabled className="font-semibold">Basic Fields</DropdownMenuItem>
                    {FIELD_GROUPS.basic.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => addElement(type as FormBlock["type"])}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Field
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="font-semibold">Choice Fields</DropdownMenuItem>
                    {FIELD_GROUPS.choice.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => addElement(type as FormBlock["type"])}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Field
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="font-semibold">Advanced Fields</DropdownMenuItem>
                    {FIELD_GROUPS.advanced.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => addElement(type as FormBlock["type"])}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} Field
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="font-semibold">Layout Elements</DropdownMenuItem>
                    {FIELD_GROUPS.layout.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => addElement(type as FormBlock["type"])}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button onClick={saveForm} variant="secondary" size="sm">
                  Save Form
                </Button>
                
                {formId && (
                  <>
                    <Button onClick={copyFormLink} variant="outline" size="sm">
                      <Link className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button onClick={copyEmbedCode} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Embed
                    </Button>
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      )}

      {preview ? (
        <FormPreview blocks={elements} />
      ) : (
        <>
          {useGridLayout ? (
            <div className="space-y-6 mt-6">
              <GridLayout 
                elements={elements}
                onAddElement={addGridElement}
                onDeleteRow={deleteGridRow}
                fieldGroups={FIELD_GROUPS}
                onUpdateElement={updateGridElement}
                onDeleteElement={deleteGridElement}
                ref={gridLayoutRef}
              />
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="form-elements">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 mt-6"
                  >
                    {elements.map((element, index) => (
                      <Draggable key={element.id} draggableId={element.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${getColumnWidthClass(element.columnWidth || "1")} relative`}
                          >
                            <Card className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <Input
                                  value={element.label}
                                  onChange={(e) =>
                                    updateElement(index, { label: e.target.value })
                                  }
                                  className="font-medium w-auto"
                                />
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Settings className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Field Settings</DialogTitle>
                                      </DialogHeader>
                                      <Tabs defaultValue="basic">
                                        <TabsList className="w-full">
                                          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                                          <TabsTrigger value="validation">Validation</TabsTrigger>
                                          <TabsTrigger value="appearance">Appearance</TabsTrigger>
                                          <TabsTrigger value="layout">Layout</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="basic" className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label>Field Type</Label>
                                            <Select
                                              value={element.type}
                                              onValueChange={(value: FormBlock["type"]) =>
                                                updateElement(index, { type: value })
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
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="time">Time</SelectItem>
                                                <SelectItem value="tel">Phone</SelectItem>
                                                <SelectItem value="url">URL</SelectItem>
                                                <SelectItem value="password">Password</SelectItem>
                                                <SelectItem value="file">File Upload</SelectItem>
                                                <SelectItem value="range">Range Slider</SelectItem>
                                                <SelectItem value="color">Color Picker</SelectItem>
                                                <SelectItem value="heading">Heading</SelectItem>
                                                <SelectItem value="paragraph">Paragraph</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          
                                          {!["heading", "paragraph"].includes(element.type) && (
                                            <div className="space-y-2">
                                              <Label>Placeholder</Label>
                                              <Input
                                                value={element.placeholder || ""}
                                                onChange={(e) =>
                                                  updateElement(index, {
                                                    placeholder: e.target.value,
                                                  })
                                                }
                                              />
                                            </div>
                                          )}
                                          
                                          {!["heading", "paragraph"].includes(element.type) && (
                                            <div className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`required-${element.id}`}
                                                checked={element.required || false}
                                                onCheckedChange={(checked) =>
                                                  updateElement(index, { required: !!checked })
                                                }
                                              />
                                              <Label htmlFor={`required-${element.id}`}>Required field</Label>
                                            </div>
                                          )}
                                          
                                          {!["heading", "paragraph"].includes(element.type) && (
                                            <div className="space-y-2">
                                              <Label>Help Text (optional)</Label>
                                              <Input
                                                value={element.helpText || ""}
                                                onChange={(e) =>
                                                  updateElement(index, {
                                                    helpText: e.target.value,
                                                  })
                                                }
                                                placeholder="Additional information about this field"
                                              />
                                            </div>
                                          )}
                                          
                                          {["select", "radio"].includes(element.type) && (
                                            <div className="space-y-2">
                                              <Label>Options (one per line)</Label>
                                              <Textarea
                                                value={(element.options || []).join("\n")}
                                                onChange={(e) =>
                                                  updateElement(index, {
                                                    options: e.target.value.split("\n").filter(Boolean),
                                                  })
                                                }
                                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                className="min-h-[100px]"
                                              />
                                            </div>
                                          )}
                                          
                                          {!["heading", "paragraph", "checkbox", "radio"].includes(element.type) && (
                                            <div className="space-y-2">
                                              <Label>Default Value (optional)</Label>
                                              <Input
                                                value={element.defaultValue?.toString() || ""}
                                                onChange={(e) =>
                                                  updateElement(index, {
                                                    defaultValue: e.target.value,
                                                  })
                                                }
                                                placeholder="Default value for this field"
                                              />
                                            </div>
                                          )}
                                        </TabsContent>
                                        
                                        <TabsContent value="validation" className="space-y-4 py-4">
                                          {element.type === "number" && (
                                            <>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <Label>Minimum Value</Label>
                                                  <Input
                                                    type="number"
                                                    value={element.validation?.min || ""}
                                                    onChange={(e) =>
                                                      updateElement(index, {
                                                        validation: {
                                                          ...(element.validation || {}),
                                                          min: e.target.value ? Number(e.target.value) : undefined,
                                                        },
                                                      })
                                                    }
                                                  />
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Maximum Value</Label>
                                                  <Input
                                                    type="number"
                                                    value={element.validation?.max || ""}
                                                    onChange={(e) =>
                                                      updateElement(index, {
                                                        validation: {
                                                          ...(element.validation || {}),
                                                          max: e.target.value ? Number(e.target.value) : undefined,
                                                        },
                                                      })
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          )}
                                          
                                          {["text", "textarea", "password", "tel", "url"].includes(element.type) && (
                                            <>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                  <Label>Minimum Length</Label>
                                                  <Input
                                                    type="number"
                                                    value={element.validation?.minLength || ""}
                                                    onChange={(e) =>
                                                      updateElement(index, {
                                                        validation: {
                                                          ...(element.validation || {}),
                                                          minLength: e.target.value ? Number(e.target.value) : undefined,
                                                        },
                                                      })
                                                    }
                                                  />
                                                </div>
                                                <div className="space-y-2">
                                                  <Label>Maximum Length</Label>
                                                  <Input
                                                    type="number"
                                                    value={element.validation?.maxLength || ""}
                                                    onChange={(e) =>
                                                      updateElement(index, {
                                                        validation: {
                                                          ...(element.validation || {}),
                                                          maxLength: e.target.value ? Number(e.target.value) : undefined,
                                                        },
                                                      })
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              
                                              <div className="space-y-2">
                                                <Label>Pattern (RegEx)</Label>
                                                <Input
                                                  value={element.validation?.pattern || ""}
                                                  onChange={(e) =>
                                                    updateElement(index, {
                                                      validation: {
                                                        ...(element.validation || {}),
                                                        pattern: e.target.value,
                                                      },
                                                    })
                                                  }
                                                  placeholder="Regular expression pattern"
                                                />
                                                <p className="text-xs text-gray-500">
                                                  Example: ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]&#123;2,&#125;$ for email validation
                                                </p>
                                              </div>
                                            </>
                                          )}
                                          
                                          {!["heading", "paragraph"].includes(element.type) && (
                                            <div className="space-y-2">
                                              <Label>Custom Error Message</Label>
                                              <Input
                                                value={element.validation?.customMessage || ""}
                                                onChange={(e) =>
                                                  updateElement(index, {
                                                    validation: {
                                                      ...(element.validation || {}),
                                                      customMessage: e.target.value,
                                                    },
                                                  })
                                                }
                                                placeholder="Shown when validation fails"
                                              />
                                            </div>
                                          )}
                                        </TabsContent>
                                        
                                        <TabsContent value="appearance" className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                              <Image className="h-4 w-4" /> Add Image
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <Label className="text-xs mb-2 block">Image URL</Label>
                                                <Input
                                                  value={element.imageSrc || ""}
                                                  onChange={(e) =>
                                                    updateElement(index, {
                                                      imageSrc: e.target.value,
                                                    })
                                                  }
                                                  placeholder="https://example.com/image.jpg"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                  Enter a URL or choose from examples
                                                </p>
                                              </div>
                                              <div className="space-y-2">
                                                <Label className="text-xs mb-2 block">Example Images</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                  {IMAGE_EXAMPLES.map((img) => (
                                                    <button
                                                      key={img.name}
                                                      type="button"
                                                      className="border rounded p-1 hover:bg-gray-100 transition-colors"
                                                      onClick={() => updateElement(index, { imageSrc: img.src })}
                                                    >
                                                      <img
                                                        src={img.src}
                                                        alt={img.name}
                                                        className="w-full h-12 object-cover rounded"
                                                      />
                                                      <span className="text-xs block mt-1 truncate">
                                                        {img.name}
                                                      </span>
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {element.imageSrc && (
                                            <>
                                              <div className="space-y-2">
                                                <Label>Image Display Mode</Label>
                                                <Select
                                                  value={element.imageFullField ? "full" : "inline"}
                                                  onValueChange={(value: "inline" | "full") =>
                                                    updateElement(index, { 
                                                      imageFullField: value === "full",
                                                      // If full field mode is selected, set position to left as default
                                                      imagePosition: value === "full" ? "left" : element.imagePosition || "left"
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
                                              
                                              {!element.imageFullField && (
                                                <div className="space-y-2">
                                                  <Label>Image Position</Label>
                                                  <Select
                                                    value={element.imagePosition || "left"}
                                                    onValueChange={(value: "left" | "right") =>
                                                      updateElement(index, { imagePosition: value })
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
                                              )}
                                              
                                              <div className="space-y-2">
                                                <Label>Image Size</Label>
                                                <Select
                                                  value={element.imageFullField ? "full" : (element.imageSize || "medium")}
                                                  onValueChange={(value) =>
                                                    updateElement(index, { 
                                                      imageSize: value === "full" ? "full" : value as "small" | "medium" | "large"
                                                    })
                                                  }
                                                  disabled={element.imageFullField}
                                                >
                                                  <SelectTrigger>
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    {element.imageFullField ? (
                                                      <SelectItem value="full">Full Size</SelectItem>
                                                    ) : (
                                                      <>
                                                        <SelectItem value="small">Small</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="large">Large</SelectItem>
                                                      </>
                                                    )}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                            </>
                                          )}
                                        </TabsContent>
                                        
                                        <TabsContent value="layout" className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label>Column Width</Label>
                                            <Select
                                              value={element.columnWidth || "1"}
                                              onValueChange={(value) =>
                                                updateElement(index, { columnWidth: value })
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {COLUMN_OPTIONS.map(option => (
                                                  <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label>Row Position</Label>
                                            <Select
                                              value={element.rowIndex?.toString() || "1"}
                                              onValueChange={(value) =>
                                                updateElement(index, { rowIndex: parseInt(value) })
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {getUniqueRowIndexes().map(idx => (
                                                  <SelectItem key={idx} value={idx.toString()}>
                                                    Row {idx}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            <Label>Element Height</Label>
                                            <Select
                                              value={element.height || "auto"}
                                              onValueChange={(value) =>
                                                updateElement(index, { height: value as "auto" | "small" | "medium" | "large" })
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
                                    onClick={() => deleteElement(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Preview of the field in builder mode */}
                              <div className="mt-2">
                                {element.imageSrc && (
                                  element.imageFullField ? (
                                    <div className="w-full">
                                      <img 
                                        src={element.imageSrc} 
                                        alt={`${element.label}`}
                                        className="w-full object-cover rounded"
                                        style={{ maxHeight: '400px' }}
                                      />
                                    </div>
                                  ) : (
                                    <div className={`flex items-center gap-2 mb-2 ${element.imagePosition === "right" ? "justify-end" : "justify-start"}`}>
                                      <img 
                                        src={element.imageSrc} 
                                        alt={`Preview for ${element.label}`}
                                        className={`object-cover rounded ${
                                          element.imageSize === "small" ? "h-16 w-16" : 
                                          element.imageSize === "large" ? "h-32 w-32" : "h-24 w-24"
                                        }`}
                                      />
                                    </div>
                                  )
                                )}
                                
                                {(!element.imageSrc || !element.imageFullField) && (
                                  ["heading", "paragraph"].includes(element.type) ? (
                                    element.type === "heading" ? (
                                      <h3 className="text-lg font-semibold">{element.label}</h3>
                                    ) : (
                                      <p className="text-gray-600">{element.label}</p>
                                    )
                                  ) : (
                                    <>
                                      {element.type === "textarea" ? (
                                        <Textarea placeholder={element.placeholder} className="mt-2" />
                                      ) : (
                                        <Input
                                          type={element.type}
                                          placeholder={element.placeholder}
                                          className="mt-2"
                                        />
                                      )}
                                    </>
                                  )
                                )}
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {elements.length === 0 && !useGridLayout && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed mt-6">
              <p className="text-gray-500">
                Start by adding form elements from the toolbar above
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormBuilder;
