
/**
 * FormBuilderSDK: Main interface for form creation and management
 * Handles form structure, blocks, and persistence
 */

import type { Form } from "@/types/forms";
import { FormBlockSDK, type FormBlock, type FormBlockConfig } from "./FormBlockSDK";
import { supabase } from "@/integrations/supabase/client";

export interface FormBuilderConfig {
  title: string;
  description?: string;
  settings?: Record<string, any>;
}

export class FormBuilderSDK {
  private form: Partial<Form>;
  private blocks: FormBlock[] = [];

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
   * Adds a new block to the form
   * Returns the builder instance for method chaining
   */
  public addBlock(blockConfig: FormBlockConfig): FormBuilderSDK {
    const block = new FormBlockSDK(blockConfig);
    this.blocks.push(block.toJSON());
    return this;
  }

  /**
   * Updates an existing block's configuration
   * Throws if block not found
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
   */
  public removeBlock(blockId: string): FormBuilderSDK {
    this.blocks = this.blocks.filter((b) => b.id !== blockId);
    return this;
  }

  /**
   * Reorders blocks based on provided block IDs
   * Useful for drag-and-drop functionality
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
   * Creates a new form or updates existing one
   */
  public async save(): Promise<Form> {
    const formData = {
      title: this.form.title!,
      description: this.form.description,
      settings: this.form.settings,
      form_schema: this.blocks,
      status: this.form.status,
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
   * Returns JSON representation of the form
   * Useful for previewing before saving
   */
  public toJSON(): Partial<Form> {
    return {
      ...this.form,
      form_schema: this.blocks,
    };
  }
}
