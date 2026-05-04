ALTER TABLE email_verifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'signup';
