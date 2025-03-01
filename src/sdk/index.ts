/**
 * Main SDK entry point
 * Exports all SDK components and provides usage examples
 */

export * from './FormBlockSDK';
export * from './FormBuilderSDK';
export * from './FormRunnerSDK';

export type FormBlock = {
  id: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "time" | "tel" | "url" | "password" | "file" | "range" | "color" | "heading" | "paragraph" | "hidden";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  helpText?: string;
  defaultValue?: string | number | boolean;
  imageSrc?: string;
  imagePosition?: "left" | "right";
  imageSize?: "small" | "medium" | "large";
  // Grid layout properties
  columnWidth?: string; // "1", "1/2", "1/3", "2/3", "1/4", "3/4"
  rowIndex?: number;
  colIndex?: number; // New property for grid layout
  height?: "auto" | "small" | "medium" | "large";
  gridSpan?: number; // How many columns this element spans
  created_at?: string;
};

/**
 * Example usage of the Form Builder SDK:
 * 
 * 1. Create a new form
 * const builder = new FormBuilderSDK({
 *   title: "Contact Form",
 *   description: "Get in touch with us",
 * });
 * 
 * 2. Add form fields
 * builder
 *   .addBlock({
 *     type: "text",
 *     label: "Name",
 *     required: true,
 *   })
 *   .addBlock({
 *     type: "email",
 *     label: "Email",
 *     required: true,
 *     validation: {
 *       pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
 *     },
 *   });
 * 
 * 3. Save the form
 * const form = await builder.save();
 * 
 * 4. Create a form runner for submissions
 * const runner = new FormRunnerSDK(form);
 * 
 * 5. Handle form responses
 * runner
 *   .setResponse("block1", "John Doe")
 *   .setResponse("block2", "john@example.com");
 * 
 * 6. Validate and submit
 * if (runner.validate()) {
 *   await runner.submit();
 * }
 */
