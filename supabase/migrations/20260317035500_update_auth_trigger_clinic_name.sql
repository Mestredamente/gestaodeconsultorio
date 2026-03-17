-- Drop the existing trigger to recreate it with the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to extract nome_consultorio from raw_user_meta_data during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome_consultorio)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'nome_consultorio'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    nome_consultorio = COALESCE(EXCLUDED.nome_consultorio, public.usuarios.nome_consultorio);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
