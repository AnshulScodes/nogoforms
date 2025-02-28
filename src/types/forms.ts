
import type { Json } from "@/types/database";
import type { FormBlock } from "@/sdk/FormBlockSDK";

export interface Form {
  id: string;
  title: string;
  description: string | null;
  form_schema: FormBlock[];
  settings: Json | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Json;
  metadata: Json | null;
  created_at: string | null;
}

export interface FormAnalytics {
  id: string;
  form_id: string;
  event_type: string;
  event_data: Json | null;
  created_at: string | null;
}

// Helper type for converting between FormBlock and Json
export type FormBlockJson = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  imageSrc?: string;
  imagePosition?: "left" | "right";
  imageSize?: "small" | "medium" | "large";
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    customMessage?: string;
  };
  helpText?: string;
  defaultValue?: string | number | boolean;
};
