import { FormBuilderState, FormBuilderAction, FormBuilderActionType, FormElement } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initial state for the form builder
 */
export const initialFormBuilderState: FormBuilderState = {
  elements: {},
  selectedElementId: null,
  draggedElementType: null,
  isDragging: false,
  isResizing: false,
  gridVisible: true,
  snapToGrid: true,
  gridSize: 16,
  formTitle: 'Untitled Form',
  formDescription: 'Form Description',
};

/**
 * Form Builder Reducer
 * 
 * Manages state for the form builder, including:
 * - Adding, updating, and deleting elements
 * - Selecting elements
 * - Drag and drop operations
 * - Grid and layout settings
 * - Form metadata
 * 
 * @param state - Current form builder state
 * @param action - Action to perform
 * @returns Updated form builder state
 */
export function formBuilderReducer(
  state: FormBuilderState,
  action: FormBuilderAction
): FormBuilderState {
  switch (action.type) {
    case FormBuilderActionType.ADD_ELEMENT: {
      const { element } = action.payload;
      const id = element.id || uuidv4();
      
      return {
        ...state,
        elements: {
          ...state.elements,
          [id]: {
            ...element,
            id,
          },
        },
        selectedElementId: id,
      };
    }
    
    case FormBuilderActionType.UPDATE_ELEMENT: {
      const { id, updates } = action.payload;
      const element = state.elements[id];
      
      if (!element) {
        return state;
      }
      
      return {
        ...state,
        elements: {
          ...state.elements,
          [id]: {
            ...element,
            ...updates,
          },
        },
      };
    }
    
    case FormBuilderActionType.DELETE_ELEMENT: {
      const { id } = action.payload;
      const { [id]: _, ...remainingElements } = state.elements;
      
      // Also delete any child elements if this is a container
      const element = state.elements[id];
      if (element?.children?.length) {
        element.children.forEach(childId => {
          if (remainingElements[childId]) {
            delete remainingElements[childId];
          }
        });
      }
      
      return {
        ...state,
        elements: remainingElements,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      };
    }
    
    case FormBuilderActionType.SELECT_ELEMENT: {
      return {
        ...state,
        selectedElementId: action.payload.id,
      };
    }
    
    case FormBuilderActionType.CLEAR_SELECTION: {
      return {
        ...state,
        selectedElementId: null,
      };
    }
    
    case FormBuilderActionType.SET_DRAGGED_ELEMENT_TYPE: {
      return {
        ...state,
        draggedElementType: action.payload.type,
      };
    }
    
    case FormBuilderActionType.SET_IS_DRAGGING: {
      return {
        ...state,
        isDragging: action.payload.isDragging,
      };
    }
    
    case FormBuilderActionType.SET_IS_RESIZING: {
      return {
        ...state,
        isResizing: action.payload.isResizing,
      };
    }
    
    case FormBuilderActionType.TOGGLE_GRID_VISIBILITY: {
      return {
        ...state,
        gridVisible: !state.gridVisible,
      };
    }
    
    case FormBuilderActionType.TOGGLE_SNAP_TO_GRID: {
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };
    }
    
    case FormBuilderActionType.SET_GRID_SIZE: {
      return {
        ...state,
        gridSize: action.payload.size,
      };
    }
    
    case FormBuilderActionType.UPDATE_FORM_TITLE: {
      return {
        ...state,
        formTitle: action.payload.title,
      };
    }
    
    case FormBuilderActionType.UPDATE_FORM_DESCRIPTION: {
      return {
        ...state,
        formDescription: action.payload.description,
      };
    }
    
    case FormBuilderActionType.IMPORT_FORM: {
      return {
        ...state,
        elements: action.payload.elements,
        formTitle: action.payload.title,
        formDescription: action.payload.description,
        selectedElementId: null,
      };
    }
    
    case FormBuilderActionType.RESET_FORM: {
      return {
        ...initialFormBuilderState,
        gridVisible: state.gridVisible,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
      };
    }
    
    default:
      return state;
  }
}

/**
 * Helper function to create a new form element
 * 
 * @param type - Type of element to create
 * @param x - X position
 * @param y - Y position
 * @returns New form element
 */
export function createFormElement(
  type: string,
  x?: number,
  y?: number
): FormElement {
  const id = uuidv4();
  const baseElement: FormElement = {
    id,
    type: type as any,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Label`,
    isResizable: true,
    isSelected: false,
  };
  
  if (x !== undefined) {
    baseElement.x = x;
  }
  
  if (y !== undefined) {
    baseElement.y = y;
  }
  
  // Add type-specific properties
  switch (type) {
    case 'text':
      return {
        ...baseElement,
        placeholder: 'Enter text...',
        required: false,
      };
    
    case 'number':
      return {
        ...baseElement,
        placeholder: 'Enter number...',
        required: false,
        validation: {
          min: 0,
          max: 100
        }
      };
    
    case 'textarea':
      return {
        ...baseElement,
        placeholder: 'Enter text...',
        required: false,
        height: 150,
      };
    
    case 'checkbox':
      return {
        ...baseElement,
        options: ['Option 1', 'Option 2', 'Option 3'],
        required: false,
      };
    
    case 'select':
      return {
        ...baseElement,
        options: ['Option 1', 'Option 2', 'Option 3'],
        placeholder: 'Select an option',
        required: false,
      };
    
    case 'date':
      return {
        ...baseElement,
        required: false,
      };
    
    case 'file':
      return {
        ...baseElement,
        required: false,
        helpText: 'Upload files up to 10MB',
      };
    
    case 'image':
      return {
        ...baseElement,
        imageSrc: 'https://via.placeholder.com/400x200',
        imagePosition: 'left',
        imageSize: 'medium',
      };
    
    case 'grid':
      return {
        ...baseElement,
        gridColumns: 2,
        gridRows: 2,
        gridGap: 8,
        children: [],
      };
    
    case 'column':
      return {
        ...baseElement,
        columnWidth: '1/2',
        children: [],
      };
    
    case 'row':
      return {
        ...baseElement,
        children: [],
      };
    
    default:
      return baseElement;
  }
} 