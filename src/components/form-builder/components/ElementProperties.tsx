import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormElement } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Move } from 'lucide-react';

/**
 * ElementProperties Component
 * 
 * A panel for editing the properties of the selected form element.
 * Provides different property editors based on the element type.
 * 
 * @param element - The currently selected form element
 * @param onUpdate - Callback function when properties are updated
 * @param onDelete - Callback function to delete the element
 */
interface ElementPropertiesProps {
  element: FormElement | null;
  onUpdate: (id: string, updates: Partial<FormElement>) => void;
  onDelete: (id: string) => void;
}

export const ElementProperties: React.FC<ElementPropertiesProps> = ({
  element,
  onUpdate,
  onDelete,
}) => {
  if (!element) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  const handleChange = (field: keyof FormElement, value: any) => {
    onUpdate(element.id, { [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(element.options || [])];
    options[index] = value;
    onUpdate(element.id, { options });
  };

  const addOption = () => {
    const options = [...(element.options || []), `Option ${(element.options?.length || 0) + 1}`];
    onUpdate(element.id, { options });
  };

  const removeOption = (index: number) => {
    const options = [...(element.options || [])];
    options.splice(index, 1);
    onUpdate(element.id, { options });
  };

  return (
    <div className="p-4 space-y-4 border-l overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Element Properties</h3>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(element.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={element.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={element.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={element.helpText || ''}
              onChange={(e) => handleChange('helpText', e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={element.required || false}
              onCheckedChange={(checked) => handleChange('required', checked)}
            />
            <Label htmlFor="required">Required</Label>
          </div>
          
          {(element.type === 'select' || element.type === 'checkbox') && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {element.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Move className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 pt-4">
          {element.type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="imageSrc">Image URL</Label>
              <Input
                id="imageSrc"
                value={element.imageSrc || ''}
                onChange={(e) => handleChange('imageSrc', e.target.value)}
              />
            </div>
          )}
          
          {element.type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="imagePosition">Image Position</Label>
              <Select
                value={element.imagePosition || 'left'}
                onValueChange={(value) => handleChange('imagePosition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {element.type === 'image' && (
            <div className="space-y-2">
              <Label htmlFor="imageSize">Image Size</Label>
              <Select
                value={element.imageSize || 'medium'}
                onValueChange={(value) => handleChange('imageSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {(element.type === 'grid' || element.type === 'column' || element.type === 'row') && (
            <>
              <div className="space-y-2">
                <Label>Grid Columns</Label>
                <Slider
                  defaultValue={[element.gridColumns || 2]}
                  min={1}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleChange('gridColumns', value[0])}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {element.gridColumns || 2} columns
                </div>
              </div>
              
              {element.type === 'grid' && (
                <div className="space-y-2">
                  <Label>Grid Rows</Label>
                  <Slider
                    defaultValue={[element.gridRows || 1]}
                    min={1}
                    max={6}
                    step={1}
                    onValueChange={(value) => handleChange('gridRows', value[0])}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {element.gridRows || 1} rows
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Grid Gap</Label>
                <Slider
                  defaultValue={[element.gridGap || 4]}
                  min={0}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleChange('gridGap', value[0])}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {element.gridGap || 4} spacing
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="columnWidth">Column Width</Label>
            <Select
              value={element.columnWidth || '1'}
              onValueChange={(value) => handleChange('columnWidth', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select width" />
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
        </TabsContent>
        
        <TabsContent value="validation" className="space-y-4 pt-4">
          {(element.type === 'text' || element.type === 'textarea') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="minLength">Min Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={element.validation?.minLength || ''}
                  onChange={(e) => handleChange('validation', {
                    ...element.validation,
                    minLength: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxLength">Max Length</Label>
                <Input
                  id="maxLength"
                  type="number"
                  value={element.validation?.maxLength || ''}
                  onChange={(e) => handleChange('validation', {
                    ...element.validation,
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                />
              </div>
            </>
          )}
          
          {element.type === 'text' && (
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern (Regex)</Label>
              <Input
                id="pattern"
                value={element.validation?.pattern || ''}
                onChange={(e) => handleChange('validation', {
                  ...element.validation,
                  pattern: e.target.value
                })}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Error Message</Label>
            <Textarea
              id="customMessage"
              value={element.validation?.customMessage || ''}
              onChange={(e) => handleChange('validation', {
                ...element.validation,
                customMessage: e.target.value
              })}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 