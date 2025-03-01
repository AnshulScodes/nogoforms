# Form Builder

A powerful drag-and-drop form builder component for React applications.

## Features

- **Drag and Drop Interface**: Easily add and arrange form elements
- **Resizable Elements**: Resize elements with a visual handle
- **Grid Layout System**: Organize elements in a grid layout
- **Property Editing**: Customize element properties in a dedicated panel
- **Import/Export**: Save and load form configurations
- **Form Preview**: Preview and test the form before publishing
- **Validation**: Built-in validation for form fields
- **Responsive Design**: Works on desktop and mobile devices

## Components

The form builder is composed of several components:

- **FormBuilder**: The main component that brings everything together
- **FormCanvas**: The canvas where elements are placed
- **FormElement**: Individual form elements
- **ElementProperties**: Panel for editing element properties
- **FormToolbar**: Toolbar with form actions and settings
- **FormElementTypes**: List of available element types
- **FormPreview**: Component for previewing and submitting forms
- **ResizeHandle**: Handle for resizing elements

## Usage

```tsx
import { FormBuilder } from '@/components/form-builder';

export default function FormBuilderPage() {
  return (
    <div className="h-screen">
      <FormBuilder />
    </div>
  );
}
```

## Form Preview

You can use the FormPreview component separately to display and submit forms:

```tsx
import { FormPreview } from '@/components/form-builder';
import { useState } from 'react';

export default function FormPreviewPage() {
  const [formData, setFormData] = useState({
    elements: {
      // Your form elements here
    },
    title: 'Contact Form',
    description: 'Please fill out this form to contact us.',
  });

  const handleSubmit = async (values) => {
    console.log('Form submitted:', values);
    // Submit the form data to your API
  };

  return (
    <div className="p-4">
      <FormPreview
        elements={formData.elements}
        title={formData.title}
        description={formData.description}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

## Element Types

The form builder supports the following element types:

- **Text**: Single-line text input
- **Textarea**: Multi-line text input
- **Checkbox**: Multiple-choice checkboxes
- **Select**: Dropdown select menu
- **Date**: Date picker
- **File**: File upload
- **Image**: Image display
- **Grid**: Grid container for organizing elements
- **Column**: Column container for layout
- **Row**: Row container for layout

## Customization

You can customize the appearance and behavior of the form builder by modifying the CSS variables in `styles/grid.css` and the component props.

## Dependencies

- React
- Framer Motion
- UUID
- date-fns
- Lucide React icons
- Shadcn UI components

## License

MIT 