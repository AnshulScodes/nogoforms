
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormPreview from "@/components/form-builder/FormPreview";
import { getFormById } from "@/services/forms";
import type { Form } from "@/types/forms";

const FormEmbed = () => {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const { formId } = useParams();

  useEffect(() => {
    if (formId) {
      loadForm(formId);
    }
  }, [formId]);

  const loadForm = async (id: string) => {
    try {
      const formData = await getFormById(id);
      setForm(formData);
    } catch (error) {
      console.error("Failed to load form:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!form) {
    return <div className="p-4">Form not found</div>;
  }

  return (
    <div className="p-4">
      <FormPreview blocks={form.form_schema} formId={form.id} />
    </div>
  );
};

export default FormEmbed;
