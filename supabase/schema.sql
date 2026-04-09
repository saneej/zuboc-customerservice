/*
  SUPABASE DATABASE SCHEMA - OMNIDESK
  
  Run this SQL in your Supabase SQL Editor to set up the database.
*/

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'agent', 'viewer', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('new', 'open', 'pending', 'on_hold', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tables
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'agent',
  workspace_id UUID REFERENCES workspaces(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add availability columns if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_assigned_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, profile_id)
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE,
  customer_email TEXT,
  customer_phone TEXT,
  query_type TEXT,
  source TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status ticket_status DEFAULT 'new',
  priority ticket_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id),
  team_id UUID REFERENCES teams(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id), -- If null, might be system or customer
  customer_id UUID REFERENCES customers(id), -- If null, might be agent
  body TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_base_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES knowledge_base_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, published
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority ticket_priority NOT NULL,
  first_response_time_hours INT,
  resolution_time_hours INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.1 Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_workspace_id UUID;
BEGIN
  -- Get or create a default workspace
  SELECT id INTO default_workspace_id FROM public.workspaces LIMIT 1;
  
  IF default_workspace_id IS NULL THEN
    INSERT INTO public.workspaces (name, slug)
    VALUES ('My Workspace', 'default-' || substr(md5(random()::text), 1, 6))
    RETURNING id INTO default_workspace_id;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, workspace_id)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 OR new.email = 'msaneejk4@gmail.com' THEN 'admin'::user_role 
      ELSE 'agent'::user_role 
    END,
    default_workspace_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to avoid recursion in policies
CREATE OR REPLACE FUNCTION public.get_my_workspace()
RETURNS uuid AS $$
  SELECT workspace_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Simple Policy: Users can see data in their workspace
DROP POLICY IF EXISTS "Workspace Access" ON profiles;
CREATE POLICY "Workspace Access" ON profiles
  FOR ALL USING (id = auth.uid() OR workspace_id = public.get_my_workspace());

DROP POLICY IF EXISTS "Ticket Access" ON tickets;
CREATE POLICY "Ticket Access" ON tickets
  FOR ALL USING (workspace_id = public.get_my_workspace());

DROP POLICY IF EXISTS "Message Access" ON ticket_messages;
CREATE POLICY "Message Access" ON ticket_messages
  FOR ALL USING (ticket_id IN (SELECT id FROM tickets WHERE workspace_id = public.get_my_workspace()));

-- 5. Realtime
DO $$
BEGIN
    -- Add tickets table
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Table tickets is already in publication supabase_realtime';
        WHEN others THEN
            RAISE NOTICE 'Error adding tickets to publication: %', SQLERRM;
    END;

    -- Add ticket_messages table
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Table ticket_messages is already in publication supabase_realtime';
        WHEN others THEN
            RAISE NOTICE 'Error adding ticket_messages to publication: %', SQLERRM;
    END;

    -- Add notifications table
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    EXCEPTION
        WHEN duplicate_object THEN
            RAISE NOTICE 'Table notifications is already in publication supabase_realtime';
        WHEN others THEN
            RAISE NOTICE 'Error adding notifications to publication: %', SQLERRM;
    END;
END $$;

-- 6. Storage Setup
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read attachments
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'attachments' );

-- Allow authenticated users to upload attachments
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'attachments' );
