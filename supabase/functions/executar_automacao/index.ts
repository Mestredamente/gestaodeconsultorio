import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    const { type, table, record, old_record } = payload
    
    if (!record || !record.usuario_id) {
      return new Response(JSON.stringify({ message: 'Payload inválido ou sem usuario_id' }), { headers: corsHeaders })
    }

    let matchedGatilho = null
    
    if (table === 'empresas' && type === 'INSERT') {
      matchedGatilho = 'Nova Empresa Criada'
    } else if (table === 'contatos' && type === 'INSERT') {
      matchedGatilho = 'Contato Criado'
    } else if (table === 'oportunidades') {
      if (type === 'INSERT') {
        matchedGatilho = 'Oportunidade Criada'
      } else if (type === 'UPDATE' && record.estagio === 'Ganho' && old_record?.estagio !== 'Ganho') {
        matchedGatilho = 'Oportunidade Ganha'
      }
    } else if (table === 'propostas') {
      if (type === 'UPDATE' && record.status === 'Aceita' && old_record?.status !== 'Aceita') {
        matchedGatilho = 'Proposta Aceita'
      } else if (type === 'UPDATE' && record.status === 'Rejeitada' && old_record?.status !== 'Rejeitada') {
        matchedGatilho = 'Proposta Rejeitada'
      } else if (type === 'UPDATE' && record.status_nf === 'Pendente' && old_record?.status_nf !== 'Pendente') {
        matchedGatilho = 'Proposta Aguardando NF'
      }
    }

    if (!matchedGatilho) {
      return new Response(JSON.stringify({ message: 'Nenhum gatilho correspondente' }), { headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: fluxos, error: fluxosError } = await supabase
      .from('fluxos_automacao')
      .select('*')
      .eq('usuario_id', record.usuario_id)
      .eq('gatilho', matchedGatilho)
      .eq('ativo', true)

    if (fluxosError || !fluxos || fluxos.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum fluxo ativo encontrado' }), { headers: corsHeaders })
    }

    let executados = 0

    for (const fluxo of fluxos) {
      let status_exec = 'sucesso';
      let detalhes_exec: any = { record_id: record.id, table };
      
      try {
        const detalhes = typeof fluxo.detalhes_acao === 'string' ? JSON.parse(fluxo.detalhes_acao) : (fluxo.detalhes_acao || {})

        if (fluxo.acao === 'Enviar Email') {
          let assunto = detalhes.assunto || 'Notificação Automática'
          let corpo = detalhes.corpo || 'Sua automação foi disparada.'
          
          const nomeAlvo = record.nome || 'Cliente'
          assunto = assunto.replace(/\[Nome\]/gi, nomeAlvo)
          corpo = corpo.replace(/\[Nome\]/gi, nomeAlvo)

          let destinatario = record.email

          if ((table === 'oportunidades' || table === 'propostas') && record.contato_id) {
            const { data: contato } = await supabase.from('contatos').select('email').eq('id', record.contato_id).single()
            if (contato?.email) destinatario = contato.email
          }

          if (!destinatario) {
            console.warn(`[Fluxo ${fluxo.id}] Destinatário não encontrado para ação Enviar Email.`);
            continue;
          }

          const resendApiKey = Deno.env.get('RESEND_API_KEY')
          
          if (resendApiKey) {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'CRM B2B <onboarding@resend.dev>',
                to: [destinatario],
                subject: assunto,
                html: `<p>${corpo.replace(/\n/g, '<br/>')}</p>`
              })
            })
            
            if (!res.ok) {
              const errorText = await res.text()
              console.error(`[Fluxo ${fluxo.id}] Falha ao enviar via Resend: ${errorText}`)
              throw new Error(`Resend Error: ${errorText}`)
            }
          } else {
            console.warn(`[Fluxo ${fluxo.id}] RESEND_API_KEY ausente. Simulando disparo para ${destinatario}.`)
          }

          const { error: insertError } = await supabase.from('emails_automacao').insert({
            usuario_id: record.usuario_id,
            fluxo_id: fluxo.id,
            destinatario: destinatario,
            assunto: assunto,
            corpo: corpo
          })

          if (insertError) {
             console.error(`[Fluxo ${fluxo.id}] Erro ao registrar email:`, insertError.message)
          }

          // Notifica in-app
          await supabase.from('notificacoes').insert({
            usuario_id: record.usuario_id,
            titulo: `Automação de Email Executada`,
            mensagem: `Email automático enviado para ${destinatario} via fluxo "${fluxo.nome}".`,
            tipo: 'sistema'
          });

          executados++

        } else if (fluxo.acao === 'Criar Tarefa') {
          const titulo = detalhes.titulo || `Tarefa automática: ${fluxo.nome}`
          const descricao = detalhes.descricao || `Gerado pelo fluxo: ${fluxo.nome}`

          await supabase.from('atividades').insert({
            usuario_id: record.usuario_id,
            responsavel_id: record.usuario_id,
            tipo: 'Tarefa Interna',
            titulo: titulo,
            descricao: descricao,
            status: 'Agendada',
            empresa_id: table === 'empresas' ? record.id : record.empresa_id || null,
            contato_id: table === 'contatos' ? record.id : record.contato_id || null,
            oportunidade_id: table === 'oportunidades' ? record.id : (table === 'propostas' ? record.oportunidade_id : null)
          })
          
          // Notifica in-app
          await supabase.from('notificacoes').insert({
            usuario_id: record.usuario_id,
            titulo: `Tarefa Automática Criada`,
            mensagem: `Tarefa "${titulo}" criada via fluxo "${fluxo.nome}".`,
            tipo: 'sistema'
          });

          executados++

        } else if (fluxo.acao === 'Atualizar Campo') {
          const campo = detalhes.campo;
          const valor = detalhes.valor;

          if (campo && valor !== undefined) {
             await supabase.from(table).update({ [campo]: valor }).eq('id', record.id);
             executados++;
          }
        } else if (fluxo.acao === 'Enviar Webhook') {
          const url = detalhes.url;
          let payloadStr = detalhes.payload || '{}';
          
          const nomeAlvo = record.nome || 'Registro';
          payloadStr = payloadStr.replace(/\[Nome\]/gi, nomeAlvo);
          
          let payloadObj = {};
          try {
              payloadObj = JSON.parse(payloadStr);
          } catch(e) {
              payloadObj = { text: payloadStr };
          }
          
          if (url) {
              const res = await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      ...payloadObj,
                      record: record,
                      table: table
                  })
              });
              if (!res.ok) {
                  throw new Error(`Webhook failed: ${res.statusText}`);
              }
              executados++;
          }
        }
      } catch (err: any) {
        status_exec = 'erro';
        detalhes_exec.error = err.message;
        console.error(`[Fluxo ${fluxo.id}] Erro de execução (graceful catch):`, err.message)
      } finally {
        const { error: logErr } = await supabase.from('logs_execucao_automacao').insert({
          fluxo_id: fluxo.id,
          usuario_id: record.usuario_id,
          status: status_exec,
          detalhes: detalhes_exec
        });
        if (logErr) console.error(`Falha ao salvar log:`, logErr.message);
      }
    }

    return new Response(JSON.stringify({ success: true, processed: executados }), { headers: corsHeaders })
  } catch (error: any) {
    console.error('Erro geral na função executar_automacao:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})
