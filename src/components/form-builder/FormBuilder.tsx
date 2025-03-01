import React, { useReducer, useCallback } from 'react';
import { FormToolbar } from './components/FormToolbar';
import { FormElementTypes } from './components/FormElementTypes';
import { FormCanvas } from './components/FormCanvas';
import { ElementProperties } from './components/ElementProperties';
import { formBuilderReducer, initialFormBuilderState, createFormElement } from './reducers/formBuilderReducer';
import { FormBuilderActionType, FormElementType } from './types';
import { useToast } from '@/components/ui/use-toast';

/**
 * FormBuilder Component
 * 
 * The main form builder component that combines all the sub-components.
 * Manages the state of the form builder and provides callbacks for user interactions.
 */
export function FormBuilder() {
  const [state, dispatch] = useReducer(formBuilderReducer, initialFormBuilderState);
  const { toast } = useToast();

  // Get the currently selected element
  const selectedElement = state.selectedElementId ? state.elements[state.selectedElementId] : null;

  // Callbacks for element actions
  const handleAddElement = useCallback((type: FormElementType) => {
    const element = createFormElement(type);
    dispatch({
      type: FormBuilderActionType.ADD_ELEMENT,
      payload: { element },
    });
  }, []);

  const handleUpdateElement = useCallback((id: string, updates: any) => {
    dispatch({
      type: FormBuilderActionType.UPDATE_ELEMENT,
      payload: { id, updates },
    });
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    dispatch({
      type: FormBuilderActionType.DELETE_ELEMENT,
      payload: { id },
    });
  }, []);

  const handleSelectElement = useCallback((id: string) => {
    dispatch({
      type: FormBuilderActionType.SELECT_ELEMENT,
      payload: { id },
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    dispatch({
      type: FormBuilderActionType.CLEAR_SELECTION,
    });
  }, []);

  const handleDropElement = useCallback((type: FormElementType, x: number, y: number) => {
    const element = createFormElement(type, x, y);
    dispatch({
      type: FormBuilderActionType.ADD_ELEMENT,
      payload: { element },
    });
  }, []);

  // Callbacks for toolbar actions
  const handleTitleChange = useCallback((title: string) => {
    dispatch({
      type: FormBuilderActionType.UPDATE_FORM_TITLE,
      payload: { title },
    });
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    dispatch({
      type: FormBuilderActionType.UPDATE_FORM_DESCRIPTION,
      payload: { description },
    });
  }, []);

  const handleSave = useCallback(() => {
    // Save form logic here
    toast({
      title: "Form Saved",
      description: "Your form has been saved successfully.",
    });
  }, [toast]);

  const handleImport = useCallback(() => {
    // Import form logic here
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const formData = JSON.parse(event.target?.result as string);
            dispatch({
              type: FormBuilderActionType.IMPORT_FORM,
              payload: {
                elements: formData.elements || {},
                title: formData.title || 'Imported Form',
                description: formData.description || '',
              },
            });
            toast({
              title: "Form Imported",
              description: "Your form has been imported successfully.",
            });
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Failed to import form. Please check the file format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  }, [toast]);

  const handleExport = useCallback(() => {
    // Export form logic here
    const formData = {
      title: state.formTitle,
      description: state.formDescription,
      elements: state.elements,
    };
    
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.formTitle.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Form Exported",
      description: "Your form has been exported successfully.",
    });
  }, [state.formTitle, state.formDescription, state.elements, toast]);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset the form? All changes will be lost.')) {
      dispatch({
        type: FormBuilderActionType.RESET_FORM,
      });
      toast({
        title: "Form Reset",
        description: "Your form has been reset to default.",
      });
    }
  }, [toast]);

  const handleToggleGrid = useCallback(() => {
    dispatch({
      type: FormBuilderActionType.TOGGLE_GRID_VISIBILITY,
    });
  }, []);

  const handleToggleSnapToGrid = useCallback(() => {
    dispatch({
      type: FormBuilderActionType.TOGGLE_SNAP_TO_GRID,
    });
  }, []);

  const handleGridSizeChange = useCallback((size: number) => {
    dispatch({
      type: FormBuilderActionType.SET_GRID_SIZE,
      payload: { size },
    });
  }, []);

  const handlePreview = useCallback(() => {
    // Preview form logic here
    toast({
      title: "Form Preview",
      description: "Opening form preview...",
    });
    // Could open a modal or navigate to a preview page
  }, [toast]);

  return (
    <div className="flex flex-col h-screen">
      <FormToolbar
        title={state.formTitle}
        description={state.formDescription}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        onSave={handleSave}
        onImport={handleImport}
        onExport={handleExport}
        onReset={handleReset}
        gridVisible={state.gridVisible}
        onToggleGrid={handleToggleGrid}
        snapToGrid={state.snapToGrid}
        onToggleSnapToGrid={handleToggleSnapToGrid}
        gridSize={state.gridSize}
        onGridSizeChange={handleGridSizeChange}
        onPreview={handlePreview}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r p-4 overflow-y-auto">
          <h3 className="text-lg font-medium mb-4">Form Elements</h3>
          <FormElementTypes onAddElement={handleAddElement} />
        </div>
        
        <FormCanvas
          elements={state.elements}
          selectedElementId={state.selectedElementId}
          onSelectElement={handleSelectElement}
          onClearSelection={handleClearSelection}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDropElement={handleDropElement}
          gridVisible={state.gridVisible}
          gridSize={state.gridSize}
        />
        
        <div className="w-80 overflow-y-auto">
          <ElementProperties
            element={selectedElement}
            onUpdate={handleUpdateElement}
            onDelete={handleDeleteElement}
          />
        </div>
      </div>
    </div>
  );
}
