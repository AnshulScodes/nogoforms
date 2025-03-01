/**
 * Form Builder Module
 * 
 * This module provides a drag-and-drop form builder with the following features:
 * - Add, edit, and delete form elements
 * - Resize and position elements
 * - Grid layout system
 * - Property editing panel
 * - Import/export functionality
 * 
 * The form builder is composed of several components:
 * - FormBuilder: The main component that brings everything together
 * - FormCanvas: The canvas where elements are placed
 * - FormElement: Individual form elements
 * - ElementProperties: Panel for editing element properties
 * - FormToolbar: Toolbar with form actions and settings
 * - FormElementTypes: List of available element types
 * - FormPreview: Component for previewing and submitting forms
 */

// Import CSS
import './styles/grid.css';

// Export main component
export { FormBuilder } from './FormBuilder';

// Export sub-components
export { FormCanvas } from './components/FormCanvas';
export { FormElement } from './components/FormElement';
export { ElementProperties } from './components/ElementProperties';
export { FormToolbar } from './components/FormToolbar';
export { FormElementTypes } from './components/FormElementTypes';
export { ResizeHandle } from './components/ResizeHandle';
export { FormPreview } from './components/FormPreview';

// Export types
export * from './types';

// Export reducer and utilities
export { 
  formBuilderReducer, 
  initialFormBuilderState, 
  createFormElement 
} from './reducers/formBuilderReducer'; 