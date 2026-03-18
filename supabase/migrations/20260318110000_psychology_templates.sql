-- Seed specific psychology templates for communication
INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Apoio Pós-Sessão', 'Olá [Nome], passando para validar o espaço que você se permitiu hoje na sessão. Lembre-se de ser gentil consigo mesmo(a) nas próximas horas.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Apoio Pós-Sessão');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Exercício de Respiração', 'Momento de pausa: Que tal realizar o exercício de respiração que combinamos? 5 minutos para você.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Exercício de Respiração');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Aviso de Recesso', 'Prezado(a) [Nome], informo que o consultório entrará em recesso entre [Data_Inicio] e [Data_Fim]. Em caso de emergência, utilize os canais de apoio combinados.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Aviso de Recesso');
