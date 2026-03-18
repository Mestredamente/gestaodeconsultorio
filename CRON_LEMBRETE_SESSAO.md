# Instruções para o Desenvolvedor: Configuração do Cron Trigger (lembrete_sessao)

Para automatizar os avisos de sessão para o dia seguinte via WhatsApp, utilize a extensão `pg_cron` nativa do Supabase.

## Passo 1: Habilitar extensões

Acesse o painel do Supabase, vá em **Database** -> **Extensions** e garanta que `pg_cron` e `pg_net` estejam ativados.

## Passo 2: Configurar o Agendamento (Cron Job)

Execute a seguinte SQL no **SQL Editor** do Supabase para programar a execução diária da Edge Function às 08:00 AM:

```sql
SELECT cron.schedule(
  'enviar-lembretes-sessao-diario', -- Nome do job
  '0 8 * * *', -- Executa todos os dias às 08:00 AM
  $
    SELECT net.http_post(
      url:='https://qkxjdsdvxxgtdmlivxue.supabase.co/functions/v1/lembrete_sessao',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUA_CHAVE_ANON_OU_SERVICE_ROLE"}'::jsonb,
      body:='{}'::jsonb
    );
  $
);
```

### Como Funciona:

A Edge function `lembrete_sessao` busca todas as consultas com `status` 'agendado' ou 'confirmado' para o dia seguinte e envia um deep link do WhatsApp aos pacientes.
