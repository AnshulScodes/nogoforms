
/**
 * FormRunnerSDK: Handles form rendering and submission
 * Manages form responses and validation
 */

import type { Form, FormSubmission } from "@/types/forms";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface for storing form responses
 * Keys are block IDs, values are user inputs
 */
export interface FormResponse {
  [key: string]: any;
}

/**
 * FormRunnerSDK: Class for handling form submissions
 * 
 * This class handles:
 * - Collecting form responses
 * - Validating user input
 * - Submitting responses to the database
 * 
 * Usage example:
 * ```typescript
 * const runner = new FormRunnerSDK(form);
 * 
 * runner
 *   .setResponse("field1", "John Doe")
 *   .setResponse("field2", "john@example.com");
 * 
 * if (runner.validate()) {
 *   await runner.submit();
 * }
 * ```
 */
export class FormRunnerSDK {
  private form: Form;
  private response: FormResponse = {};

  /**
   * Creates a new form runner instance
   * @param form - The form configuration to run
   */
  constructor(form: Form) {
    this.form = form;
  }

  /**
   * Sets a response value for a specific block
   * @param blockId - ID of the form block
   * @param value - User's response value
   * @returns The runner instance for method chaining
   */
  public setResponse(blockId: string, value: any): FormRunnerSDK {
    this.response[blockId] = value;
    return this;
  }

  /**
   * Returns a copy of the current form responses
   * @returns Object containing all current responses
   */
  public getResponse(): FormResponse {
    return { ...this.response };
  }

  /**
   * Validates form responses against block configurations
   * @returns boolean indicating if all validations pass
   * 
   * Checks:
   * - Required fields
   * - Pattern validation
   * - Numeric constraints
   */
  public validate(): boolean {
    const schema = this.form.form_schema;
    
    for (const block of schema) {
      // Check required fields
      if (block.required && !this.response[block.id]) {
        return false;
      }

      // Check validation rules if present
      if (block.validation) {
        const value = this.response[block.id];
        // Pattern validation for string inputs
        if (block.validation.pattern && typeof value === 'string') {
          const regex = new RegExp(block.validation.pattern);
          if (!regex.test(value)) return false;
        }
        // Numeric constraints
        if (typeof value === 'number') {
          if (block.validation.min !== undefined && value < block.validation.min) return false;
          if (block.validation.max !== undefined && value > block.validation.max) return false;
        }
      }
    }

    return true;
  }

  /**
   * Submits form responses to the database
   * @returns Promise resolving to the saved submission
   * @throws Error if validation fails or database error occurs
   */
  public async submit(): Promise<FormSubmission> {
    if (!this.validate()) {
      throw new Error("Form validation failed");
    }

    const submissionData = {
      form_id: this.form.id,
      data: this.response,
      metadata: {
        submitted_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
      },
    };

    const { data, error } = await supabase
      .from("form_submissions")
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;
    return data as FormSubmission;
  }
}
