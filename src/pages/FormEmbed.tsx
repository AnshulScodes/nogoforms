
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getFormById } from "@/services/forms";
import type { Form } from "@/types/forms";
import { Toaster } from "@/components/ui/toaster";
import FormPreview from "@/components/form-builder/FormPreview";
import { convertFormDataToForm } from "@/sdk";

export default function FormEmbed() {
  const { formId } = useParams<{ formId: string }>();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract user info from URL parameters
  const userInfo = {
    userId: searchParams.get('userId') || undefined,
    userName: searchParams.get('userName') || undefined,
    userEmail: searchParams.get('userEmail') || undefined,
    userCompany: searchParams.get('userCompany') || undefined,
  };

  // Extract any additional custom parameters
  searchParams.forEach((value, key) => {
    if (!['userId', 'userName', 'userEmail', 'userCompany'].includes(key)) {
      (userInfo as any)[key] = value;
    }
  });

  useEffect(() => {
    async function loadForm() {
      if (!formId) {
        setError("No form ID provided");
        setLoading(false);
        return;
      }

      try {
        const formData = await getFormById(formId);
        // Convert FormData to Form type
        if (formData && formData.id) {
          const convertedForm = convertFormDataToForm(formData);
          setForm(convertedForm);
        } else {
          throw new Error("Form data is incomplete");
        }
      } catch (err: any) {
        console.error("Failed to load form:", err);
        setError(err.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId, searchParams]);

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
        <FormPreview 
          blocks={form.form_schema}
          formId={form.id}
          userInfo={userInfo}
        />
      </div>
    </div>
  );
}
