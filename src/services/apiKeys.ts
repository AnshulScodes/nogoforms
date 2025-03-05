import { supabase } from "@/integrations/supabase/client";

// Get API keys from environment variables
const VALID_API_KEYS = (import.meta.env.VITE_VALID_API_KEYS || "").split(",").filter(Boolean);

// If no API keys are set, use a default one in development
if (import.meta.env.DEV && VALID_API_KEYS.length === 0) {
  console.warn("No API keys found in environment variables. Using default development key.");
  VALID_API_KEYS.push("dev-key-123");
}

export interface ApiKey {
  id: string;
  key: string;
  user_id: string;
  name: string;
  created_at: string;
  revoked: boolean;
  last_used?: string;
}

export const getApiKeys = async (): Promise<ApiKey[]> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getApiKeyByKey = async (key: string): Promise<ApiKey | null> => {
  // Simple check against valid keys
  if (VALID_API_KEYS.includes(key)) {
    return {
      id: "static-id",
      key: key,
      user_id: "static-user",
      name: "Default API Key",
      created_at: new Date().toISOString(),
      revoked: false,
      last_used: new Date().toISOString()
    };
  }
  return null;
};

export const verifyApiKey = async (key: string): Promise<boolean> => {
  console.log('Verifying API key:', key);
  return VALID_API_KEYS.includes(key);
};

export const revokeApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id);
  
  if (error) throw error;
};
