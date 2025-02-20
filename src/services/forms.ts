
import { supabase } from "@/integrations/supabase/client";
import type { Form } from "@/types/forms";

export async function createForm(form: Partial<Form>) {
  const { data, error } = await supabase
    .from("forms")
    .insert([form])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateForm(id: string, updates: Partial<Form>) {
  const { data, error } = await supabase
    .from("forms")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getForms() {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFormById(id: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteForm(id: string) {
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) throw error;
}

export async function submitFormResponse(formId: string, data: any) {
  const { error } = await supabase.from("form_submissions").insert([
    {
      form_id: formId,
      data,
    },
  ]);

  if (error) throw error;
}

export async function trackFormEvent(formId: string, eventType: string, eventData: any = {}) {
  const { error } = await supabase.from("form_analytics").insert([
    {
      form_id: formId,
      event_type: eventType,
      event_data: eventData,
    },
  ]);

  if (error) throw error;
}
