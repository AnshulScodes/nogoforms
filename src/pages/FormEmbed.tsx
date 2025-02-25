
import { useEffect, useState } from "react";
import FormPreview from "@/components/form-builder/FormPreview";
import { supabase } from "@/integrations/supabase/client";
import type { Form, FormBlockJson } from "@/types/forms";
import type { FormBlock } from "@/sdk/FormBlockSDK";

const FormEmbed = () => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      try {
        const formId = new URLSearchParams(window.location.search).get('id');
        if (!formId) {
          setError('No form ID provided');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("forms")
          .select("*")
          .eq("id", formId)
          .single();

        if (fetchError) {
          console.error('Error loading form:', fetchError);
          setError('Failed to load form');
          return;
        }

        if (!data) {
          setError('Form not found');
          return;
        }

        const formData: Form = {
          ...data,
          form_schema: (data.form_schema as FormBlockJson[]).map(block => ({
            ...block,
            type: block.type as FormBlock["type"],
          })) as FormBlock[]
        };
        setForm(formData);

      } catch (err) {
        console.error('Failed to load form:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error || 'Form not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen">
      <FormPreview 
        blocks={form.form_schema} 
        formId={form.id}
      />
    </div>
  );
};

export default FormEmbed;
