-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eadskqzrzwkwixyqkrot/sql/new

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create storage bucket for avatars (run this too)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on avatars bucket
CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY IF NOT EXISTS "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update their own avatar
CREATE POLICY IF NOT EXISTS "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');
