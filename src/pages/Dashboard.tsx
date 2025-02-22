
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, PenSquare, Copy, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Form, FormBlockJson } from "@/types/forms";
import type { FormBlock } from "@/sdk/FormBlockSDK";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const { data: formData, error } = await supabase
        .from("forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to ensure form_schema is properly typed
      const transformedForms: Form[] = (formData || []).map(form => ({
        ...form,
        form_schema: (Array.isArray(form.form_schema) 
          ? form.form_schema as FormBlockJson[]
          : []
        ).map(block => ({
          ...block,
          type: block.type as FormBlock["type"],
        })) as FormBlock[],
      }));

      setForms(transformedForms);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load forms",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (formId: string) => {
    try {
      const { error } = await supabase
        .from("forms")
        .delete()
        .eq("id", formId);

      if (error) throw error;

      setForms(forms.filter(form => form.id !== formId));
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete form",
      });
    }
  };

  const copyFormLink = (formId: string) => {
    const formLink = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(formLink);
    toast({
      title: "Copied!",
      description: "Form link copied to clipboard",
    });
  };

  const handleEditForm = (formId: string) => {
    navigate(`/builder/${formId}`);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Forms</h1>
        <Button onClick={() => navigate("/builder")} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create New Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">No forms yet</h3>
              <p className="text-muted-foreground">Create your first form to get started</p>
              <Button onClick={() => navigate("/builder")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
                <CardDescription>
                  {form.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Created: {new Date(form.created_at!).toLocaleDateString()}</p>
                  <p>Fields: {form.form_schema.length}</p>
                  <p className="capitalize">Status: {form.status}</p>
                </div>
              </CardContent>
              <CardFooter className="mt-auto flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyFormLink(form.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/forms/${form.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditForm(form.id)}
                >
                  <PenSquare className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the form
                        and all its responses.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteForm(form.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
