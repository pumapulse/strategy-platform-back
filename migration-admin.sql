-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eadskqzrzwkwixyqkrot/sql/new

CREATE TABLE IF NOT EXISTS admin_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
