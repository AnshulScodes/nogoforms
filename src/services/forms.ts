
import { supabase } from "@/integrations/supabase/client";
import type { Form, FormBlockJson } from "@/types/forms";
import type { Json } from "@/types/database";
import type { FormBlock } from "@/sdk/FormBlockSDK";

// Helper function to convert FormBlock[] to Json
function formBlocksToJson(blocks: FormBlock[]): Json {
  return blocks.map(block => ({
    ...block,
    type: block.type,
    label: block.label,
    placeholder: block.placeholder || null,
    required: block.required || false,
    options: block.options || [],
    validation: block.validation || null,
  })) as Json;
}

// Helper function to convert Json to FormBlock[]
function jsonToFormBlocks(json: Json): FormBlock[] {
  if (!Array.isArray(json)) return [];
  return (json as FormBlockJson[]).map(block => ({
    ...block,
    type: block.type as FormBlock["type"],
  }));
}

export async function createForm(formData: { title: string } & Partial<Omit<Form, 'id' | 'title'>>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { form_schema, ...rest } = formData;
  const supabaseData = {
    ...rest,
    owner_id: user?.id,
    form_schema: form_schema ? formBlocksToJson(form_schema) : [],
  };

  const { data, error } = await supabase
    .from("forms")
    .insert(supabaseData)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    form_schema: jsonToFormBlocks(data.form_schema),
  } as Form;
}

export async function updateForm(id: string, updates: Partial<Omit<Form, 'id'>>) {
  const { form_schema, ...rest } = updates;
  const supabaseData = {
    ...rest,
    form_schema: form_schema ? formBlocksToJson(form_schema) : undefined,
  };

  const { data, error } = await supabase
    .from("forms")
    .update(supabaseData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    form_schema: jsonToFormBlocks(data.form_schema),
  } as Form;
}

export async function getForms() {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(form => ({
    ...form,
    form_schema: jsonToFormBlocks(form.form_schema),
  })) as Form[];
}

export async function getFormById(id: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    ...data,
    form_schema: jsonToFormBlocks(data.form_schema),
  } as Form;
}

export async function deleteForm(id: string) {
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) throw error;
}

export async function submitFormResponse(formId: string, data: any) {
  const { error } = await supabase
    .from("form_submissions")
    .insert({
      form_id: formId,
      data,
      metadata: {
        submitted_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
      },
    });

  if (error) {
    console.error("Form submission error:", error);
    throw error;
  }
}

export async function getFormResponses(formId: string) {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching form responses:", error);
    throw error;
  }

  return data;
}

export async function trackFormEvent(formId: string, eventType: string, eventData: any = {}) {
  const { error } = await supabase.from("form_analytics").insert({
    form_id: formId,
    event_type: eventType,
    event_data: eventData,
  });

  if (error) throw error;
}
