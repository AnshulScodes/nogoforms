
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Form, FormBlockJson } from "@/types/forms";
import type { FormBlock } from "@/sdk/FormBlockSDK";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitFormResponse } from "@/services/forms";
import { useToast } from "@/hooks/use-toast";

export default function FormEmbed() {
  const [form, setForm] = useState<Form | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadForm = async () => {
      const formId = new URLSearchParams(window.location.search).get('id');
      if (!formId) return;

      const { data } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (data) {
        setForm({
          ...data,
          form_schema: (data.form_schema as FormBlockJson[]).map(block => ({
            ...block,
            type: block.type as FormBlock["type"],
          }))
        });
      }
      setLoading(false);
    };

    loadForm();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Form not found</div>
      </div>
    );
  }

  const handleInputChange = (blockId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [blockId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await submitFormResponse(form.id, formData);
      toast({
        title: "Thank you!",
        description: "Your response has been submitted.",
      });
      setFormData({}); // Reset form
    } catch (error) {
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
    return form.form_schema
      .filter(block => block.required)
      .every(block => formData[block.id]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-xl">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold mb-6">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 mb-6">{form.description}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.form_schema.map((block) => (
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
      </div>
    </div>
  );
}
