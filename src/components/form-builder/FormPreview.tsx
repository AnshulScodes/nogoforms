
import React, { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface FormPreviewProps {
  blocks: FormBlock[];
  formId?: string;
  userInfo?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userCompany?: string;
    [key: string]: any; // Allow any additional user metadata
  };
}

const FormPreview: React.FC<FormPreviewProps> = ({ blocks, formId, userInfo = {} }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the component is in an iframe
    setIsEmbedded(window.self !== window.top);
    
    // Initialize form data with default values
    const initialData: Record<string, any> = {};
    blocks.forEach(block => {
      if (block.defaultValue !== undefined) {
        initialData[block.id] = block.defaultValue;
      }
    });
    setFormData(initialData);
  }, [blocks]);

  const handleInputChange = (blockId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [blockId]: value
    }));
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formId) {
      console.log('Preview mode - form data:', formData);
      toast({
        title: "Preview Mode",
        description: "Form data captured (preview only)",
      });
      return;
    }

    if (Object.keys(formData).length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out at least one field before submitting.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const metadata = {
        submitted_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        user_info: userInfo,
        referrer: document.referrer || 'direct'
      };
      
      await submitFormResponse(formId, formData, metadata);
      
      toast({
        title: "Success!",
        description: "Your response has been submitted.",
        variant: "default",
      });
      
      setSubmitted(true);
      setFormData({});
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateRequired = () => {
    const requiredFields = blocks.filter(block => block.required);
    return requiredFields.every(field => formData[field.id]);
  };

  // Apply minimal styling when embedded
  const containerClass = isEmbedded 
    ? "p-0" 
    : "p-6 border rounded-lg shadow-sm bg-white";

  // Function to render an image with the appropriate size class
  const renderFieldImage = (block: FormBlock) => {
    if (!block.imageSrc) return null;
    
    const sizeClasses = {
      small: "w-16 h-16",
      medium: "w-24 h-24",
      large: "w-32 h-32"
    };
    
    const sizeClass = block.imageSize ? sizeClasses[block.imageSize] : sizeClasses.medium;
    
    return (
      <img 
        src={block.imageSrc} 
        alt={`Image for ${block.label}`} 
        className={cn(sizeClass, "object-cover rounded-md")}
      />
    );
  };

  return (
    <div className={containerClass}>
      {submitted ? (
        <div className="text-center py-4">
          <h2 className="text-xl font-semibold text-green-600 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
          <Button 
            onClick={() => setSubmitted(false)} 
            variant="outline"
          >
            Submit Another Response
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {blocks.map((block) => {
            // For heading and paragraph types, render them differently
            if (block.type === 'heading') {
              return (
                <h2 key={block.id} className="text-xl font-semibold mt-6 mb-2">
                  {block.label}
                </h2>
              );
            }
            
            if (block.type === 'paragraph') {
              return (
                <p key={block.id} className="text-gray-600 mb-4">
                  {block.label}
                </p>
              );
            }
            
            // For regular form fields
            return (
              <div key={block.id} className="space-y-2">
                <div className={cn(
                  "flex items-start gap-3",
                  block.imagePosition === "right" && "flex-row-reverse"
                )}>
                  <div className={cn("flex-1", block.imageSrc && "max-w-[calc(100%-88px)]")}>
                    <Label>
                      {block.label}
                      {block.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {block.helpText && (
                      <p className="text-xs text-gray-500 mt-1 mb-2">{block.helpText}</p>
                    )}
                    
                    {/* Text, Email, Tel, URL, Password Inputs */}
                    {['text', 'email', 'tel', 'url', 'password'].includes(block.type) && (
                      <Input
                        type={block.type}
                        placeholder={block.placeholder}
                        required={block.required}
                        value={formData[block.id] || ''}
                        onChange={(e) => handleInputChange(block.id, e.target.value)}
                      />
                    )}
                    
                    {/* Number Input */}
                    {block.type === 'number' && (
                      <Input
                        type="number"
                        placeholder={block.placeholder}
                        required={block.required}
                        min={block.validation?.min}
                        max={block.validation?.max}
                        value={formData[block.id] || ''}
                        onChange={(e) => handleInputChange(block.id, e.target.value)}
                      />
                    )}
                    
                    {/* Textarea */}
                    {block.type === 'textarea' && (
                      <Textarea
                        placeholder={block.placeholder}
                        required={block.required}
                        value={formData[block.id] || ''}
                        onChange={(e) => handleInputChange(block.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    )}
                    
                    {/* Date Input */}
                    {block.type === 'date' && (
                      <Input
                        type="date"
                        required={block.required}
                        value={formData[block.id] || ''}
                        onChange={(e) => handleInputChange(block.id, e.target.value)}
                      />
                    )}
                    
                    {/* Time Input */}
                    {block.type === 'time' && (
                      <Input
                        type="time"
                        required={block.required}
                        value={formData[block.id] || ''}
                        onChange={(e) => handleInputChange(block.id, e.target.value)}
                      />
                    )}
                    
                    {/* Color Picker */}
                    {block.type === 'color' && (
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          required={block.required}
                          value={formData[block.id] || '#000000'}
                          onChange={(e) => handleInputChange(block.id, e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <span className="text-sm text-gray-500">
                          {formData[block.id] || '#000000'}
                        </span>
                      </div>
                    )}
                    
                    {/* Range Slider */}
                    {block.type === 'range' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{block.validation?.min || 0}</span>
                          <span>{block.validation?.max || 100}</span>
                        </div>
                        <Input
                          type="range"
                          min={block.validation?.min || 0}
                          max={block.validation?.max || 100}
                          value={formData[block.id] || 0}
                          onChange={(e) => handleInputChange(block.id, parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-sm">
                          Value: {formData[block.id] || 0}
                        </div>
                      </div>
                    )}
                    
                    {/* File Upload */}
                    {block.type === 'file' && (
                      <Input
                        type="file"
                        required={block.required}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleInputChange(block.id, e.target.files[0]);
                          }
                        }}
                      />
                    )}
                    
                    {/* Select Dropdown */}
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
                    
                    {/* Checkbox */}
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
                    
                    {/* Radio Buttons */}
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
                  
                  {/* Render the field image if provided */}
                  {renderFieldImage(block)}
                </div>
              </div>
            );
          })}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !validateRequired()}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : 'Submit'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default FormPreview;
