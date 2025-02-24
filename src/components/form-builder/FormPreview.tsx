
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitFormResponse } from '@/services/forms';
import type { FormBlock } from '@/sdk';

interface FormPreviewProps {
  blocks: FormBlock[];
  formId?: string;
}

const FormPreview: React.FC<FormPreviewProps> = ({ blocks, formId }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (blockId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [blockId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formId) {
      console.log('Preview mode - form data:', formData);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFormResponse(formId, formData);
      toast({
        title: "Success!",
        description: "Your response has been submitted.",
      });
      setFormData({}); // Reset form
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateRequired = () => {
    const requiredFields = blocks.filter(block => block.required);
    return requiredFields.every(field => formData[field.id]);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} className="space-y-2">
            <Label>
              {block.label}
              {block.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {['text', 'email', 'number'].includes(block.type) && (
              <Input
                type={block.type}
                placeholder={block.placeholder}
                required={block.required}
                value={formData[block.id] || ''}
                onChange={(e) => handleInputChange(block.id, e.target.value)}
              />
            )}

            {block.type === 'select' && (
              <Select
                value={formData[block.id] || ''}
                onValueChange={(value) => handleInputChange(block.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={block.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {block.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {block.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={block.id}
                  checked={formData[block.id] || false}
                  onCheckedChange={(checked) => handleInputChange(block.id, checked)}
                  required={block.required}
                />
                <label
                  htmlFor={block.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {block.placeholder || block.label}
                </label>
              </div>
            )}

            {block.type === 'radio' && (
              <RadioGroup
                value={formData[block.id] || ''}
                onValueChange={(value) => handleInputChange(block.id, value)}
                required={block.required}
              >
                {block.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${block.id}-${option}`} />
                    <Label htmlFor={`${block.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || !validateRequired()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Card>
  );
};

export default FormPreview;
