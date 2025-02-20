
export interface Form {
  id: string;
  title: string;
  description: string | null;
  form_schema: any[];
  settings: Record<string, any> | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  metadata: Record<string, any> | null;
  created_at: string | null;
}

export interface FormAnalytics {
  id: string;
  form_id: string;
  event_type: string;
  event_data: Record<string, any> | null;
  created_at: string | null;
}
