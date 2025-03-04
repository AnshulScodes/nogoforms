
import { supabase } from "@/integrations/supabase/client";
import { FormBlock, FormBlockSDK } from "@/sdk";

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  form_schema: FormBlock[];
  owner_id?: string;
  settings?: {
    success_message?: string;
    redirect_url?: string;
    email_notifications?: string[];
    theme?: {
      primary_color?: string;
      font_family?: string;
    };
  };
  status?: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export const createForm = async (form: FormData): Promise<FormData> => {
  // Get current user id to set as owner
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Ensure form has an owner_id
  form.owner_id = user.id;
  
  const { data, error } = await supabase
    .from('forms')
    .insert(form)
    .select()
    .single();

  if (error) {
    console.error("Error creating form:", error);
    throw error;
  }

  return data;
};

export const updateForm = async (form: FormData): Promise<FormData> => {
  if (!form.id) {
    throw new Error("Form ID is required for updates");
  }

  // Get current user id to verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // First verify that the user owns this form
  const { data: existingForm, error: checkError } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', form.id)
    .single();

  if (checkError) {
    console.error("Error checking form ownership:", checkError);
    throw checkError;
  }

  // If user doesn't own this form and isn't admin, throw error
  if (existingForm.owner_id !== user.id) {
    // Check if user is admin
    const { data: isAdmin } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (!isAdmin) {
      throw new Error("You don't have permission to update this form");
    }
  }

  const { data, error } = await supabase
    .from('forms')
    .update(form)
    .eq('id', form.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating form:", error);
    throw error;
  }

  return data;
};

export const getFormById = async (id: string): Promise<FormData> => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching form:", error);
    throw error;
  }

  return data;
};

export const getUserForms = async (): Promise<FormData[]> => {
  // Get current user id
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching user forms:", error);
    throw error;
  }

  return data || [];
};

export const getAllFormsForAdmin = async (): Promise<FormData[]> => {
  // Get current user id
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Check if user is admin
  const { data: isAdmin } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
    
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
  
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error("Error fetching all forms:", error);
    throw error;
  }

  return data || [];
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
  // Get current user id to verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // First verify that the user owns this form
  const { data: form, error: checkError } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', formId)
    .single();

  if (checkError) {
    console.error("Error checking form ownership:", checkError);
    throw checkError;
  }

  // If user doesn't own this form and isn't admin, throw error
  if (form.owner_id !== user.id) {
    // Check if user is admin
    const { data: isAdmin } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (!isAdmin) {
      throw new Error("You don't have permission to view submissions for this form");
    }
  }

  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching form responses:", error);
    throw error;
  }

  return data || [];
};

export const deleteForm = async (formId: string): Promise<void> => {
  // Get current user id to verify ownership
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // First verify that the user owns this form
  const { data: form, error: checkError } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', formId)
    .single();

  if (checkError) {
    console.error("Error checking form ownership:", checkError);
    throw checkError;
  }

  // If user doesn't own this form and isn't admin, throw error
  if (form.owner_id !== user.id) {
    // Check if user is admin
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

  // First delete all form submissions
  const { error: submissionsError } = await supabase
    .from('form_submissions')
    .delete()
    .eq('form_id', formId);

  if (submissionsError) {
    console.error("Error deleting form submissions:", submissionsError);
    throw submissionsError;
  }

  // Then delete the form
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', formId);

  if (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
};
