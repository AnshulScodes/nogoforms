
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { FormBuilderSDK, type FormBlock } from "@/sdk";
import { useToast } from "@/hooks/use-toast";

const FormBuilder = () => {
  const [elements, setElements] = useState<FormBlock[]>([]);
  const { toast } = useToast();

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setElements(items);
  };

  const addElement = (type: FormBlock["type"]) => {
    const builder = new FormBuilderSDK({ title: "New Form" });
    const block = builder.addBlock({
      type,
      label: `New ${type} field`,
      placeholder: `Enter ${type}...`,
    }).toJSON();

    setElements([...elements, block.form_schema[0] as FormBlock]);
  };

  const saveForm = async () => {
    try {
      const builder = new FormBuilderSDK({
        title: "My Form",
        description: "A form created with FormBuilder SDK",
      });

      elements.forEach(element => {
        builder.addBlock(element);
      });

      await builder.save();

      toast({
        title: "Success",
        description: "Form saved successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Form Builder</h2>
        <div className="flex gap-2">
          <Button onClick={() => addElement("text")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
          <Button onClick={saveForm} variant="secondary" size="sm">
            Save Form
          </Button>
        </div>
      </div>

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
                      <Card className="p-4 hover-card">
                        <Label>{element.label}</Label>
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
    </div>
  );
};

export default FormBuilder;
