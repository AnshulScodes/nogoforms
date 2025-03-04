
import { useState, useEffect } from "react";
import { getApiKeys, revokeApiKey, ApiKey } from "@/services/apiKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function ApiKeysManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<{key: string, name: string} | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (data && !error) {
        setIsAdmin(true);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const loadApiKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error("Error loading API keys:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load API keys",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        variant: "destructive",
        title: "Name Required",
        description: "Please enter a name for the API key",
      });
      return;
    }

    try {
      // Generate a random API key
      const key = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      
      // Insert the new key into the database
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          key,
          name: newKeyName,
          user_id: user?.id,
          revoked: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "API Key Created",
        description: "New API key has been created successfully",
      });
      
      // Set the created key so it can be displayed to the admin
      setCreatedKey({ key, name: newKeyName });
      setNewKeyName("");
      
      // Refresh the list
      loadApiKeys();
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create API key",
      });
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await revokeApiKey(id);
      
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked successfully",
      });
      
      // Refresh the list
      loadApiKeys();
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke API key",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Key Management</h1>
        <Button variant="outline" size="sm" onClick={loadApiKeys}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Create API keys for users to access the form builder platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button onClick={handleCreateKey}>
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardContent>
        {createdKey && (
          <CardFooter>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded w-full">
              <p className="font-bold text-yellow-800">API Key Created:</p>
              <p className="text-yellow-800 break-all">{createdKey.key}</p>
              <p className="text-sm text-yellow-700 mt-2">
                Important: This key will only be shown once. Please copy it now.
              </p>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No API keys found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      {format(new Date(apiKey.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {apiKey.last_used 
                        ? format(new Date(apiKey.last_used), 'MMM d, yyyy HH:mm') 
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        apiKey.revoked 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {apiKey.revoked ? "Revoked" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {!apiKey.revoked && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleRevokeKey(apiKey.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
