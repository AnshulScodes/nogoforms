
import { useEffect, useState } from "react";
import FormPreview from "@/components/form-builder/FormPreview";
import { supabase } from "@/integrations/supabase/client";
import type { Form, FormBlockJson } from "@/types/forms";
import type { FormBlock } from "@/sdk/FormBlockSDK";

const FormEmbed = () => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForm = async () => {
      try {
        // Get form ID from URL
        const formId = new URLSearchParams(window.location.search).get('id');
        if (!formId) {
          console.error('No form ID provided');
          return;
        }

        // Fetch form data
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("id", formId)
          .single();

        if (error) {
          console.error('Error loading form:', error);
          return;
        }

        if (data) {
          // Convert form_schema from JSON to FormBlock[]
          const formData: Form = {
            ...data,
            form_schema: (data.form_schema as FormBlockJson[]).map(block => ({
              ...block,
              type: block.type as FormBlock["type"],
            })) as FormBlock[]
          };
          setForm(formData);
        }
      } catch (err) {
        console.error('Failed to load form:', err);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <FormPreview blocks={form.form_schema} formId={form.id} />
    </div>
  );
};

export default FormEmbed;
