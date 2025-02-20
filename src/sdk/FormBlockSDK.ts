
import type { Form } from "@/types/forms";

export type FormBlockType = "text" | "email" | "number" | "select" | "checkbox" | "radio";

export interface FormBlockConfig {
  type: FormBlockType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    customMessage?: string;
  };
}

export interface FormBlock extends FormBlockConfig {
  id: string;
  created_at?: string;
}

export class FormBlockSDK {
  private config: FormBlockConfig;

  constructor(config: FormBlockConfig) {
    this.config = this.validateConfig(config);
  }

  private validateConfig(config: FormBlockConfig): FormBlockConfig {
    if (!config.type || !config.label) {
      throw new Error("Block type and label are required");
    }

    if (["select", "radio"].includes(config.type) && (!config.options || config.options.length === 0)) {
      throw new Error(`Options are required for ${config.type} type blocks`);
    }

    return config;
  }

  public toJSON(): FormBlock {
    return {
      id: crypto.randomUUID(),
      ...this.config,
    };
  }
}
