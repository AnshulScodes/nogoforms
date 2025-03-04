
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/types/database";
import type { FormBlockJson } from "@/types/forms";
import { FormBlock } from "@/sdk/FormBlockSDK";

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  form_schema: FormBlock[];
  settings?: {
    theme?: string;
    submitButtonText?: string;
    showLabels?: boolean;
    successMessage?: string;
    redirectUrl?: string;
    captcha?: boolean;
    [key: string]: any;
  };
  status?: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
}

const convertFormSchema = (form: any): FormData => {
  let parsedForm = { ...form };
  
  if (typeof form.form_schema === 'string') {
    try {
      parsedForm.form_schema = JSON.parse(form.form_schema);
    } catch (e) {
      console.error('Error parsing form schema JSON:', e);
      parsedForm.form_schema = [];
    }
  } else if (typeof form.form_schema === 'object' && !Array.isArray(form.form_schema)) {
    parsedForm.form_schema = Object.values(form.form_schema || {});
  }
  
  if (typeof form.settings === 'string') {
    try {
      parsedForm.settings = JSON.parse(form.settings);
    } catch (e) {
      console.error('Error parsing settings JSON:', e);
      parsedForm.settings = {};
    }
  }
  
  return parsedForm as FormData;
};

export const getForm = async (formId: string): Promise<FormData> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();
    
  if (error) throw error;
  
  return convertFormSchema(data);
};

// Alias for compatibility with existing code
export const getFormById = getForm;

export const isUserFormAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    return !!data && !error;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

export const getFormWithPermissionCheck = async (formId: string, userId: string): Promise<FormData> => {
  const isAdmin = await isUserFormAdmin(userId);
  
  let query = supabase
    .from('forms')
    .select('*')
    .eq('id', formId);
    
  if (!isAdmin) {
    query = query.eq('owner_id', userId);
  }
  
  const { data, error } = await query.single();
  
  if (error) throw error;
  
  return convertFormSchema(data);
};

export const createForm = async (form: FormData, userId: string): Promise<FormData> => {
  // Convert FormBlock[] to Json for Supabase
  const formSchemaJson = JSON.stringify(form.form_schema) as unknown as Json;
  const settingsJson = form.settings ? JSON.stringify(form.settings) as unknown as Json : null;
  
  const { data, error } = await supabase
    .from('forms')
    .insert({
      title: form.title,
      description: form.description || '',
      form_schema: formSchemaJson,
      settings: settingsJson,
      status: form.status || 'draft',
      owner_id: userId,
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return convertFormSchema(data);
};

export const updateForm = async (formId: string, form: Partial<FormData>, userId: string): Promise<FormData> => {
  const isAdmin = await isUserFormAdmin(userId);
  
  // Convert FormBlock[] to Json for Supabase if it exists
  const formSchemaJson = form.form_schema 
    ? JSON.stringify(form.form_schema) as unknown as Json 
    : undefined;
  
  const settingsJson = form.settings 
    ? JSON.stringify(form.settings) as unknown as Json 
    : undefined;
  
  let query = supabase
    .from('forms')
    .update({
      title: form.title,
      description: form.description,
      form_schema: formSchemaJson,
      settings: settingsJson,
      status: form.status,
    });
    
  if (!isAdmin) {
    query = query.eq('owner_id', userId);
  }
  
  const { data, error } = await query
    .eq('id', formId)
    .select()
    .single();
    
  if (error) throw error;
  
  return convertFormSchema(data);
};

export const getUserForms = async (userId: string): Promise<FormData[]> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map(convertFormSchema);
};

export const getAllFormsByAdmin = async (userId: string): Promise<FormData[]> => {
  const isAdmin = await isUserFormAdmin(userId);
  
  if (!isAdmin) {
    return getUserForms(userId);
  }
  
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('updated_at', { ascending: false });
    
  if (error) throw error;
  
  return (data || []).map(convertFormSchema);
};

export const submitFormResponse = async (
  formId: string,
  data: Record<string, any>,
  metadata: Record<string, any> = {}
): Promise<void> => {
  const { error } = await supabase
    .from('form_submissions')
    .insert({
      form_id: formId,
      data,
      metadata
    });

  if (error) {
    console.error("Error submitting form response:", error);
    throw error;
  }
};

export const getFormResponses = async (formId: string): Promise<any[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error: formResponsesError } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (formResponsesError) {
    console.error("Error fetching form responses:", formResponsesError);
    throw formResponsesError;
  }

  return data || [];
};

export const deleteForm = async (formId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', formId)
    .single();

  if (formError) {
    console.error("Error checking form ownership:", formError);
    throw formError;
  }

  if (formData.owner_id !== user.id) {
    const { data: isAdmin } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (!isAdmin) {
      throw new Error("You don't have permission to delete this form");
    }
  }

  const { error: submissionsError } = await supabase
    .from('form_submissions')
    .delete()
    .eq('form_id', formId);

  if (submissionsError) {
    console.error("Error deleting form submissions:", submissionsError);
    throw submissionsError;
  }

  const { error: deleteError } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId);

  if (deleteError) {
    console.error("Error deleting form:", deleteError);
    throw deleteError;
  }
};
