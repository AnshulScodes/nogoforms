
import type { Form, FormBlockJson } from "@/types/forms";
import type { Json } from "@/types/database";
import { FormBlockSDK, type FormBlock, type FormBlockConfig } from "./FormBlockSDK";
import { supabase } from "@/integrations/supabase/client";

export interface FormBuilderConfig {
  title: string;
  description?: string;
  settings?: Record<string, any>;
  id?: string; // Add id to config for updates
}

export class FormBuilderSDK {
  private form: Partial<Form>;
  private blocks: FormBlock[] = [];
  private id?: string;

  constructor(config: FormBuilderConfig) {
    this.id = config.id;
    this.form = {
      title: config.title,
      description: config.description,
      settings: config.settings || {},
      form_schema: [],
      status: "draft",
    };
  }

  public addBlock(blockConfig: FormBlockConfig): FormBuilderSDK {
    const block = new FormBlockSDK(blockConfig);
    this.blocks.push(block.toJSON() as FormBlock);
    return this;
  }

  public updateBlock(blockId: string, updates: Partial<FormBlockConfig>): FormBuilderSDK {
    const blockIndex = this.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) throw new Error("Block not found");

    this.blocks[blockIndex] = {
      ...this.blocks[blockIndex],
      ...updates,
    };
    return this;
  }

  public removeBlock(blockId: string): FormBuilderSDK {
    this.blocks = this.blocks.filter((b) => b.id !== blockId);
    return this;
  }

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

  public async save(): Promise<Form> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

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
      owner_id: user.id,
    };
    
    let response;
    
    if (this.id) {
      // Update existing form
      const { data, error } = await supabase
        .from("forms")
        .update(formData)
        .eq('id', this.id)
        .select()
        .single();

      if (error) throw error;
      response = data;
    } else {
      // Create new form
      const { data, error } = await supabase
        .from("forms")
        .insert(formData)
        .select()
        .single();

      if (error) throw error;
      response = data;
    }

    // Convert the form_schema back to FormBlock[] type
    return {
      ...response,
      form_schema: (response.form_schema as FormBlockJson[]).map(block => ({
        ...block,
        type: block.type as FormBlock["type"],
      })) as FormBlock[]
    };
  }

  public toJSON(): Partial<Form> {
    return {
      ...this.form,
      form_schema: this.blocks,
    };
  }
}
