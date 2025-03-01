/**
 * Form Builder Types
 * 
 * This file contains type definitions used throughout the form builder components.
 */

import { FormBlock } from '@/sdk';

/**
 * Form element types that can be added to the form
 */
export type FormElementType = 
  | 'text' 
  | 'checkbox' 
  | 'select' 
  | 'date' 
  | 'file' 
  | 'textarea' 
  | 'image'
  | 'grid'
  | 'column'
  | 'row'
  | 'number';

/**
 * Extended form element with additional UI properties
 * Omits the type and height from FormBlock and redefines them
 */
export interface FormElement extends Omit<FormBlock, 'type' | 'height'> {
  type: FormElementType;
  width?: number | string;
  height?: number | string | "auto" | "small" | "medium" | "large";
  x?: number;
  y?: number;
  isResizable?: boolean;
  isSelected?: boolean;
  parentId?: string;
  children?: string[];
  gridColumns?: number;
  gridRows?: number;
  gridGap?: number;
}

/**
 * Form builder state
 */
export interface FormBuilderState {
  elements: Record<string, FormElement>;
  selectedElementId: string | null;
  draggedElementType: FormElementType | null;
  isDragging: boolean;
  isResizing: boolean;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  formTitle: string;
  formDescription: string;
}

/**
 * Form builder action types
 */
export enum FormBuilderActionType {
  ADD_ELEMENT = 'ADD_ELEMENT',
  UPDATE_ELEMENT = 'UPDATE_ELEMENT',
  DELETE_ELEMENT = 'DELETE_ELEMENT',
  SELECT_ELEMENT = 'SELECT_ELEMENT',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  SET_DRAGGED_ELEMENT_TYPE = 'SET_DRAGGED_ELEMENT_TYPE',
  SET_IS_DRAGGING = 'SET_IS_DRAGGING',
  SET_IS_RESIZING = 'SET_IS_RESIZING',
  TOGGLE_GRID_VISIBILITY = 'TOGGLE_GRID_VISIBILITY',
  TOGGLE_SNAP_TO_GRID = 'TOGGLE_SNAP_TO_GRID',
  SET_GRID_SIZE = 'SET_GRID_SIZE',
  UPDATE_FORM_TITLE = 'UPDATE_FORM_TITLE',
  UPDATE_FORM_DESCRIPTION = 'UPDATE_FORM_DESCRIPTION',
  IMPORT_FORM = 'IMPORT_FORM',
  RESET_FORM = 'RESET_FORM',
}

/**
 * Form builder actions
 */
export type FormBuilderAction =
  | { type: FormBuilderActionType.ADD_ELEMENT; payload: { element: FormElement } }
  | { type: FormBuilderActionType.UPDATE_ELEMENT; payload: { id: string; updates: Partial<FormElement> } }
  | { type: FormBuilderActionType.DELETE_ELEMENT; payload: { id: string } }
  | { type: FormBuilderActionType.SELECT_ELEMENT; payload: { id: string } }
  | { type: FormBuilderActionType.CLEAR_SELECTION }
  | { type: FormBuilderActionType.SET_DRAGGED_ELEMENT_TYPE; payload: { type: FormElementType | null } }
  | { type: FormBuilderActionType.SET_IS_DRAGGING; payload: { isDragging: boolean } }
  | { type: FormBuilderActionType.SET_IS_RESIZING; payload: { isResizing: boolean } }
  | { type: FormBuilderActionType.TOGGLE_GRID_VISIBILITY }
  | { type: FormBuilderActionType.TOGGLE_SNAP_TO_GRID }
  | { type: FormBuilderActionType.SET_GRID_SIZE; payload: { size: number } }
  | { type: FormBuilderActionType.UPDATE_FORM_TITLE; payload: { title: string } }
  | { type: FormBuilderActionType.UPDATE_FORM_DESCRIPTION; payload: { description: string } }
  | { type: FormBuilderActionType.IMPORT_FORM; payload: { elements: Record<string, FormElement>; title: string; description: string } }
  | { type: FormBuilderActionType.RESET_FORM }; 