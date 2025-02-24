
import { useEffect, useState } from "react";
import FormPreview from "@/components/form-builder/FormPreview";
import { supabase } from "@/integrations/supabase/client";
import type { Form, FormBlockJson } from "@/types/forms";
import type { FormBlock } from "@/sdk/FormBlockSDK";

const FormEmbed = () => {
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      // Get the form ID from the URL parameter
      const formId = new URLSearchParams(window.location.search).get('id');
      if (!formId) return;

      // Fetch the form directly, no auth needed
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (!error && data) {
        // Convert the form_schema from Json to FormBlock[]
        const formData: Form = {
          ...data,
          form_schema: (data.form_schema as FormBlockJson[]).map(block => ({
            ...block,
            type: block.type as FormBlock["type"],
          })) as FormBlock[]
        };
        setForm(formData);
      }
    };

    loadForm();
  }, []);

  if (!form) return null;

  // Just the form, nothing else
  return <FormPreview blocks={form.form_schema} formId={form.id} />;
};

export default FormEmbed;
