
import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', key)
    .eq('revoked', false)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const verifyApiKey = async (key: string): Promise<boolean> => {
  const apiKey = await getApiKeyByKey(key);
  
  if (apiKey) {
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('id', apiKey.id);
      
    return true;
  }
  
  return false;
};

export const revokeApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id);
  
  if (error) throw error;
};
