import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Link, Trash2, Settings } from "lucide-react";
import { FormBuilderSDK, type FormBlock } from "@/sdk";
import { useToast } from "@/hooks/use-toast";
import FormPreview from "./FormPreview";
import { getFormById } from "@/services/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormBuilderProps {
  preview?: boolean;
}

const FormBuilder = ({ preview = false }: FormBuilderProps) => {
  const [elements, setElements] = useState<FormBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState("New Form");
  const [formDescription, setFormDescription] = useState("");
  const { formId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    try {
      setLoading(true);
      const form = await getFormById(id);
      setElements(form.form_schema);
      setFormTitle(form.title);
      setFormDescription(form.description || "");
    } catch (error: any) {
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
    const builder = new FormBuilderSDK({ title: formTitle });
    
    const baseConfig: FormBlock = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}...`,
      required: false,
      options: type === "select" || type === "radio" ? ["Option 1", "Option 2", "Option 3"] : undefined
    };

    const block = builder.addBlock(baseConfig).toJSON();
    setElements([...elements, block.form_schema[0] as FormBlock]);
  };

  const updateElement = (index: number, updates: Partial<FormBlock>) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], ...updates };
    setElements(newElements);
  };

  const deleteElement = (index: number) => {
    const newElements = [...elements];
    newElements.splice(index, 1);
    setElements(newElements);
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
    
    const embedCode = `<iframe src="${window.location.origin}/form/${formId}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const copyFormLink = () => {
    if (!formId) return;
    
    const formLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(formLink);
    
    toast({
      title: "Copied!",
      description: "Form link copied to clipboard",
    });
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
                className="text-2xl font-semibold h-auto text-xl px-0 border-0 focus-visible:ring-0 w-[300px]"
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addElement("text")}>
                      Text Field
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addElement("email")}>
                      Email Field
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addElement("number")}>
                      Number Field
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addElement("select")}>
                      Select Field
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addElement("checkbox")}>
                      Checkbox
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addElement("radio")}>
                      Radio Buttons
                    </DropdownMenuItem>
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="form-elements">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {elements.map((element, index) => (
                    <Draggable
                      key={element.id}
                      draggableId={element.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
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
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Field Settings</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
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
                                            <SelectItem value="select">Select</SelectItem>
                                            <SelectItem value="checkbox">Checkbox</SelectItem>
                                            <SelectItem value="radio">Radio</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
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
                                    </div>
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
                            <Input
                              type={element.type}
                              placeholder={element.placeholder}
                              className="mt-2"
                            />
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

          {elements.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
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
