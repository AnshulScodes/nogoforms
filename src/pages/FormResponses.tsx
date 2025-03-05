import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFormResponses, getForm } from "@/services/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function FormResponses() {
  const { formId } = useParams();
  const [responses, setResponses] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!formId) return;
      
      try {
        const [formData, responsesData] = await Promise.all([
          getForm(formId),
          getFormResponses(formId)
        ]);
        
        setForm(formData);
        setResponses(responsesData);
      } catch (err: any) {
        console.error("Error loading form responses:", err);
        setError(err.message || "Failed to load responses");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [formId]);

  if (loading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{form?.title} - Responses</h1>
          <p className="text-muted-foreground">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'} received
          </p>
        </div>

        <div className="grid gap-4">
          {responses.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No responses received yet</p>
              </CardContent>
            </Card>
          ) : (
            responses.map((response, index) => (
              <Card key={response.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Response #{index + 1}</CardTitle>
                  <CardDescription>
                    Submitted on {format(new Date(response.created_at), 'PPpp')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {Object.entries(response.data).map(([key, value]) => {
                        const field = form.form_schema.find((f: any) => f.id === key);
                        return (
                          <div key={key} className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              {field?.label || key}
                            </p>
                            <p className="text-sm">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </p>
                          </div>
                        );
                      })}
                      
                      {response.metadata && (
                        <div className="mt-6 pt-4 border-t">
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Submission Metadata
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded">
                            {JSON.stringify(response.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 