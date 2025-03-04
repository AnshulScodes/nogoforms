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
  console.log('Attempting to verify API key:', key);
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', key)
    .eq('revoked', false)
    .maybeSingle();
  
  console.log('API key verification response:', { data, error });
  
  if (error) {
    console.error('API key verification error:', error);
    throw error;
  }
  return data;
};

export const verifyApiKey = async (key: string): Promise<boolean> => {
  console.log('Starting API key verification for key:', key);
  try {
    const apiKey = await getApiKeyByKey(key);
    console.log('API key lookup result:', apiKey);
    
    if (apiKey) {
      console.log('Valid API key found, updating last_used timestamp');
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ last_used: new Date().toISOString() })
        .eq('id', apiKey.id);
      
      if (updateError) {
        console.error('Error updating last_used timestamp:', updateError);
      }
      
      return true;
    }
    
    console.log('No valid API key found');
    return false;
  } catch (error) {
    console.error('Error in verifyApiKey:', error);
    return false;
  }
};

export const revokeApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', id);
  
  if (error) throw error;
};
