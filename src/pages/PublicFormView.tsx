
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getFormById } from "@/services/forms";
import type { Form } from "@/types/forms";
import { Toaster } from "@/components/ui/toaster";
import FormPreview from "@/components/form-builder/FormPreview";

export default function PublicFormView() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      if (!formId) {
        setError("No form ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log(`Loading public form (ID: ${formId})...`);
        const formData = await getFormById(formId);
        setForm(formData);
        console.log(`Form "${formData.title}" loaded successfully!`);
      } catch (err: any) {
        console.error("Failed to load form:", err);
        setError(err.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Toaster />
        <div className="text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Toaster />
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-xl font-semibold text-red-500 mb-2">Error</h1>
          <p className="text-gray-600">{error || "Form not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster />
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && <p className="text-gray-600 mt-2">{form.description}</p>}
        </div>
        
        <FormPreview 
          blocks={form.form_schema} 
          formId={form.id} 
        />
        
        <div className="mt-8 text-center text-gray-500 text-sm">
          Form powered by FormBuilder
        </div>
      </div>
    </div>
  );
}
