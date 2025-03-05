import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Form {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: string;
  submission_count: number;
}

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadForms = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get forms created by the current user
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (formsError) throw formsError;
      
      // Get submission counts for each form
      const formsWithCounts = await Promise.all(
        (formsData || []).map(async (form) => {
          const { count, error: countError } = await supabase
            .from('form_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);
          
          if (countError) throw countError;
          
          return {
            ...form,
            submission_count: count || 0
          };
        })
      );
      
      setForms(formsWithCounts);
    } catch (error) {
      console.error("Error loading forms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
    
    // Set up realtime subscription to update forms automatically
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forms',
          filter: `owner_id=eq.${user?.id}`
        },
        () => {
          loadForms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Forms</h1>
        <Button asChild>
          <Link to="/builder">
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-60">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-gray-200 rounded w-full animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first form to start collecting submissions.
              </p>
              <Button asChild>
                <Link to="/builder">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Form
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle className="truncate">{form.title}</CardTitle>
                <CardDescription className="truncate">
                  {form.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between mb-1">
                    <span>Created:</span>
                    <span>{format(new Date(form.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Last updated:</span>
                    <span>{format(new Date(form.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Submissions:</span>
                    <span>{form.submission_count}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link to={`/form/${form.id}`}>View Form</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to={`/builder/${form.id}`}>Edit</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/forms/${form.id}/responses`)}
                >
                  View Responses
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
