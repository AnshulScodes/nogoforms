# Form Builder Directory Structure

```
src/components/form-builder/
├── components/                  # Individual components
│   ├── ElementProperties.tsx    # Properties panel for editing elements
│   ├── FormCanvas.tsx           # Canvas where elements are placed
│   ├── FormElement.tsx          # Individual form element component
│   ├── FormElementTypes.tsx     # List of available element types
│   ├── FormPreview.tsx          # Form preview and submission component
│   ├── FormToolbar.tsx          # Toolbar with form actions
│   └── ResizeHandle.tsx         # Handle for resizing elements
├── reducers/                    # State management
│   └── formBuilderReducer.ts    # Reducer for form builder state
├── styles/                      # Styles
│   └── grid.css                 # Grid background styles
├── FormBuilder.tsx              # Main form builder component
├── index.ts                     # Exports all components
├── README.md                    # Documentation
├── STRUCTURE.md                 # This file
└── types.ts                     # TypeScript type definitions
```

## Component Relationships

- **FormBuilder** is the main component that brings everything together
  - Uses **FormToolbar** for the top toolbar
  - Uses **FormElementTypes** for the left sidebar
  - Uses **FormCanvas** for the main canvas area
  - Uses **ElementProperties** for the right sidebar
  - Uses **formBuilderReducer** for state management

- **FormCanvas** renders the form elements
  - Maps over elements and renders **FormElement** components
  - Handles drag and drop functionality

- **FormElement** renders individual form elements
  - Uses **ResizeHandle** for resizing functionality
  - Renders different UI based on element type

- **FormPreview** is a standalone component for previewing forms
  - Can be used independently of the form builder
  - Handles form validation and submission

## State Management

The form builder uses React's useReducer hook with the **formBuilderReducer** to manage state. The state includes:

- Form elements
- Selected element
- Drag and drop state
- Grid settings
- Form metadata (title, description)

## Type Definitions

The **types.ts** file contains TypeScript type definitions for:

- FormElementType: Types of form elements
- FormElement: Properties of a form element
- FormBuilderState: State of the form builder
- FormBuilderAction: Actions that can be dispatched to the reducer 