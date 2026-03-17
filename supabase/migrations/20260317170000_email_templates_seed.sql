-- Update handle_new_user trigger to seed marketing templates
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

  -- Seed marketing templates
  INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo) VALUES
  (new.id, 'Saúde e Prevenção', 'Olá [Nome do Paciente],' || E'\n\n' || 'Esperamos que você esteja bem.' || E'\n\n' || 'Cuidar da mente é tão importante quanto cuidar do corpo. Lembre-se de tirar um tempo para você nesta semana.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing'),
  (new.id, 'Novidades do Consultório', 'Olá [Nome do Paciente],' || E'\n\n' || 'Temos novidades!' || E'\n\n' || 'Agora estamos oferecendo novos horários de atendimento para melhor acomodar sua rotina.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing'),
  (new.id, 'Lembrete de Acompanhamento', 'Olá [Nome do Paciente],' || E'\n\n' || 'Já faz um tempo desde sua última sessão.' || E'\n\n' || 'Como você está? Se precisar conversar ou agendar um retorno, estamos à disposição.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed marketing templates for existing users
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM public.usuarios LOOP
    IF NOT EXISTS (SELECT 1 FROM public.templates_documentos WHERE usuario_id = u.id AND tipo = 'email_marketing') THEN
      INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo) VALUES
      (u.id, 'Saúde e Prevenção', 'Olá [Nome do Paciente],' || E'\n\n' || 'Esperamos que você esteja bem.' || E'\n\n' || 'Cuidar da mente é tão importante quanto cuidar do corpo. Lembre-se de tirar um tempo para você nesta semana.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing'),
      (u.id, 'Novidades do Consultório', 'Olá [Nome do Paciente],' || E'\n\n' || 'Temos novidades!' || E'\n\n' || 'Agora estamos oferecendo novos horários de atendimento para melhor acomodar sua rotina.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing'),
      (u.id, 'Lembrete de Acompanhamento', 'Olá [Nome do Paciente],' || E'\n\n' || 'Já faz um tempo desde sua última sessão.' || E'\n\n' || 'Como você está? Se precisar conversar ou agendar um retorno, estamos à disposição.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing');
    END IF;
  END LOOP;
END $$;
