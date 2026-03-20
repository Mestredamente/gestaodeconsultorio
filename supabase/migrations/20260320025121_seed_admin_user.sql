DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Fix existing users missing proper provider metadata which can trigger provider disabled errors
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"]}'::jsonb
  WHERE raw_app_meta_data IS NULL OR NOT (raw_app_meta_data ? 'providers');

  -- Seed admin user to ensure login works even if signups are disabled
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@example.com',
      crypt('StrongPassword123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "nome_consultorio": "Consultório Admin"}',
      false, 'authenticated', 'authenticated',
      '',    -- confirmation_token: MUST be '' not NULL
      '',    -- recovery_token: MUST be '' not NULL
      '',    -- email_change_token_new: MUST be '' not NULL
      '',    -- email_change: MUST be '' not NULL
      '',    -- email_change_token_current: MUST be '' not NULL
      NULL,  -- phone: MUST be NULL (not '') due to UNIQUE constraint
      '',    -- phone_change: MUST be '' not NULL
      '',    -- phone_change_token: MUST be '' not NULL
      ''     -- reauthentication_token: MUST be '' not NULL
    );

    -- Insert into dependent tables using the SAME new_user_id
    INSERT INTO public.usuarios (id, email, role, nome_consultorio)
    VALUES (new_user_id, 'admin@example.com', 'admin', 'Consultório Admin')
    ON CONFLICT (id) DO UPDATE SET 
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      nome_consultorio = COALESCE(public.usuarios.nome_consultorio, EXCLUDED.nome_consultorio);
  ELSE
    -- If user already exists, reset password and ensure email is confirmed and provider is set
    UPDATE auth.users
    SET encrypted_password = crypt('StrongPassword123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"]}'::jsonb
    WHERE email = 'admin@example.com';
  END IF;
END $$;
