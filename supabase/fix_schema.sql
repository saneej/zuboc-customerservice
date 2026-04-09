-- 1. Fix Tickets Table
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 2. Fix Ticket Messages Table
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

-- 3. Fix Profiles Table for Agent Status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_assigned_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_text TEXT DEFAULT 'Active';

-- 4. Robust Trigger for New Users
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

  -- Use UPSERT to avoid "duplicate key" errors if profile already exists
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, workspace_id, is_available)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 OR new.email = 'msaneejk4@gmail.com' THEN 'admin'::user_role 
      ELSE 'agent'::user_role 
    END,
    default_workspace_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Refresh PostgREST Cache (if possible)
NOTIFY pgrst, 'reload schema';
