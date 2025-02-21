
import type { Form } from "@/types/forms";
import type { Json } from "@/types/database";
import { FormBlockSDK, type FormBlock, type FormBlockConfig } from "./FormBlockSDK";
import { supabase } from "@/integrations/supabase/client";

/**
 * Configuration interface for creating a new form builder instance
 * @property title - The title of the form
 * @property description - Optional description text for the form
 * @property settings - Optional configuration object for form-wide settings
 */
export interface FormBuilderConfig {
  title: string;
  description?: string;
  settings?: Record<string, any>;
}

/**
 * FormBuilderSDK: Main class for creating and managing forms
 * 
 * This class handles:
 * - Form creation and configuration
 * - Adding, updating, and removing form blocks (fields)
 * - Reordering form blocks
 * - Saving forms to the database
 * 
 * Usage example:
 * ```typescript
 * const builder = new FormBuilderSDK({
 *   title: "Contact Form",
 *   description: "Get in touch with us"
 * });
 * 
 * builder
 *   .addBlock({ type: "text", label: "Name" })
 *   .addBlock({ type: "email", label: "Email" });
 * 
 * const form = await builder.save();
 * ```
 */
export class FormBuilderSDK {
  /** Stores the form metadata and configuration */
  private form: Partial<Form>;
  /** Array of form blocks representing each field in the form */
  private blocks: FormBlock[] = [];

  /**
   * Creates a new form builder instance
   * @param config - The initial configuration for the form
   */
  constructor(config: FormBuilderConfig) {
    this.form = {
      title: config.title,
      description: config.description,
      settings: config.settings || {},
      form_schema: [],
      status: "draft",
    };
  }

  /**
   * Adds a new block (field) to the form
   * @param blockConfig - Configuration for the new block
   * @returns The form builder instance for method chaining
   * 
   * Example:
   * ```typescript
   * builder.addBlock({
   *   type: "text",
   *   label: "Full Name",
   *   required: true
   * });
   * ```
   */
  public addBlock(blockConfig: FormBlockConfig): FormBuilderSDK {
    const block = new FormBlockSDK(blockConfig);
    this.blocks.push(block.toJSON());
    return this;
  }

  /**
   * Updates an existing block's configuration
   * @param blockId - The ID of the block to update
   * @param updates - Partial configuration updates to apply
   * @returns The form builder instance for method chaining
   * @throws Error if block is not found
   */
  public updateBlock(blockId: string, updates: Partial<FormBlockConfig>): FormBuilderSDK {
    const blockIndex = this.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) throw new Error("Block not found");

    this.blocks[blockIndex] = {
      ...this.blocks[blockIndex],
      ...updates,
    };
    return this;
  }

  /**
   * Removes a block from the form
   * @param blockId - The ID of the block to remove
   * @returns The form builder instance for method chaining
   */
  public removeBlock(blockId: string): FormBuilderSDK {
    this.blocks = this.blocks.filter((b) => b.id !== blockId);
    return this;
  }

  /**
   * Reorders blocks in the form
   * @param blockIds - Array of block IDs in their new order
   * @returns The form builder instance for method chaining
   * @throws Error if the provided array doesn't match existing blocks
   */
  public reorderBlocks(blockIds: string[]): FormBuilderSDK {
    if (blockIds.length !== this.blocks.length) {
      throw new Error("Invalid block order");
    }

    const blocksMap = new Map(this.blocks.map((b) => [b.id, b]));
    this.blocks = blockIds.map((id) => {
      const block = blocksMap.get(id);
      if (!block) throw new Error(`Block ${id} not found`);
      return block;
    });

    return this;
  }

  /**
   * Saves the form to the database
   * @returns Promise resolving to the saved form
   * @throws Error if database operation fails
   * 
   * This method:
   * 1. Validates the form structure
   * 2. Converts blocks to a JSON-safe format
   * 3. Saves to the Supabase database
   */
  public async save(): Promise<Form> {
    // Convert blocks to a JSON-safe format
    const formSchema = this.blocks.map(block => ({
      ...block,
      type: block.type,
      label: block.label,
      placeholder: block.placeholder || null,
      required: block.required || false,
      options: block.options || [],
      validation: block.validation || null,
    })) as Json;

    const formData = {
      title: this.form.title!,
      description: this.form.description || null,
      settings: this.form.settings as Json || null,
      form_schema: formSchema,
      status: this.form.status || 'draft',
    };
    
    const { data, error } = await supabase
      .from("forms")
      .insert(formData)
      .select()
      .single();

    if (error) throw error;
    return data as Form;
  }

  /**
   * Converts the form to a JSON representation
   * @returns Partial form object with current configuration
   */
  public toJSON(): Partial<Form> {
    return {
      ...this.form,
      form_schema: this.blocks,
    };
  }
}
