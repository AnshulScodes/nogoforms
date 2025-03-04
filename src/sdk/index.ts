
import type { FormData } from '@/services/forms';

export type FormBlockType = 
  "text" | 
  "email" | 
  "number" | 
  "select" | 
  "checkbox" | 
  "radio" | 
  "textarea" | 
  "date" | 
  "tel" | 
  "url" | 
  "password" | 
  "range" | 
  "file" | 
  "hidden" | 
  "color" | 
  "time" | 
  "heading" | 
  "paragraph" |
  "image";

export interface FormBlock {
  id: string;
  type: FormBlockType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  imageSrc?: string;
  imagePosition?: "left" | "right";
  imageSize?: "small" | "medium" | "large" | "full";
  imageFullField?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    customMessage?: string;
  };
  helpText?: string;
  defaultValue?: string | number | boolean;
  rowIndex?: number;
  columnWidth?: string;
  height?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  form_schema: FormBlock[];
  settings?: {
    theme?: string;
    submitButtonText?: string;
    showLabels?: boolean;
    successMessage?: string;
    redirectUrl?: string;
    captcha?: boolean;
    [key: string]: any;
  };
  status?: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
}

// Type conversion helper
export const convertFormDataToForm = (formData: FormData): Form => {
  if (!formData.id) {
    throw new Error('Form data must have an ID to be converted to a Form');
  }
  
  return {
    ...formData,
    id: formData.id
  } as Form;
};
