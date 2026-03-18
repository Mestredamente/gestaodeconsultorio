-- Add foto_url column to pacientes table
ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('patient-avatars', 'patient-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies for public access to avatars
CREATE POLICY "Public read patient-avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'patient-avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Auth insert patient-avatars" 
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'patient-avatars');

-- Allow authenticated users to update their avatars
CREATE POLICY "Auth update patient-avatars" 
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'patient-avatars');

-- Allow authenticated users to delete their avatars
CREATE POLICY "Auth delete patient-avatars" 
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'patient-avatars');
