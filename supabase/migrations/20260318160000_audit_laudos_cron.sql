-- Audit trigger for laudos table
CREATE TRIGGER audit_laudos_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.laudos
FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();

-- Enable pg_cron and pg_net extensions for scheduling Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily edge function execution for WhatsApp session reminders at 08:00 AM
SELECT cron.schedule(
  'enviar-lembretes-sessao-diario',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url:='https://qkxjdsdvxxgtdmlivxue.supabase.co/functions/v1/lembrete_sessao',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUA_CHAVE_ANON_OU_SERVICE_ROLE"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);
