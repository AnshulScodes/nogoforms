import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FormElement } from '../types';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * FormPreview Component
 * 
 * Renders a preview of the form with functional form elements.
 * Handles form submission and validation.
 * 
 * @param elements - The form elements to display
 * @param title - The form title
 * @param description - The form description
 * @param onSubmit - Callback when the form is submitted
 * @param formId - Optional form ID for submission
 * @param userInfo - Optional user information for submission
 */
interface FormPreviewProps {
  elements: Record<string, FormElement>;
  title: string;
  description: string;
  onSubmit?: (values: Record<string, any>) => void;
  formId?: string;
  userInfo?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userCompany?: string;
    [key: string]: any; // Allow any additional user metadata
  };
}

// Helper function to convert column width to CSS class
const getColumnWidthClass = (width?: string) => {
  switch (width) {
    case "1/2": return "w-1/2";
    case "1/3": return "w-1/3";
    case "2/3": return "w-2/3";
    case "1/4": return "w-1/4";
    case "3/4": return "w-3/4";
    default: return "w-full";
  }
};

// Helper function to get height class
const getHeightClass = (height?: string | number) => {
  if (typeof height === 'number') {
    return `min-h-[${height}px]`;
  }
  
  switch (height) {
    case "small": return "min-h-[100px]";
    case "medium": return "min-h-[150px]";
    case "large": return "min-h-[250px]";
    default: return "";
  }
};

export const FormPreview: React.FC<FormPreviewProps> = ({
  elements,
  title,
  description,
  onSubmit,
  formId,
  userInfo,
}) => {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values with default values
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    
    Object.values(elements).forEach(element => {
      if (element.defaultValue !== undefined) {
        initialValues[element.id] = element.defaultValue;
      }
    });
    
    setFormValues(initialValues);
  }, [elements]);

  const handleChange = (id: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value,
    }));
    
    // Clear error when field is changed
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    Object.values(elements).forEach(element => {
      // Skip validation for container elements
      if (['grid', 'column', 'row'].includes(element.type)) {
        return;
      }
      
      const value = formValues[element.id];
      
      // Required field validation
      if (element.required && (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
        newErrors[element.id] = `${element.label} is required`;
        return;
      }
      
      // Skip further validation if field is empty and not required
      if (value === undefined || value === '') {
        return;
      }
      
      // Validation rules
      if (element.validation) {
        // Min/max validation for number fields
        if (element.type === 'number') {
          const numValue = Number(value);
          
          if (element.validation.min !== undefined && numValue < element.validation.min) {
            newErrors[element.id] = element.validation.customMessage || 
              `Value must be at least ${element.validation.min}`;
          }
          
          if (element.validation.max !== undefined && numValue > element.validation.max) {
            newErrors[element.id] = element.validation.customMessage || 
              `Value must be at most ${element.validation.max}`;
          }
        }
        
        // Min/max length validation for text fields
        if (['text', 'textarea'].includes(element.type) && typeof value === 'string') {
          if (element.validation.minLength !== undefined && value.length < element.validation.minLength) {
            newErrors[element.id] = element.validation.customMessage || 
              `Must be at least ${element.validation.minLength} characters`;
          }
          
          if (element.validation.maxLength !== undefined && value.length > element.validation.maxLength) {
            newErrors[element.id] = element.validation.customMessage || 
              `Must be at most ${element.validation.maxLength} characters`;
          }
        }
        
        // Pattern validation for text fields
        if (element.type === 'text' && element.validation.pattern && typeof value === 'string') {
          const regex = new RegExp(element.validation.pattern);
          if (!regex.test(value)) {
            newErrors[element.id] = element.validation.customMessage || 
              `Please enter a valid value`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add user info to form values if provided
      const submissionData = {
        ...formValues,
        ...(userInfo ? { userInfo } : {}),
        ...(formId ? { formId } : {}),
      };
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(submissionData);
      }
      
      toast({
        title: "Form Submitted",
        description: "Your form has been submitted successfully.",
      });
      
      // Reset form after successful submission
      setFormValues({});
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form elements
  const renderFormElement = (element: FormElement) => {
    const { id, type, label, required, helpText } = element;
    
    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input
              id={id}
              placeholder={element.placeholder}
              value={formValues[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              aria-invalid={!!errors[id]}
            />
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
            {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Textarea
              id={id}
              placeholder={element.placeholder}
              value={formValues[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              className={getHeightClass(element.height)}
              aria-invalid={!!errors[id]}
            />
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
            {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <div className="space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-option-${index}`}
                    checked={Array.isArray(formValues[id]) ? formValues[id]?.includes(option) : false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newValues = Array.isArray(formValues[id]) ? [...formValues[id]] : [];
                        handleChange(id, [...newValues, option]);
                      } else {
                        handleChange(
                          id,
                          Array.isArray(formValues[id])
                            ? formValues[id].filter((val: string) => val !== option)
                            : []
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${id}-option-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
            {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Select
              value={formValues[id] || ''}
              onValueChange={(value) => handleChange(id, value)}
            >
              <SelectTrigger id={id} aria-invalid={!!errors[id]}>
                <SelectValue placeholder={element.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {element.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
            {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
          </div>
        );
      
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formValues[id] && "text-muted-foreground",
                    !!errors[id] && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formValues[id] ? format(new Date(formValues[id]), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formValues[id] ? new Date(formValues[id]) : undefined}
                  onSelect={(date) => handleChange(id, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
            {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
            <div className={cn(
              "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center",
              !!errors[id] && "border-red-500"
            )}>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">
                {helpText || 'Upload files up to 10MB'}
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files?.length) {
                    handleChange(id, files[0]);
                  }
                };
                input.click();
              }}>
                Browse Files
              </Button>
              {formValues[id] && (
                <p className="text-xs mt-2">
                  Selected: {formValues[id].name}
                </p>
              )}
            </div>
            {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
          </div>
        );
      
      case 'image':
        return (
          <div className={cn(
            "w-full",
            element.imagePosition === 'right' ? 'text-right' : 'text-left'
          )}>
            {element.imageSrc && (
              <img 
                src={element.imageSrc} 
                alt={label || 'Image'} 
                className={cn(
                  "rounded-md",
                  element.imageSize === 'small' ? 'max-w-[200px] max-h-[200px]' : 
                  element.imageSize === 'large' ? 'max-w-full' : 'max-w-[400px] max-h-[400px]'
                )}
              />
            )}
            {label && <p className="text-sm mt-2">{label}</p>}
          </div>
        );
      
      case 'grid':
        return (
          <div 
            className="w-full grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${element.gridColumns || 2}, 1fr)`,
              gap: `${element.gridGap || 4}px`
            }}
          >
            {element.children?.map(childId => {
              const childElement = elements[childId];
              return childElement ? (
                <div key={childId} className={getColumnWidthClass(childElement.columnWidth)}>
                  {renderFormElement(childElement)}
                </div>
              ) : null;
            })}
          </div>
        );
      
      default:
        return null;
    }
  };

  // Sort elements by their position in the form (if they have x/y coordinates)
  const sortedElements = Object.values(elements)
    .filter(element => !element.parentId) // Only top-level elements
    .sort((a, b) => {
      if (a.y !== undefined && b.y !== undefined) {
        return a.y - b.y;
      }
      return 0;
    });

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {sortedElements.map(element => (
          <div key={element.id} className={getColumnWidthClass(element.columnWidth)}>
            {renderFormElement(element)}
          </div>
        ))}
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}; 