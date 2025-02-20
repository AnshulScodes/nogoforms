
/**
 * Main SDK entry point
 * Exports all SDK components and provides usage examples
 */

export * from './FormBlockSDK';
export * from './FormBuilderSDK';
export * from './FormRunnerSDK';

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
