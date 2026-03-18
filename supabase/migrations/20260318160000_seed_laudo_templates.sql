-- Seed laudo templates for all existing users who don't have one
INSERT INTO public.templates_documentos (id, usuario_id, titulo, conteudo, tipo)
SELECT gen_random_uuid(), u.id, 'Laudo Psicológico Padrão', 'LAUDO PSICOLÓGICO

Atesto para os devidos fins que o(a) paciente [Nome], portador(a) do CPF [CPF], encontra-se em acompanhamento psicológico neste consultório.

Data: [Data]

[Resumo Histórico]
', 'laudo'
FROM public.usuarios u
WHERE NOT EXISTS (
  SELECT 1 FROM public.templates_documentos td 
  WHERE td.usuario_id = u.id AND td.tipo = 'laudo'
);
