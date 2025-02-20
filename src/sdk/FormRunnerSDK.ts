
import type { Form, FormSubmission } from "@/types/forms";
import { supabase } from "@/integrations/supabase/client";

export interface FormResponse {
  [key: string]: any;
}

export class FormRunnerSDK {
  private form: Form;
  private response: FormResponse = {};

  constructor(form: Form) {
    this.form = form;
  }

  public setResponse(blockId: string, value: any): FormRunnerSDK {
    this.response[blockId] = value;
    return this;
  }

  public getResponse(): FormResponse {
    return { ...this.response };
  }

  public validate(): boolean {
    const schema = this.form.form_schema as any[];
    
    for (const block of schema) {
      if (block.required && !this.response[block.id]) {
        return false;
      }

      if (block.validation) {
        const value = this.response[block.id];
        if (block.validation.pattern && typeof value === 'string') {
          const regex = new RegExp(block.validation.pattern);
          if (!regex.test(value)) return false;
        }
        if (typeof value === 'number') {
          if (block.validation.min !== undefined && value < block.validation.min) return false;
          if (block.validation.max !== undefined && value > block.validation.max) return false;
        }
      }
    }

    return true;
  }

  public async submit(): Promise<FormSubmission> {
    if (!this.validate()) {
      throw new Error("Form validation failed");
    }

    const { data, error } = await supabase
      .from("form_submissions")
      .insert({
        form_id: this.form.id,
        data: this.response,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
