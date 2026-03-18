INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Support Post-Session', 'Olá [Nome], passando para validar o espaço que você se permitiu hoje na sessão. Lembre-se de ser gentil consigo mesmo(a) nas próximas horas.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Support Post-Session');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Breathing Exercise Reminder', 'Momento de pausa: Que tal realizar o exercício de respiração que combinamos? 5 minutos para você.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Breathing Exercise Reminder');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Clinical Recess Notice', 'Prezado(a) [Nome], informo que o consultório entrará em recesso entre [Data_Inicio] e [Data_Fim]. Em caso de emergência, utilize os canais de apoio combinados.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Clinical Recess Notice');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Journaling Prompt', 'Olá [Nome], uma reflexão para esta semana: O que você tem feito por você que te traz paz? Anote no seu diário.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Journaling Prompt');

INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo)
SELECT id, 'Therapeutic Vínculo Message', 'Olá [Nome], estou enviando esta mensagem apenas para reforçar que nosso espaço é seguro e estou aqui para apoiar seu processo.', 'mensagem_rapida'
FROM public.usuarios
WHERE NOT EXISTS (SELECT 1 FROM public.templates_documentos t WHERE t.usuario_id = public.usuarios.id AND t.titulo = 'Therapeutic Vínculo Message');
