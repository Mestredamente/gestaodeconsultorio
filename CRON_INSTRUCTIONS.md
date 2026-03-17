# Instruções para o Desenvolvedor: Configuração do Cron Trigger (Lembretes Automáticos de Consulta)

Para realizar envios automáticos e contínuos de lembretes via WhatsApp utilizando a função Edge `enviar_lembrete_consulta` 24 horas antes das consultas agendadas, utilize a extensão `pg_cron` nativa do Supabase em conjunto com `pg_net`.

## Passo 1: Habilitar extensões

Acesse o painel do Supabase, vá em **Database** -> **Extensions** e garanta que `pg_cron` e `pg_net` estejam ativados.

## Passo 2: Configurar o Agendamento (Cron Job)

Execute a seguinte SQL no **SQL Editor** do Supabase para programar a execução horária da Edge Function:

```sql
SELECT cron.schedule(
  'enviar-lembretes-consultas-24h', -- Nome do job
  '0 * * * *', -- Executa a cada hora (minuto 0)
  $$
    SELECT net.http_post(
      url:='https://qkxjdsdvxxgtdmlivxue.supabase.co/functions/v1/enviar_lembrete_consulta',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUA_CHAVE_ANON_OU_SERVICE_ROLE"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);
```

### Como Funciona:

A Edge function `enviar_lembrete_consulta` já está preparada (no seu código `index.ts`) para buscar todas as consultas com `status = 'agendado'` cuja data (`data_hora`) esteja a exatas 24 horas de distância (com uma margem de ±30 minutos para englobar chamadas a cada hora) quando não recebe um `agendamento_id` específico.

Portanto, o `pg_cron` simplesmente acionará este endpoint de hora em hora, e a função despachará os lembretes para os pacientes correspondentes, filtrando com base na preferência `lembrete_whatsapp_ativo` da clínica.
