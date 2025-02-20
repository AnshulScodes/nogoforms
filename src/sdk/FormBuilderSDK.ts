
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

  public addBlock(blockConfig: FormBlockConfig): FormBuilderSDK {
    const block = new FormBlockSDK(blockConfig);
    this.blocks.push(block.toJSON());
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
    this.form.form_schema = this.blocks;
    
    const { data, error } = await supabase
      .from("forms")
      .insert({
        title: this.form.title!,
        description: this.form.description,
        settings: this.form.settings,
        form_schema: this.form.form_schema,
        status: this.form.status,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public toJSON(): Partial<Form> {
    return {
      ...this.form,
      form_schema: this.blocks,
    };
  }
}
