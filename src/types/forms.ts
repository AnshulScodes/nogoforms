
/**
 * Core type definitions for the form builder system
 */

import type { FormBlock } from "@/sdk/FormBlockSDK";

export interface Form {
  id: string;
  title: string;
  description: string | null;
  /** 
   * Array of form blocks that make up the form structure
   * Each block represents a form field with its configuration
   */
  form_schema: FormBlock[]; // Now properly typed as FormBlock array
  /** Additional form settings like theme, behavior, etc. */
  settings: Record<string, any> | null;
  /** Current form status: 'draft', 'published', 'archived' */
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  /** Stores the actual form responses */
  data: Record<string, any>;
  /** Additional submission metadata like device info, timestamp */
  metadata: Record<string, any> | null;
  created_at: string | null;
}

export interface FormAnalytics {
  id: string;
  form_id: string;
  /** Type of analytics event: 'view', 'start', 'submit', etc. */
  event_type: string;
  /** Additional data associated with the event */
  event_data: Record<string, any> | null;
  created_at: string | null;
}
