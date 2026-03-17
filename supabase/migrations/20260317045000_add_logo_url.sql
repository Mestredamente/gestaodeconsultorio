-- Add logo_url to usuarios table
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create logos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security for the logos bucket
-- We assume storage.objects already has RLS enabled (it does by default)

-- Allow public read access to logos
CREATE POLICY "Logos are publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'logos');

-- Allow authenticated users to upload their own logos
CREATE POLICY "Users can upload their own logos" 
  ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (
    bucket_id = 'logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own logos
CREATE POLICY "Users can update their own logos" 
  ON storage.objects FOR UPDATE TO authenticated 
  USING (
    bucket_id = 'logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own logos
CREATE POLICY "Users can delete their own logos" 
  ON storage.objects FOR DELETE TO authenticated 
  USING (
    bucket_id = 'logos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
