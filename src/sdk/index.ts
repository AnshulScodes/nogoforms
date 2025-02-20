
export * from './FormBlockSDK';
export * from './FormBuilderSDK';
export * from './FormRunnerSDK';

// Example usage:
/*
const builder = new FormBuilderSDK({
  title: "Contact Form",
  description: "Get in touch with us",
});

builder
  .addBlock({
    type: "text",
    label: "Name",
    required: true,
  })
  .addBlock({
    type: "email",
    label: "Email",
    required: true,
    validation: {
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    },
  });

const form = await builder.save();

const runner = new FormRunnerSDK(form);
runner
  .setResponse("block1", "John Doe")
  .setResponse("block2", "john@example.com");

if (runner.validate()) {
  await runner.submit();
}
*/
