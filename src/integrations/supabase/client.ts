// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://szjgbkjztoqlqhjeaspu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6amdia2p6dG9xbHFoamVhc3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NTgxMTMsImV4cCI6MjA1MTQzNDExM30.VeF8Vb5crbht2cRLV6O9eRZoQVbz47PeCMmt8Y9w-h4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);