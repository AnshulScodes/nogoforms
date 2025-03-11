export type FormBlockType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'date'
  | 'time'
  | 'email'
  | 'phone'
  | 'url'
  | 'file'
  | 'image'
  | 'heading'
  | 'paragraph'
  | 'divider';

export interface FormBlockOption {
  label: string;
  value: string;
}

export interface FormBlockConfig {
  id: string;
  type: FormBlockType;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  description?: string;
  
  // Validation properties
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  
  // Options for select, checkbox, radio
  options?: FormBlockOption[];
  
  // Image properties
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageFullField?: boolean;
  
  // Heading properties
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4';
}

export interface FormConfig {
  title: string;
  description?: string;
  fields: FormBlockConfig[];
}

export const createDefaultField = (type: FormBlockType): FormBlockConfig => {
  const id = `field-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const baseField: FormBlockConfig = {
    id,
    type,
    label: getDefaultLabel(type),
  };
  
  // Add type-specific default properties
  switch (type) {
    case 'checkbox':
    case 'radio':
    case 'select':
      return {
        ...baseField,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      };
    case 'image':
      return {
        ...baseField,
        imageUrl: 'https://via.placeholder.com/400x200?text=Example+Image',
        imageWidth: 400,
        imageHeight: 200,
        imageFullField: false,
      };
    case 'heading':
      return {
        ...baseField,
        headingLevel: 'h2',
      };
    default:
      return baseField;
  }
};

const getDefaultLabel = (type: FormBlockType): string => {
  switch (type) {
    case 'text':
      return 'Text Field';
    case 'textarea':
      return 'Text Area';
    case 'number':
      return 'Number';
    case 'checkbox':
      return 'Checkbox Group';
    case 'radio':
      return 'Radio Group';
    case 'select':
      return 'Dropdown';
    case 'date':
      return 'Date';
    case 'time':
      return 'Time';
    case 'email':
      return 'Email';
    case 'phone':
      return 'Phone';
    case 'url':
      return 'URL';
    case 'file':
      return 'File Upload';
    case 'image':
      return 'Image';
    case 'heading':
      return 'Section Heading';
    case 'paragraph':
      return 'This is a paragraph of text. You can use this to provide instructions or additional information.';
    case 'divider':
      return 'Divider';
    default:
      return 'New Field';
  }
}; 