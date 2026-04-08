import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'agent' | 'viewer' | 'customer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  workspace_id: string | null;
  is_available: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'open' | 'pending' | 'on_hold' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer_id: string;
  assigned_to: string | null;
  team_id: string | null;
  workspace_id: string;
  ticket_number: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  query_type: string | null;
  source: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  tags: string[];
  metadata: any;
}
