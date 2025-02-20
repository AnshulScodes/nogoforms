
/**
 * FormBlockSDK: Handles individual form field creation and validation
 * This is the foundation for creating form elements
 */

import type { Form } from "@/types/forms";

/** Supported form field types */
export type FormBlockType = "text" | "email" | "number" | "select" | "checkbox" | "radio";

/** Configuration interface for form blocks */
export interface FormBlockConfig {
  type: FormBlockType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select, radio, checkbox fields
  validation?: {
    pattern?: string; // Regex pattern for validation
    min?: number; // Minimum value/length
    max?: number; // Maximum value/length
    customMessage?: string; // Custom error message
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

  /**
   * Validates the block configuration before creation
   * Ensures required fields are present and valid
   */
  private validateConfig(config: FormBlockConfig): FormBlockConfig {
    if (!config.type || !config.label) {
      throw new Error("Block type and label are required");
    }

    if (["select", "radio"].includes(config.type) && (!config.options || config.options.length === 0)) {
      throw new Error(`Options are required for ${config.type} type blocks`);
    }

    return config;
  }

  /**
   * Converts the block configuration to a JSON representation
   * Adds a unique ID for block identification
   */
  public toJSON(): FormBlock {
    return {
      id: crypto.randomUUID(),
      ...this.config,
    };
  }
}
