
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getFormById } from "@/services/forms";
import type { Form } from "@/types/forms";
import FormPreview from "@/components/form-builder/FormPreview";
import { Toaster } from "@/components/ui/toaster";

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
        console.log(`Loading embed form (ID: ${formId})...`);
        const formData = await getFormById(formId);
        setForm(formData);
        console.log(`Form "${formData.title}" loaded successfully!`);
        
        if (Object.values(userInfo).some(val => val !== undefined)) {
          console.log("User info provided via URL:", userInfo);
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
    return <div className="p-4 text-center text-gray-600">Loading form...</div>;
  }

  if (error || !form) {
    return (
      <div className="p-4 text-center">
        <Toaster />
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-red-500">Error</h2>
          <p className="text-gray-600">{error || "Form not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Toaster />
      <div>
        <h1 className="text-xl font-semibold mb-2">{form.title}</h1>
        {form.description && <p className="text-gray-600 mb-4">{form.description}</p>}
      </div>
      
      <FormPreview 
        blocks={form.form_schema} 
        formId={form.id}
        userInfo={userInfo}
      />
    </div>
  );
}
