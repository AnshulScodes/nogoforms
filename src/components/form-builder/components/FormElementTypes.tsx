import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  TextIcon, 
  CheckSquare, 
  ListOrdered, 
  Calendar, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  Grid2X2,
  Columns,
  Rows
} from 'lucide-react';
import { FormElementType } from '../types';

/**
 * FormElementTypes Component
 * 
 * Displays a list of available form element types that can be added to the form.
 * Each element type is represented by a button with an icon and label.
 * 
 * @param onAddElement - Callback function when an element type is selected
 */
interface FormElementTypesProps {
  onAddElement: (type: FormElementType) => void;
}

export const FormElementTypes: React.FC<FormElementTypesProps> = ({ onAddElement }) => {
  const elementTypes = [
    { type: 'text' as FormElementType, icon: <TextIcon className="h-4 w-4 mr-2" />, label: 'Text' },
    { type: 'number' as FormElementType, icon: <TextIcon className="h-4 w-4 mr-2" />, label: 'Number' },
    { type: 'checkbox' as FormElementType, icon: <CheckSquare className="h-4 w-4 mr-2" />, label: 'Checkbox' },
    { type: 'select' as FormElementType, icon: <ListOrdered className="h-4 w-4 mr-2" />, label: 'Select' },
    { type: 'date' as FormElementType, icon: <Calendar className="h-4 w-4 mr-2" />, label: 'Date' },
    { type: 'file' as FormElementType, icon: <Upload className="h-4 w-4 mr-2" />, label: 'File Upload' },
    { type: 'textarea' as FormElementType, icon: <FileText className="h-4 w-4 mr-2" />, label: 'Text Area' },
    { type: 'image' as FormElementType, icon: <ImageIcon className="h-4 w-4 mr-2" />, label: 'Image' },
    { type: 'grid' as FormElementType, icon: <Grid2X2 className="h-4 w-4 mr-2" />, label: 'Grid' },
    { type: 'column' as FormElementType, icon: <Columns className="h-4 w-4 mr-2" />, label: 'Column' },
    { type: 'row' as FormElementType, icon: <Rows className="h-4 w-4 mr-2" />, label: 'Row' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {elementTypes.map((element) => (
        <Button
          key={element.type}
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={() => onAddElement(element.type)}
        >
          {element.icon}
          {element.label}
        </Button>
      ))}
    </div>
  );
}; 