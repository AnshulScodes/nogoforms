
import type { FormData } from '@/services/forms';

export type FormStatus = "draft" | "published" | "archived";

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
  colIndex?: number;
  columnWidth?: string;
  height?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  form_schema: FormBlock[];
  settings: Record<string, any> | null;
  status: FormStatus | null;
  created_at: string | null;
  updated_at: string | null;
}

export const convertFormDataToForm = (formData: FormData): Form => {
  if (!formData.id) {
    throw new Error('Form data must have an ID to be converted to a Form');
  }
  
  return {
    id: formData.id,
    title: formData.title,
    description: formData.description || null,
    form_schema: formData.form_schema || [],
    settings: formData.settings || null,
    status: formData.status as FormStatus || null,
    created_at: formData.created_at || null,
    updated_at: formData.updated_at || null
  };
};

import { createForm, updateForm } from '@/services/forms';
import { supabase } from '@/integrations/supabase/client';

// Export FormBuilderSDK only once at the end
export class FormBuilderSDK {
  private form: Partial<Form>;
  private blocks: FormBlock[] = [];

  constructor(formConfig: { id?: string; title: string; description?: string }) {
    this.form = {
      id: formConfig.id,
      title: formConfig.title,
      description: formConfig.description || null,
      form_schema: []
    };
  }

  public addBlock(block: FormBlock): void {
    this.blocks.push(block);
  }

  public async save(): Promise<Form> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a properly-typed FormData object for the service
    const formData: FormData = {
      id: this.form.id,
      title: this.form.title || '',
      description: this.form.description || null,
      form_schema: this.blocks,
      settings: this.form.settings || null,
      status: (this.form.status as FormStatus) || 'draft'
    };

    if (this.form.id) {
      // Convert the result to a properly-typed Form
      const updatedForm = await updateForm(this.form.id, formData, user.id);
      return convertFormDataToForm(updatedForm);
    } else {
      // Convert the result to a properly-typed Form
      const newForm = await createForm(formData, user.id);
      return convertFormDataToForm(newForm);
    }
  }
}
