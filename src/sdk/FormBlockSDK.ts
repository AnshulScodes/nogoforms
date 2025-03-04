
import type { Json } from "@/types/database";
import type { FormBlockJson } from "@/types/forms";

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

export interface FormBlockConfig {
  type: FormBlockType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  imageSrc?: string;
  imagePosition?: "left" | "right";
  imageSize?: "small" | "medium" | "large";
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

  public toJSON(): FormBlockJson {
    return {
      id: crypto.randomUUID(),
      ...this.config,
    };
  }
}
