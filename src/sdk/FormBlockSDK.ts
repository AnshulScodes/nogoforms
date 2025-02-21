
/**
 * FormBlockSDK: Handles individual form field creation and validation
 * This is the foundation for creating form elements
 */

import type { Form } from "@/types/forms";

/** Supported form field types */
export type FormBlockType = "text" | "email" | "number" | "select" | "checkbox" | "radio";

/**
 * Configuration interface for form blocks
 * @property type - The type of form field
 * @property label - Display label for the field
 * @property placeholder - Optional placeholder text
 * @property required - Whether the field is required
 * @property options - Array of options for select/radio/checkbox fields
 * @property validation - Optional validation rules
 */
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

/**
 * Represents a form block with additional runtime properties
 * Extends FormBlockConfig to include system-generated fields
 */
export interface FormBlock extends FormBlockConfig {
  id: string;
  created_at?: string;
}

/**
 * FormBlockSDK: Class for managing individual form fields
 * 
 * This class handles:
 * - Field creation and configuration
 * - Validation rules
 * - Field type-specific behavior
 * 
 * Usage example:
 * ```typescript
 * const block = new FormBlockSDK({
 *   type: "email",
 *   label: "Email Address",
 *   required: true,
 *   validation: {
 *     pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
 *   }
 * });
 * ```
 */
export class FormBlockSDK {
  /** Stores the block configuration */
  private config: FormBlockConfig;

  /**
   * Creates a new form block instance
   * @param config - The configuration for this block
   * @throws Error if configuration is invalid
   */
  constructor(config: FormBlockConfig) {
    this.config = this.validateConfig(config);
  }

  /**
   * Validates the block configuration before creation
   * Ensures required fields are present and valid
   * @param config - The configuration to validate
   * @returns Validated configuration
   * @throws Error if validation fails
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
   * Converts the block to a JSON representation
   * Adds a unique ID for block identification
   * @returns FormBlock object with all properties
   */
  public toJSON(): FormBlock {
    return {
      id: crypto.randomUUID(),
      ...this.config,
    };
  }
}
