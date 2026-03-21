// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          codigo_autorizacao: string | null
          convenio_id: string | null
          data_faturamento: string | null
          data_hora: string
          especialidade: string | null
          id: string
          is_online: boolean | null
          justificativa_falta: string | null
          link_sala_virtual: string | null
          paciente_id: string
          room_id: string | null
          sala_virtual_token: string | null
          sala_virtual_token_expires_at: string | null
          sala_virtual_token_valid_from: string | null
          sinal_pago: boolean | null
          status: string
          status_nota_fiscal: string | null
          status_reembolso: string | null
          status_whatsapp_lembrete: string | null
          tipo_pagamento: string | null
          usuario_id: string
          valor_sinal: number | null
          valor_total: number | null
        }
        Insert: {
          codigo_autorizacao?: string | null
          convenio_id?: string | null
          data_faturamento?: string | null
          data_hora: string
          especialidade?: string | null
          id?: string
          is_online?: boolean | null
          justificativa_falta?: string | null
          link_sala_virtual?: string | null
          paciente_id: string
          room_id?: string | null
          sala_virtual_token?: string | null
          sala_virtual_token_expires_at?: string | null
          sala_virtual_token_valid_from?: string | null
          sinal_pago?: boolean | null
          status?: string
          status_nota_fiscal?: string | null
          status_reembolso?: string | null
          status_whatsapp_lembrete?: string | null
          tipo_pagamento?: string | null
          usuario_id: string
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Update: {
          codigo_autorizacao?: string | null
          convenio_id?: string | null
          data_faturamento?: string | null
          data_hora?: string
          especialidade?: string | null
          id?: string
          is_online?: boolean | null
          justificativa_falta?: string | null
          link_sala_virtual?: string | null
          paciente_id?: string
          room_id?: string | null
          sala_virtual_token?: string | null
          sala_virtual_token_expires_at?: string | null
          sala_virtual_token_valid_from?: string | null
          sinal_pago?: boolean | null
          status?: string
          status_nota_fiscal?: string | null
          status_reembolso?: string | null
          status_whatsapp_lembrete?: string | null
          tipo_pagamento?: string | null
          usuario_id?: string
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_time: string
          id: string
          patient_name: string
          session_value: number
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_time: string
          id?: string
          patient_name: string
          session_value: number
          status?: string
          user_id?: string | null
        }
        Update: {
          appointment_time?: string
          id?: string
          patient_name?: string
          session_value?: number
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          agendamento_id: string | null
          comentario: string | null
          data_criacao: string
          id: string
          nota: number | null
          paciente_id: string
        }
        Insert: {
          agendamento_id?: string | null
          comentario?: string | null
          data_criacao?: string
          id?: string
          nota?: number | null
          paciente_id: string
        }
        Update: {
          agendamento_id?: string | null
          comentario?: string | null
          data_criacao?: string
          id?: string
          nota?: number | null
          paciente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueios_agenda: {
        Row: {
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          usuario_id: string
        }
        Insert: {
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          usuario_id: string
        }
        Update: {
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bloqueios_agenda_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      casos_supervisao: {
        Row: {
          area_atuacao: string | null
          data_criacao: string
          descricao_caso: string
          id: string
          status: string
          titulo_anonimizado: string
          usuario_id: string
        }
        Insert: {
          area_atuacao?: string | null
          data_criacao?: string
          descricao_caso: string
          id?: string
          status?: string
          titulo_anonimizado: string
          usuario_id: string
        }
        Update: {
          area_atuacao?: string | null
          data_criacao?: string
          descricao_caso?: string
          id?: string
          status?: string
          titulo_anonimizado?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "casos_supervisao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacoes_campanhas: {
        Row: {
          conteudo: string
          data_envio: string
          id: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          data_envio?: string
          id?: string
          tipo?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          data_envio?: string
          id?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicacoes_campanhas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      convenios: {
        Row: {
          contato: string | null
          created_at: string
          id: string
          nome: string
          registro_ans: string | null
          usuario_id: string
        }
        Insert: {
          contato?: string | null
          created_at?: string
          id?: string
          nome: string
          registro_ans?: string | null
          usuario_id: string
        }
        Update: {
          contato?: string | null
          created_at?: string
          id?: string
          nome?: string
          registro_ans?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "convenios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          usuario_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          usuario_id: string
          valor?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          usuario_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          data_atualizacao: string | null
          id: string
          nome_item: string
          quantidade: number
          quantidade_minima: number
          usuario_id: string
        }
        Insert: {
          data_atualizacao?: string | null
          id?: string
          nome_item: string
          quantidade?: number
          quantidade_minima?: number
          usuario_id: string
        }
        Update: {
          data_atualizacao?: string | null
          id?: string
          nome_item?: string
          quantidade?: number
          quantidade_minima?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          created_at: string
          data_vencimento: string
          id: string
          plano: string
          status: string
          url_recibo: string | null
          usuario_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_vencimento: string
          id?: string
          plano: string
          status?: string
          url_recibo?: string | null
          usuario_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data_vencimento?: string
          id?: string
          plano?: string
          status?: string
          url_recibo?: string | null
          usuario_id?: string
          valor?: number
        }
        Relationships: []
      }
      financeiro: {
        Row: {
          ano: number
          data_atualizacao: string
          id: string
          mes: number
          metodo_pagamento: string | null
          paciente_id: string
          status: string
          usuario_id: string
          valor_a_receber: number
          valor_recebido: number
        }
        Insert: {
          ano: number
          data_atualizacao?: string
          id?: string
          mes: number
          metodo_pagamento?: string | null
          paciente_id: string
          status?: string
          usuario_id: string
          valor_a_receber?: number
          valor_recebido?: number
        }
        Update: {
          ano?: number
          data_atualizacao?: string
          id?: string
          mes?: number
          metodo_pagamento?: string | null
          paciente_id?: string
          status?: string
          usuario_id?: string
          valor_a_receber?: number
          valor_recebido?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_cobrancas: {
        Row: {
          ano_referencia: number
          data_envio: string
          id: string
          mes_referencia: number
          paciente_id: string
          usuario_id: string
          valor_cobrado: number
        }
        Insert: {
          ano_referencia: number
          data_envio?: string
          id?: string
          mes_referencia: number
          paciente_id: string
          usuario_id: string
          valor_cobrado: number
        }
        Update: {
          ano_referencia?: number
          data_envio?: string
          id?: string
          mes_referencia?: number
          paciente_id?: string
          usuario_id?: string
          valor_cobrado?: number
        }
        Relationships: [
          {
            foreignKeyName: "historico_cobrancas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_cobrancas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_mensagens: {
        Row: {
          conteudo: string
          data_envio: string
          id: string
          paciente_id: string
          status_envio: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          data_envio?: string
          id?: string
          paciente_id: string
          status_envio?: string
          tipo: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          data_envio?: string
          id?: string
          paciente_id?: string
          status_envio?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_mensagens_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_mensagens_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      laudos: {
        Row: {
          conteudo: string
          data_emissao: string
          id: string
          paciente_id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          data_emissao?: string
          id?: string
          paciente_id: string
          tipo?: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          data_emissao?: string
          id?: string
          paciente_id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "laudos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_espera: {
        Row: {
          created_at: string
          dias_semana: string[]
          id: string
          paciente_id: string
          periodos: string[]
          usuario_id: string
        }
        Insert: {
          created_at?: string
          dias_semana: string[]
          id?: string
          paciente_id: string
          periodos: string[]
          usuario_id: string
        }
        Update: {
          created_at?: string
          dias_semana?: string[]
          id?: string
          paciente_id?: string
          periodos?: string[]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lista_espera_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lista_espera_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_auditoria: {
        Row: {
          acao: string
          data_criacao: string
          detalhes: Json
          id: string
          registro_id: string
          tabela_afetada: string
          usuario_id: string
        }
        Insert: {
          acao: string
          data_criacao?: string
          detalhes?: Json
          id?: string
          registro_id: string
          tabela_afetada: string
          usuario_id: string
        }
        Update: {
          acao?: string
          data_criacao?: string
          detalhes?: Json
          id?: string
          registro_id?: string
          tabela_afetada?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacao_estoque: {
        Row: {
          data_movimentacao: string
          id: string
          item_id: string
          quantidade_mudanca: number
          tipo: string
          usuario_id: string
        }
        Insert: {
          data_movimentacao?: string
          id?: string
          item_id: string
          quantidade_mudanca: number
          tipo: string
          usuario_id: string
        }
        Update: {
          data_movimentacao?: string
          id?: string
          item_id?: string
          quantidade_mudanca?: number
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacao_estoque_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacao_estoque_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          data_criacao: string
          id: string
          lida: boolean
          mensagem: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          id?: string
          lida?: boolean
          mensagem: string
          titulo: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string
          id?: string
          lida?: boolean
          mensagem?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          anamnese: Json | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          consentimento_lgpd: boolean | null
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          contrato_aceito: boolean | null
          convenio_id: string | null
          cpf: string | null
          data_aceite_contrato: string | null
          data_consentimento_lgpd: string | null
          data_criacao: string | null
          data_nascimento: string | null
          dia_fixo: string | null
          dia_pagamento: number | null
          email: string | null
          endereco: string | null
          estado: string | null
          foto_url: string | null
          frequencia_pagamento: string | null
          hash_anamnese: string | null
          horario_fixo: string | null
          id: string
          nome: string
          numero: string | null
          numero_carteira: string | null
          recorrencia: string | null
          rua: string | null
          telefone: string | null
          tipo_horario: string | null
          usuario_id: string
          valor_sessao: number | null
        }
        Insert: {
          anamnese?: Json | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_lgpd?: boolean | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          contrato_aceito?: boolean | null
          convenio_id?: string | null
          cpf?: string | null
          data_aceite_contrato?: string | null
          data_consentimento_lgpd?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          dia_fixo?: string | null
          dia_pagamento?: number | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          frequencia_pagamento?: string | null
          hash_anamnese?: string | null
          horario_fixo?: string | null
          id?: string
          nome: string
          numero?: string | null
          numero_carteira?: string | null
          recorrencia?: string | null
          rua?: string | null
          telefone?: string | null
          tipo_horario?: string | null
          usuario_id: string
          valor_sessao?: number | null
        }
        Update: {
          anamnese?: Json | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_lgpd?: boolean | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          contrato_aceito?: boolean | null
          convenio_id?: string | null
          cpf?: string | null
          data_aceite_contrato?: string | null
          data_consentimento_lgpd?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          dia_fixo?: string | null
          dia_pagamento?: number | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          frequencia_pagamento?: string | null
          hash_anamnese?: string | null
          horario_fixo?: string | null
          id?: string
          nome?: string
          numero?: string | null
          numero_carteira?: string | null
          recorrencia?: string | null
          rua?: string | null
          telefone?: string | null
          tipo_horario?: string | null
          usuario_id?: string
          valor_sessao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_convenio_id_fkey"
            columns: ["convenio_id"]
            isOneToOne: false
            referencedRelation: "convenios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pontos_eletronicos: {
        Row: {
          created_at: string | null
          data: string
          entrada: string | null
          id: string
          retorno_almoco: string | null
          saida: string | null
          saida_almoco: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          entrada?: string | null
          id?: string
          retorno_almoco?: string | null
          saida?: string | null
          saida_almoco?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          entrada?: string | null
          id?: string
          retorno_almoco?: string | null
          saida?: string | null
          saida_almoco?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      prescricoes: {
        Row: {
          conteudo_json: Json
          data_emissao: string
          hash_verificacao: string
          id: string
          paciente_id: string
          usuario_id: string
        }
        Insert: {
          conteudo_json?: Json
          data_emissao?: string
          hash_verificacao?: string
          id?: string
          paciente_id: string
          usuario_id: string
        }
        Update: {
          conteudo_json?: Json
          data_emissao?: string
          hash_verificacao?: string
          id?: string
          paciente_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      prontuarios: {
        Row: {
          historico_sessoes: Json
          id: string
          nova_nota: string | null
          paciente_id: string
          queixa_principal: string | null
          usuario_id: string
        }
        Insert: {
          historico_sessoes?: Json
          id?: string
          nova_nota?: string | null
          paciente_id: string
          queixa_principal?: string | null
          usuario_id: string
        }
        Update: {
          historico_sessoes?: Json
          id?: string
          nova_nota?: string | null
          paciente_id?: string
          queixa_principal?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: true
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      sala_espera: {
        Row: {
          agendamento_id: string
          created_at: string
          id: string
          paciente_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string
          id?: string
          paciente_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string
          id?: string
          paciente_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sala_espera_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: true
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sala_espera_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_rh: {
        Row: {
          anexo_url: string | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          status: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          anexo_url?: string | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          status?: string
          tipo: string
          usuario_id: string
        }
        Update: {
          anexo_url?: string | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          status?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      templates_documentos: {
        Row: {
          conteudo: string
          data_criacao: string
          id: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          conteudo: string
          data_criacao?: string
          id?: string
          tipo?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          conteudo?: string
          data_criacao?: string
          id?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      testes_pacientes: {
        Row: {
          data_conclusao: string | null
          data_envio: string
          id: string
          paciente_id: string
          respostas_json: Json | null
          status: string
          template_id: string
          usuario_id: string
        }
        Insert: {
          data_conclusao?: string | null
          data_envio?: string
          id?: string
          paciente_id: string
          respostas_json?: Json | null
          status?: string
          template_id: string
          usuario_id: string
        }
        Update: {
          data_conclusao?: string | null
          data_envio?: string
          id?: string
          paciente_id?: string
          respostas_json?: Json | null
          status?: string
          template_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testes_pacientes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_pacientes_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_pacientes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          agendamento_publico_ativo: boolean | null
          anamnese_template: Json | null
          bairro: string | null
          cartao_bandeira: string | null
          cartao_final: string | null
          cep: string | null
          chave_pix: string | null
          cidade: string | null
          complemento: string | null
          data_proxima_cobranca: string | null
          email: string | null
          endereco_consultorio: string | null
          especialidades_disponiveis: string[] | null
          estado: string | null
          horario_funcionamento: Json | null
          id: string
          lembrete_whatsapp_ativo: boolean | null
          logo_url: string | null
          meta_mensal_consultas: number | null
          nome_consultorio: string | null
          numero: string | null
          onboarding_concluido: boolean | null
          parent_id: string | null
          plano: string | null
          politica_cancelamento: string | null
          portal_settings: Json | null
          pre_consulta_ativa: boolean | null
          preferencias_dashboard: Json | null
          role: string | null
          rua: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          sync_calendarios: Json | null
          telefone_consultorio: string | null
          template_cobranca: string | null
          template_confirmacao: string | null
          template_lembrete: string | null
          template_pre_consulta: string | null
          texto_contrato: string | null
          whatsapp_api_key: string | null
          whatsapp_business_account_id: string | null
          whatsapp_business_phone_id: string | null
          whatsapp_confirmacao_ativa: boolean | null
          whatsapp_tipo: string | null
        }
        Insert: {
          agendamento_publico_ativo?: boolean | null
          anamnese_template?: Json | null
          bairro?: string | null
          cartao_bandeira?: string | null
          cartao_final?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          complemento?: string | null
          data_proxima_cobranca?: string | null
          email?: string | null
          endereco_consultorio?: string | null
          especialidades_disponiveis?: string[] | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id: string
          lembrete_whatsapp_ativo?: boolean | null
          logo_url?: string | null
          meta_mensal_consultas?: number | null
          nome_consultorio?: string | null
          numero?: string | null
          onboarding_concluido?: boolean | null
          parent_id?: string | null
          plano?: string | null
          politica_cancelamento?: string | null
          portal_settings?: Json | null
          pre_consulta_ativa?: boolean | null
          preferencias_dashboard?: Json | null
          role?: string | null
          rua?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          sync_calendarios?: Json | null
          telefone_consultorio?: string | null
          template_cobranca?: string | null
          template_confirmacao?: string | null
          template_lembrete?: string | null
          template_pre_consulta?: string | null
          texto_contrato?: string | null
          whatsapp_api_key?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_business_phone_id?: string | null
          whatsapp_confirmacao_ativa?: boolean | null
          whatsapp_tipo?: string | null
        }
        Update: {
          agendamento_publico_ativo?: boolean | null
          anamnese_template?: Json | null
          bairro?: string | null
          cartao_bandeira?: string | null
          cartao_final?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          complemento?: string | null
          data_proxima_cobranca?: string | null
          email?: string | null
          endereco_consultorio?: string | null
          especialidades_disponiveis?: string[] | null
          estado?: string | null
          horario_funcionamento?: Json | null
          id?: string
          lembrete_whatsapp_ativo?: boolean | null
          logo_url?: string | null
          meta_mensal_consultas?: number | null
          nome_consultorio?: string | null
          numero?: string | null
          onboarding_concluido?: boolean | null
          parent_id?: string | null
          plano?: string | null
          politica_cancelamento?: string | null
          portal_settings?: Json | null
          pre_consulta_ativa?: boolean | null
          preferencias_dashboard?: Json | null
          role?: string | null
          rua?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          sync_calendarios?: Json | null
          telefone_consultorio?: string | null
          template_cobranca?: string | null
          template_confirmacao?: string | null
          template_lembrete?: string | null
          template_pre_consulta?: string | null
          texto_contrato?: string | null
          whatsapp_api_key?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_business_phone_id?: string | null
          whatsapp_confirmacao_ativa?: boolean | null
          whatsapp_tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_patient_contract: { Args: { p_hash: string }; Returns: boolean }
      cancel_appointment_portal: {
        Args: {
          p_agendamento_id: string
          p_hash: string
          p_justificativa: string
        }
        Returns: boolean
      }
      confirm_appointment_portal: {
        Args: { p_agendamento_id: string; p_hash: string }
        Returns: Json
      }
      confirm_plan_upgrade: { Args: { p_plano: string }; Returns: undefined }
      create_public_booking: {
        Args: {
          p_clinic_id: string
          p_data_hora: string
          p_nome: string
          p_telefone: string
        }
        Returns: Json
      }
      get_anamnese_data: { Args: { p_hash: string }; Returns: Json }
      get_clinic_slots: {
        Args: { p_clinic_id: string; p_date: string }
        Returns: Json
      }
      get_patient_portal_data: { Args: { p_hash: string }; Returns: Json }
      get_prescricao_publica: { Args: { p_hash: string }; Returns: Json }
      pay_appointment_portal: {
        Args: { p_agendamento_id: string; p_hash: string }
        Returns: boolean
      }
      request_medical_record: { Args: { p_hash: string }; Returns: boolean }
      submit_patient_test: {
        Args: { p_hash: string; p_respostas: Json; p_teste_id: string }
        Returns: boolean
      }
      update_anamnese: {
        Args: { p_anamnese: Json; p_hash: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: agendamentos
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   usuario_id: uuid (not null)
//   data_hora: timestamp with time zone (not null)
//   status: text (not null, default: 'agendado'::text)
//   especialidade: text (nullable)
//   valor_total: numeric (nullable, default: 0)
//   valor_sinal: numeric (nullable, default: 0)
//   sinal_pago: boolean (nullable, default: false)
//   status_nota_fiscal: text (nullable, default: 'pendente'::text)
//   justificativa_falta: text (nullable)
//   tipo_pagamento: text (nullable, default: 'particular'::text)
//   convenio_id: uuid (nullable)
//   codigo_autorizacao: text (nullable)
//   status_reembolso: text (nullable, default: 'pendente'::text)
//   data_faturamento: date (nullable)
//   is_online: boolean (nullable, default: false)
//   room_id: text (nullable)
//   status_whatsapp_lembrete: text (nullable, default: 'pendente'::text)
//   link_sala_virtual: text (nullable)
//   sala_virtual_token: text (nullable)
//   sala_virtual_token_valid_from: timestamp with time zone (nullable)
//   sala_virtual_token_expires_at: timestamp with time zone (nullable)
// Table: appointments
//   id: uuid (not null, default: gen_random_uuid())
//   patient_name: text (not null)
//   appointment_time: timestamp with time zone (not null)
//   session_value: numeric (not null)
//   status: text (not null, default: 'scheduled'::text)
//   user_id: uuid (nullable)
// Table: avaliacoes
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   agendamento_id: uuid (nullable)
//   nota: integer (nullable)
//   comentario: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: bloqueios_agenda
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data_inicio: timestamp with time zone (not null)
//   data_fim: timestamp with time zone (not null)
//   descricao: text (nullable)
// Table: casos_supervisao
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo_anonimizado: text (not null)
//   descricao_caso: text (not null)
//   area_atuacao: text (nullable)
//   data_criacao: timestamp with time zone (not null, default: now())
//   status: text (not null, default: 'pendente'::text)
// Table: comunicacoes_campanhas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   conteudo: text (not null)
//   data_envio: timestamp with time zone (not null, default: now())
//   tipo: text (not null, default: 'newsletter'::text)
// Table: convenios
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   registro_ans: text (nullable)
//   contato: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: despesas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   descricao: text (not null)
//   valor: numeric (not null, default: 0)
//   data: date (not null)
//   categoria: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: estoque
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome_item: text (not null)
//   quantidade: integer (not null, default: 0)
//   data_atualizacao: timestamp with time zone (nullable, default: now())
//   quantidade_minima: integer (not null, default: 0)
// Table: faturas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data_vencimento: timestamp with time zone (not null)
//   plano: text (not null)
//   valor: numeric (not null)
//   status: text (not null, default: 'pendente'::text)
//   url_recibo: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: financeiro
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   mes: integer (not null)
//   ano: integer (not null)
//   valor_recebido: numeric (not null, default: 0)
//   valor_a_receber: numeric (not null, default: 0)
//   data_atualizacao: timestamp with time zone (not null, default: now())
//   status: text (not null, default: 'pendente'::text)
//   metodo_pagamento: text (nullable)
// Table: historico_cobrancas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   data_envio: timestamp with time zone (not null, default: now())
//   valor_cobrado: numeric (not null)
//   mes_referencia: integer (not null)
//   ano_referencia: integer (not null)
// Table: historico_mensagens
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   tipo: text (not null)
//   conteudo: text (not null)
//   status_envio: text (not null, default: 'enviado'::text)
//   data_envio: timestamp with time zone (not null, default: now())
// Table: laudos
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   usuario_id: uuid (not null)
//   conteudo: text (not null)
//   tipo: text (not null, default: 'psicologico'::text)
//   data_emissao: timestamp with time zone (not null, default: now())
// Table: lista_espera
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   dias_semana: _text (not null)
//   periodos: _text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: logs_auditoria
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   acao: text (not null)
//   tabela_afetada: text (not null)
//   registro_id: uuid (not null)
//   detalhes: jsonb (not null, default: '{}'::jsonb)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: movimentacao_estoque
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   item_id: uuid (not null)
//   quantidade_mudanca: integer (not null)
//   tipo: text (not null)
//   data_movimentacao: timestamp with time zone (not null, default: now())
// Table: notificacoes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   mensagem: text (not null)
//   lida: boolean (not null, default: false)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   cpf: text (nullable)
//   telefone: text (nullable)
//   email: text (nullable)
//   endereco: text (nullable)
//   valor_sessao: numeric (nullable)
//   data_criacao: timestamp with time zone (nullable, default: now())
//   data_nascimento: date (nullable)
//   contato_emergencia_nome: text (nullable)
//   contato_emergencia_telefone: text (nullable)
//   anamnese: jsonb (nullable, default: '{}'::jsonb)
//   hash_anamnese: uuid (nullable, default: gen_random_uuid())
//   cep: text (nullable)
//   rua: text (nullable)
//   numero: text (nullable)
//   complemento: text (nullable)
//   bairro: text (nullable)
//   cidade: text (nullable)
//   estado: text (nullable)
//   frequencia_pagamento: text (nullable, default: 'sessão'::text)
//   dia_pagamento: integer (nullable)
//   contrato_aceito: boolean (nullable, default: false)
//   data_aceite_contrato: timestamp with time zone (nullable)
//   recorrencia: text (nullable, default: 'único'::text)
//   dia_fixo: text (nullable)
//   convenio_id: uuid (nullable)
//   numero_carteira: text (nullable)
//   foto_url: text (nullable)
//   consentimento_lgpd: boolean (nullable, default: false)
//   data_consentimento_lgpd: timestamp with time zone (nullable)
//   tipo_horario: text (nullable, default: 'avulso'::text)
//   horario_fixo: text (nullable)
// Table: pontos_eletronicos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   data: date (not null)
//   entrada: time without time zone (nullable)
//   saida_almoco: time without time zone (nullable)
//   retorno_almoco: time without time zone (nullable)
//   saida: time without time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: prescricoes
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   usuario_id: uuid (not null)
//   conteudo_json: jsonb (not null, default: '[]'::jsonb)
//   hash_verificacao: uuid (not null, default: gen_random_uuid())
//   data_emissao: timestamp with time zone (not null, default: now())
// Table: prontuarios
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   usuario_id: uuid (not null)
//   queixa_principal: text (nullable)
//   historico_sessoes: jsonb (not null, default: '[]'::jsonb)
//   nova_nota: text (nullable, default: ''::text)
// Table: sala_espera
//   id: uuid (not null, default: gen_random_uuid())
//   agendamento_id: uuid (not null)
//   paciente_id: uuid (not null)
//   status: text (not null, default: 'aguardando'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: solicitacoes_rh
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   tipo: text (not null)
//   data_inicio: date (not null)
//   data_fim: date (not null)
//   anexo_url: text (nullable)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: templates_documentos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   conteudo: text (not null)
//   tipo: text (not null, default: 'outro'::text)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: testes_pacientes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   template_id: uuid (not null)
//   status: text (not null, default: 'pendente'::text)
//   respostas_json: jsonb (nullable, default: '{}'::jsonb)
//   data_envio: timestamp with time zone (not null, default: now())
//   data_conclusao: timestamp with time zone (nullable)
// Table: usuarios
//   id: uuid (not null)
//   email: text (nullable)
//   nome_consultorio: text (nullable)
//   chave_pix: text (nullable)
//   template_cobranca: text (nullable)
//   logo_url: text (nullable)
//   anamnese_template: jsonb (nullable, default: '[]'::jsonb)
//   lembrete_whatsapp_ativo: boolean (nullable, default: false)
//   template_lembrete: text (nullable, default: 'Olá [Nome], você tem uma consulta amanhã às [hora].'::text)
//   especialidades_disponiveis: _text (nullable, default: '{}'::text[])
//   preferencias_dashboard: jsonb (nullable, default: '{"show_agenda": true, "show_revenue": true, "show_birthdays": true}'::jsonb)
//   texto_contrato: text (nullable)
//   politica_cancelamento: text (nullable)
//   meta_mensal_consultas: integer (nullable, default: 50)
//   sync_calendarios: jsonb (nullable, default: '{"google": false, "outlook": false}'::jsonb)
//   agendamento_publico_ativo: boolean (nullable, default: false)
//   whatsapp_confirmacao_ativa: boolean (nullable, default: false)
//   template_confirmacao: text (nullable, default: 'Olá [Nome], sua consulta foi agendada para [data] às [hora].'::text)
//   whatsapp_tipo: text (nullable, default: 'personal'::text)
//   pre_consulta_ativa: boolean (nullable, default: false)
//   template_pre_consulta: text (nullable, default: 'Olá [Nome], sua consulta está confirmada para [Data] às [Hora]. O endereço é [Endereco]. Te aguardamos!'::text)
//   endereco_consultorio: text (nullable)
//   telefone_consultorio: text (nullable)
//   horario_funcionamento: jsonb (nullable, default: '[]'::jsonb)
//   role: text (nullable, default: 'admin'::text)
//   parent_id: uuid (nullable)
//   portal_settings: jsonb (nullable, default: '{"show_tests": true, "show_appointments": true, "show_prescriptions": true, "show_medical_records": true}'::jsonb)
//   cep: text (nullable)
//   rua: text (nullable)
//   numero: text (nullable)
//   complemento: text (nullable)
//   bairro: text (nullable)
//   cidade: text (nullable)
//   estado: text (nullable)
//   plano: text (nullable, default: 'gratuito'::text)
//   onboarding_concluido: boolean (nullable, default: false)
//   stripe_customer_id: text (nullable)
//   stripe_subscription_id: text (nullable)
//   data_proxima_cobranca: timestamp with time zone (nullable)
//   cartao_final: text (nullable)
//   cartao_bandeira: text (nullable)
//   whatsapp_api_key: text (nullable)
//   whatsapp_business_phone_id: text (nullable)
//   whatsapp_business_account_id: text (nullable)

// --- CONSTRAINTS ---
// Table: agendamentos
//   FOREIGN KEY agendamentos_convenio_id_fkey: FOREIGN KEY (convenio_id) REFERENCES convenios(id) ON DELETE SET NULL
//   FOREIGN KEY agendamentos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY agendamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agendamentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK valid_status: CHECK ((status = ANY (ARRAY['agendado'::text, 'confirmado'::text, 'compareceu'::text, 'faltou'::text, 'desmarcou'::text])))
// Table: appointments
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_agendamento_id_fkey: FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
//   CHECK avaliacoes_nota_check: CHECK (((nota >= 1) AND (nota <= 5)))
//   FOREIGN KEY avaliacoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
// Table: bloqueios_agenda
//   PRIMARY KEY bloqueios_agenda_pkey: PRIMARY KEY (id)
//   FOREIGN KEY bloqueios_agenda_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: casos_supervisao
//   PRIMARY KEY casos_supervisao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY casos_supervisao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: comunicacoes_campanhas
//   PRIMARY KEY comunicacoes_campanhas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY comunicacoes_campanhas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: convenios
//   PRIMARY KEY convenios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY convenios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: despesas
//   PRIMARY KEY despesas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY despesas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: estoque
//   PRIMARY KEY estoque_pkey: PRIMARY KEY (id)
//   FOREIGN KEY estoque_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: faturas
//   PRIMARY KEY faturas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY faturas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: financeiro
//   FOREIGN KEY financeiro_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY financeiro_pkey: PRIMARY KEY (id)
//   FOREIGN KEY financeiro_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   UNIQUE financeiro_usuario_paciente_mes_ano_key: UNIQUE (usuario_id, paciente_id, mes, ano)
// Table: historico_cobrancas
//   FOREIGN KEY historico_cobrancas_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY historico_cobrancas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_cobrancas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: historico_mensagens
//   FOREIGN KEY historico_mensagens_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY historico_mensagens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_mensagens_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: laudos
//   FOREIGN KEY laudos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY laudos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY laudos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: lista_espera
//   FOREIGN KEY lista_espera_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY lista_espera_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lista_espera_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: logs_auditoria
//   PRIMARY KEY logs_auditoria_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_auditoria_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: movimentacao_estoque
//   FOREIGN KEY movimentacao_estoque_item_id_fkey: FOREIGN KEY (item_id) REFERENCES estoque(id) ON DELETE CASCADE
//   PRIMARY KEY movimentacao_estoque_pkey: PRIMARY KEY (id)
//   CHECK movimentacao_estoque_tipo_check: CHECK ((tipo = ANY (ARRAY['entrada'::text, 'saida'::text])))
//   FOREIGN KEY movimentacao_estoque_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: notificacoes
//   PRIMARY KEY notificacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: pacientes
//   FOREIGN KEY pacientes_convenio_id_fkey: FOREIGN KEY (convenio_id) REFERENCES convenios(id) ON DELETE SET NULL
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: pontos_eletronicos
//   PRIMARY KEY pontos_eletronicos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pontos_eletronicos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: prescricoes
//   FOREIGN KEY prescricoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY prescricoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY prescricoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: prontuarios
//   FOREIGN KEY prontuarios_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   UNIQUE prontuarios_paciente_id_key: UNIQUE (paciente_id)
//   PRIMARY KEY prontuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY prontuarios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: sala_espera
//   FOREIGN KEY sala_espera_agendamento_id_fkey: FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE
//   UNIQUE sala_espera_agendamento_id_key: UNIQUE (agendamento_id)
//   FOREIGN KEY sala_espera_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY sala_espera_pkey: PRIMARY KEY (id)
//   CHECK sala_espera_status_check: CHECK ((status = ANY (ARRAY['aguardando'::text, 'aprovado'::text, 'rejeitado'::text, 'finalizado'::text])))
// Table: solicitacoes_rh
//   PRIMARY KEY solicitacoes_rh_pkey: PRIMARY KEY (id)
//   CHECK solicitacoes_rh_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'aprovado'::text, 'rejeitado'::text])))
//   CHECK solicitacoes_rh_tipo_check: CHECK ((tipo = ANY (ARRAY['atestado'::text, 'ferias'::text])))
//   FOREIGN KEY solicitacoes_rh_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: templates_documentos
//   PRIMARY KEY templates_documentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY templates_documentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: testes_pacientes
//   FOREIGN KEY testes_pacientes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY testes_pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY testes_pacientes_template_id_fkey: FOREIGN KEY (template_id) REFERENCES templates_documentos(id) ON DELETE CASCADE
//   FOREIGN KEY testes_pacientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES usuarios(id)
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: agendamentos
//   Policy "agendamentos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: appointments
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: avaliacoes
//   Policy "anon_avaliacoes_insert" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "auth_avaliacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "avaliacoes_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "avaliacoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: bloqueios_agenda
//   Policy "bloqueios_agenda_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: casos_supervisao
//   Policy "casos_supervisao_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: comunicacoes_campanhas
//   Policy "campanhas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: convenios
//   Policy "convenios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: despesas
//   Policy "despesas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: estoque
//   Policy "estoque_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: faturas
//   Policy "faturas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: financeiro
//   Policy "financeiro_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: historico_cobrancas
//   Policy "historico_cobrancas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: historico_mensagens
//   Policy "historico_mensagens_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: laudos
//   Policy "laudos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: lista_espera
//   Policy "lista_espera_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: logs_auditoria
//   Policy "logs_auditoria_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: movimentacao_estoque
//   Policy "movimentacao_estoque_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: notificacoes
//   Policy "notificacoes_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//   Policy "notificacoes_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "notificacoes_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//   Policy "notificacoes_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: pacientes
//   Policy "anon_select_pacientes" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "pacientes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: pontos_eletronicos
//   Policy "pontos_eletronicos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: prescricoes
//   Policy "anon_read_prescricao" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "prescricoes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "public_read_prescricao" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: prontuarios
//   Policy "prontuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: sala_espera
//   Policy "Anon insert sala_espera" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Anon select sala_espera" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Anon update sala_espera" (UPDATE, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Auth ALL sala_espera" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: solicitacoes_rh
//   Policy "solicitacoes_rh_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: templates_documentos
//   Policy "templates_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: testes_pacientes
//   Policy "testes_pacientes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: usuarios
//   Policy "anon_read_usuarios" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "usuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
//   Policy "usuarios_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())

// --- DATABASE FUNCTIONS ---
// FUNCTION accept_patient_contract(uuid)
//   CREATE OR REPLACE FUNCTION public.accept_patient_contract(p_hash uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       UPDATE public.pacientes 
//       SET contrato_aceito = true, data_aceite_contrato = NOW() 
//       WHERE hash_anamnese = p_hash;
//       RETURN FOUND;
//   END;
//   $function$
//   
// FUNCTION cancel_appointment_portal(uuid, uuid, text)
//   CREATE OR REPLACE FUNCTION public.cancel_appointment_portal(p_hash uuid, p_agendamento_id uuid, p_justificativa text)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_paciente_id uuid;
//       v_data_hora timestamptz;
//   BEGIN
//       -- Verifica autenticidade do paciente pelo hash
//       SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
//       IF v_paciente_id IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       -- Pega os dados do agendamento
//       SELECT data_hora INTO v_data_hora FROM public.agendamentos 
//       WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
//       
//       IF v_data_hora IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       -- Verifica regra de 24 horas
//       IF v_data_hora < (NOW() + interval '24 hours') THEN
//           RAISE EXCEPTION 'Cancelamento permitido apenas com 24 horas de antecedência.';
//       END IF;
//   
//       -- Atualiza o status e a justificativa
//       UPDATE public.agendamentos 
//       SET status = 'desmarcou', justificativa_falta = p_justificativa 
//       WHERE id = p_agendamento_id;
//       
//       RETURN FOUND;
//   END;
//   $function$
//   
// FUNCTION check_low_stock()
//   CREATE OR REPLACE FUNCTION public.check_low_stock()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.quantidade <= NEW.quantidade_minima AND (OLD.quantidade > OLD.quantidade_minima OR TG_OP = 'INSERT') THEN
//       INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
//       VALUES (NEW.usuario_id, 'Alerta de Estoque Baixo', 'O item ' || NEW.nome_item || ' atingiu o nível crítico (' || NEW.quantidade || '/' || NEW.quantidade_minima || ').');
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION confirm_appointment_portal(uuid, uuid)
//   CREATE OR REPLACE FUNCTION public.confirm_appointment_portal(p_hash uuid, p_agendamento_id uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_paciente record;
//       v_clinica text;
//   BEGIN
//       SELECT p.id, p.usuario_id INTO v_paciente FROM public.pacientes p WHERE p.hash_anamnese = p_hash LIMIT 1;
//       IF v_paciente.id IS NULL THEN
//           RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou paciente não encontrado.');
//       END IF;
//   
//       SELECT nome_consultorio INTO v_clinica FROM public.usuarios WHERE id = v_paciente.usuario_id;
//   
//       UPDATE public.agendamentos
//       SET status = 'confirmado'
//       WHERE id = p_agendamento_id AND paciente_id = v_paciente.id AND status = 'agendado';
//   
//       IF FOUND THEN
//           RETURN jsonb_build_object('success', true, 'consultorio', v_clinica);
//       ELSE
//           RETURN jsonb_build_object('success', false, 'error', 'Agendamento não encontrado, já foi atualizado ou já ocorreu.', 'consultorio', v_clinica);
//       END IF;
//   END;
//   $function$
//   
// FUNCTION confirm_plan_upgrade(text)
//   CREATE OR REPLACE FUNCTION public.confirm_plan_upgrade(p_plano text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     UPDATE public.usuarios SET plano = p_plano WHERE id = auth.uid();
//   END;
//   $function$
//   
// FUNCTION create_public_booking(uuid, text, text, timestamp with time zone)
//   CREATE OR REPLACE FUNCTION public.create_public_booking(p_clinic_id uuid, p_nome text, p_telefone text, p_data_hora timestamp with time zone)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_paciente record;
//     v_agendamento_id UUID;
//   BEGIN
//     SELECT id, hash_anamnese INTO v_paciente FROM public.pacientes
//     WHERE telefone = p_telefone AND usuario_id = p_clinic_id LIMIT 1;
//   
//     IF v_paciente.id IS NULL THEN
//       INSERT INTO public.pacientes (usuario_id, nome, telefone)
//       VALUES (p_clinic_id, p_nome, p_telefone)
//       RETURNING id, hash_anamnese INTO v_paciente;
//     END IF;
//   
//     INSERT INTO public.agendamentos (usuario_id, paciente_id, data_hora, status)
//     VALUES (p_clinic_id, v_paciente.id, p_data_hora, 'agendado')
//     RETURNING id INTO v_agendamento_id;
//   
//     RETURN jsonb_build_object('success', true, 'agendamento_id', v_agendamento_id, 'hash_anamnese', v_paciente.hash_anamnese);
//   END;
//   $function$
//   
// FUNCTION get_anamnese_data(uuid)
//   CREATE OR REPLACE FUNCTION public.get_anamnese_data(p_hash uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_result jsonb;
//   BEGIN
//     SELECT jsonb_build_object(
//       'paciente_nome', p.nome,
//       'anamnese', p.anamnese,
//       'template', u.anamnese_template,
//       'consultorio', u.nome_consultorio
//     ) INTO v_result
//     FROM public.pacientes p
//     JOIN public.usuarios u ON p.usuario_id = u.id
//     WHERE p.hash_anamnese = p_hash LIMIT 1;
//     
//     RETURN COALESCE(v_result, '{}'::jsonb);
//   END;
//   $function$
//   
// FUNCTION get_clinic_slots(uuid, text)
//   CREATE OR REPLACE FUNCTION public.get_clinic_slots(p_clinic_id uuid, p_date text)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_ativo boolean;
//       v_agendamentos jsonb;
//       v_bloqueios jsonb;
//       v_start timestamptz;
//       v_end timestamptz;
//   BEGIN
//       SELECT agendamento_publico_ativo INTO v_ativo
//       FROM public.usuarios
//       WHERE id = p_clinic_id;
//   
//       IF v_ativo IS NOT TRUE THEN
//           RETURN jsonb_build_object('ativo', false);
//       END IF;
//   
//       -- p_date is expected as YYYY-MM-DD
//       v_start := (p_date || ' 00:00:00-03')::timestamptz;
//       v_end := (p_date || ' 23:59:59-03')::timestamptz;
//   
//       SELECT COALESCE(jsonb_agg(jsonb_build_object('data_hora', data_hora)), '[]'::jsonb) INTO v_agendamentos
//       FROM public.agendamentos
//       WHERE usuario_id = p_clinic_id 
//         AND data_hora >= v_start
//         AND data_hora <= v_end
//         AND status != 'desmarcou'
//         AND status != 'faltou';
//   
//       SELECT COALESCE(jsonb_agg(jsonb_build_object('data_inicio', data_inicio, 'data_fim', data_fim)), '[]'::jsonb) INTO v_bloqueios
//       FROM public.bloqueios_agenda
//       WHERE usuario_id = p_clinic_id
//         AND data_inicio >= v_start
//         AND data_inicio <= v_end;
//   
//       RETURN jsonb_build_object('ativo', true, 'agendamentos', v_agendamentos, 'bloqueios', v_bloqueios);
//   END;
//   $function$
//   
// FUNCTION get_patient_portal_data(uuid)
//   CREATE OR REPLACE FUNCTION public.get_patient_portal_data(p_hash uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_result jsonb;
//       v_paciente record;
//       v_agendamentos jsonb := '[]'::jsonb;
//       v_documentos jsonb := '[]'::jsonb;
//       v_laudos jsonb := '[]'::jsonb;
//       v_recibos jsonb := '[]'::jsonb;
//       v_testes jsonb := '[]'::jsonb;
//       v_clinica record;
//       v_past_appointments jsonb := '[]'::jsonb;
//       v_all_past jsonb := '[]'::jsonb;
//       v_portal_settings jsonb;
//   BEGIN
//       SELECT p.id, p.nome, p.cpf, p.usuario_id, p.contrato_aceito, p.data_aceite_contrato INTO v_paciente
//       FROM public.pacientes p
//       WHERE p.hash_anamnese = p_hash LIMIT 1;
//   
//       IF v_paciente.id IS NULL THEN
//           RETURN '{}'::jsonb;
//       END IF;
//   
//       SELECT nome_consultorio, texto_contrato, politica_cancelamento, chave_pix, portal_settings INTO v_clinica 
//       FROM public.usuarios 
//       WHERE id = v_paciente.usuario_id LIMIT 1;
//   
//       v_portal_settings := COALESCE(v_clinica.portal_settings, '{"show_tests": true, "show_appointments": true, "show_prescriptions": true, "show_receipts": true}'::jsonb);
//   
//       IF COALESCE((v_portal_settings->>'show_appointments')::boolean, true) THEN
//           SELECT COALESCE(jsonb_agg(jsonb_build_object(
//               'id', a.id,
//               'data_hora', a.data_hora,
//               'status', a.status,
//               'especialidade', a.especialidade,
//               'valor_total', a.valor_total,
//               'sinal_pago', a.sinal_pago,
//               'is_online', a.is_online,
//               'room_id', a.room_id,
//               'convenio_id', a.convenio_id
//           ) ORDER BY a.data_hora ASC), '[]'::jsonb) INTO v_agendamentos
//           FROM public.agendamentos a
//           WHERE a.paciente_id = v_paciente.id AND a.data_hora >= NOW() AND a.status = 'agendado';
//   
//           SELECT COALESCE(jsonb_agg(jsonb_build_object(
//               'id', a.id,
//               'data_hora', a.data_hora,
//               'especialidade', a.especialidade
//           ) ORDER BY a.data_hora DESC), '[]'::jsonb) INTO v_past_appointments
//           FROM public.agendamentos a
//           LEFT JOIN public.avaliacoes av ON a.id = av.agendamento_id
//           WHERE a.paciente_id = v_paciente.id 
//             AND a.status = 'compareceu'
//             AND a.data_hora < NOW()
//             AND av.id IS NULL
//           LIMIT 1;
//   
//           SELECT COALESCE(jsonb_agg(jsonb_build_object(
//               'id', a.id,
//               'data_hora', a.data_hora,
//               'status', a.status,
//               'especialidade', a.especialidade
//           ) ORDER BY a.data_hora DESC), '[]'::jsonb) INTO v_all_past
//           FROM public.agendamentos a
//           WHERE a.paciente_id = v_paciente.id AND a.status = 'compareceu' AND a.data_hora < NOW();
//       END IF;
//   
//       IF COALESCE((v_portal_settings->>'show_prescriptions')::boolean, true) THEN
//           SELECT COALESCE(jsonb_agg(jsonb_build_object(
//               'id', pr.id,
//               'data_emissao', pr.data_emissao,
//               'hash_verificacao', pr.hash_verificacao,
//               'conteudo_json', pr.conteudo_json,
//               'tipo', 'prescricao'
//           ) ORDER BY pr.data_emissao DESC), '[]'::jsonb) INTO v_documentos
//           FROM public.prescricoes pr
//           WHERE pr.paciente_id = v_paciente.id;
//           
//           SELECT COALESCE(jsonb_agg(jsonb_build_object(
//               'id', l.id,
//               'data_emissao', l.data_emissao,
//               'conteudo', l.conteudo,
//               'tipo', l.tipo
//           ) ORDER BY l.data_emissao DESC), '[]'::jsonb) INTO v_laudos
//           FROM public.laudos l
//           WHERE l.paciente_id = v_paciente.id;
//           
//           v_documentos := v_documentos || v_laudos;
//       END IF;
//   
//       SELECT COALESCE(jsonb_agg(jsonb_build_object(
//           'id', f.id,
//           'mes', f.mes,
//           'ano', f.ano,
//           'valor_recebido', f.valor_recebido,
//           'data_atualizacao', f.data_atualizacao
//       ) ORDER BY f.ano DESC, f.mes DESC), '[]'::jsonb) INTO v_recibos
//       FROM public.financeiro f
//       WHERE f.paciente_id = v_paciente.id AND f.valor_recebido > 0;
//   
//       IF COALESCE((v_portal_settings->>'show_tests')::boolean, true) THEN
//           SELECT COALESCE(jsonb_agg(jsonb_build_object(
//               'id', tp.id,
//               'status', tp.status,
//               'data_envio', tp.data_envio,
//               'titulo', td.titulo,
//               'conteudo', td.conteudo
//           ) ORDER BY tp.data_envio DESC), '[]'::jsonb) INTO v_testes
//           FROM public.testes_pacientes tp
//           JOIN public.templates_documentos td ON tp.template_id = td.id
//           WHERE tp.paciente_id = v_paciente.id;
//       END IF;
//   
//       RETURN jsonb_build_object(
//           'usuario_id', v_paciente.usuario_id,
//           'paciente_id', v_paciente.id,
//           'paciente_nome', v_paciente.nome,
//           'paciente_cpf', v_paciente.cpf,
//           'contrato_aceito', v_paciente.contrato_aceito,
//           'data_aceite_contrato', v_paciente.data_aceite_contrato,
//           'consultorio', v_clinica.nome_consultorio,
//           'chave_pix', v_clinica.chave_pix,
//           'texto_contrato', v_clinica.texto_contrato,
//           'politica_cancelamento', v_clinica.politica_cancelamento,
//           'portal_settings', v_portal_settings,
//           'agendamentos', v_agendamentos,
//           'documentos', v_documentos,
//           'recibos', v_recibos,
//           'pending_survey', v_past_appointments,
//           'past_sessions', v_all_past,
//           'testes', v_testes
//       );
//   END;
//   $function$
//   
// FUNCTION get_prescricao_publica(uuid)
//   CREATE OR REPLACE FUNCTION public.get_prescricao_publica(p_hash uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_result jsonb;
//   BEGIN
//       SELECT jsonb_build_object(
//           'data_emissao', pr.data_emissao,
//           'conteudo', pr.conteudo_json,
//           'paciente_nome', p.nome,
//           'paciente_cpf', p.cpf,
//           'medico_nome', u.nome_consultorio,
//           'medico_email', u.email,
//           'logo_url', u.logo_url,
//           'endereco_consultorio', u.endereco_consultorio,
//           'telefone_consultorio', u.telefone_consultorio
//       ) INTO v_result
//       FROM public.prescricoes pr
//       JOIN public.pacientes p ON pr.paciente_id = p.id
//       JOIN public.usuarios u ON pr.usuario_id = u.id
//       WHERE pr.hash_verificacao = p_hash LIMIT 1;
//       
//       RETURN COALESCE(v_result, '{}'::jsonb);
//   END;
//   $function$
//   
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.usuarios (id, email, nome_consultorio)
//     VALUES (
//       new.id, 
//       new.email,
//       new.raw_user_meta_data->>'nome_consultorio'
//     )
//     ON CONFLICT (id) DO UPDATE SET 
//       email = EXCLUDED.email,
//       nome_consultorio = COALESCE(EXCLUDED.nome_consultorio, public.usuarios.nome_consultorio);
//   
//     -- Seed marketing templates
//     INSERT INTO public.templates_documentos (usuario_id, titulo, conteudo, tipo) VALUES
//     (new.id, 'Saúde e Prevenção', 'Olá [Nome do Paciente],' || E'\n\n' || 'Esperamos que você esteja bem.' || E'\n\n' || 'Cuidar da mente é tão importante quanto cuidar do corpo. Lembre-se de tirar um tempo para você nesta semana.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing'),
//     (new.id, 'Novidades do Consultório', 'Olá [Nome do Paciente],' || E'\n\n' || 'Temos novidades!' || E'\n\n' || 'Agora estamos oferecendo novos horários de atendimento para melhor acomodar sua rotina.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing'),
//     (new.id, 'Lembrete de Acompanhamento', 'Olá [Nome do Paciente],' || E'\n\n' || 'Já faz um tempo desde sua última sessão.' || E'\n\n' || 'Como você está? Se precisar conversar ou agendar um retorno, estamos à disposição.' || E'\n\n' || 'Atenciosamente,' || E'\n' || '[Nome do Consultório]', 'email_marketing');
//   
//     RETURN new;
//   END;
//   $function$
//   
// FUNCTION log_audit_action()
//   CREATE OR REPLACE FUNCTION public.log_audit_action()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user_id UUID;
//     v_details JSONB;
//   BEGIN
//     v_user_id := auth.uid();
//     IF v_user_id IS NULL AND TG_OP != 'DELETE' THEN
//       v_user_id := NEW.usuario_id;
//     ELSIF v_user_id IS NULL AND TG_OP = 'DELETE' THEN
//       v_user_id := OLD.usuario_id;
//     END IF;
//   
//     IF v_user_id IS NULL THEN
//       RETURN NULL;
//     END IF;
//   
//     IF TG_OP = 'INSERT' THEN
//       v_details := jsonb_build_object('new', row_to_json(NEW));
//       INSERT INTO public.logs_auditoria (usuario_id, acao, tabela_afetada, registro_id, detalhes)
//       VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, v_details);
//       RETURN NEW;
//     ELSIF TG_OP = 'UPDATE' THEN
//       v_details := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
//       INSERT INTO public.logs_auditoria (usuario_id, acao, tabela_afetada, registro_id, detalhes)
//       VALUES (v_user_id, TG_OP, TG_TABLE_NAME, NEW.id, v_details);
//       RETURN NEW;
//     ELSIF TG_OP = 'DELETE' THEN
//       v_details := jsonb_build_object('old', row_to_json(OLD));
//       INSERT INTO public.logs_auditoria (usuario_id, acao, tabela_afetada, registro_id, detalhes)
//       VALUES (v_user_id, TG_OP, TG_TABLE_NAME, OLD.id, v_details);
//       RETURN OLD;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//   
// FUNCTION log_stock_movement()
//   CREATE OR REPLACE FUNCTION public.log_stock_movement()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     diff INTEGER;
//     m_tipo TEXT;
//   BEGIN
//     IF TG_OP = 'INSERT' THEN
//       IF NEW.quantidade > 0 THEN
//         INSERT INTO public.movimentacao_estoque (usuario_id, item_id, quantidade_mudanca, tipo)
//         VALUES (NEW.usuario_id, NEW.id, NEW.quantidade, 'entrada');
//       END IF;
//     ELSIF TG_OP = 'UPDATE' THEN
//       diff := NEW.quantidade - OLD.quantidade;
//       IF diff > 0 THEN
//         m_tipo := 'entrada';
//         INSERT INTO public.movimentacao_estoque (usuario_id, item_id, quantidade_mudanca, tipo)
//         VALUES (NEW.usuario_id, NEW.id, diff, m_tipo);
//       ELSIF diff < 0 THEN
//         m_tipo := 'saida';
//         INSERT INTO public.movimentacao_estoque (usuario_id, item_id, quantidade_mudanca, tipo)
//         VALUES (NEW.usuario_id, NEW.id, abs(diff), m_tipo);
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION pay_appointment_portal(uuid, uuid)
//   CREATE OR REPLACE FUNCTION public.pay_appointment_portal(p_hash uuid, p_agendamento_id uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_paciente_id uuid;
//       v_usuario_id uuid;
//       v_agendamento record;
//       v_month integer;
//       v_year integer;
//   BEGIN
//       SELECT id, usuario_id INTO v_paciente_id, v_usuario_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
//       IF v_paciente_id IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       SELECT * INTO v_agendamento FROM public.agendamentos 
//       WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
//   
//       IF v_agendamento.id IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       UPDATE public.agendamentos 
//       SET sinal_pago = true 
//       WHERE id = p_agendamento_id;
//       
//       v_month := EXTRACT(MONTH FROM v_agendamento.data_hora);
//       v_year := EXTRACT(YEAR FROM v_agendamento.data_hora);
//   
//       INSERT INTO public.financeiro (usuario_id, paciente_id, mes, ano, valor_recebido, valor_a_receber)
//       VALUES (v_usuario_id, v_paciente_id, v_month, v_year, v_agendamento.valor_total, 0)
//       ON CONFLICT (usuario_id, paciente_id, mes, ano) 
//       DO UPDATE SET valor_recebido = financeiro.valor_recebido + EXCLUDED.valor_recebido;
//   
//       RETURN FOUND;
//   END;
//   $function$
//   
// FUNCTION request_medical_record(uuid)
//   CREATE OR REPLACE FUNCTION public.request_medical_record(p_hash uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_paciente record;
//   BEGIN
//       SELECT p.id, p.nome, p.usuario_id INTO v_paciente
//       FROM public.pacientes p
//       WHERE p.hash_anamnese = p_hash LIMIT 1;
//   
//       IF v_paciente.id IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
//       VALUES (v_paciente.usuario_id, 'Solicitação de Prontuário', 'O paciente ' || v_paciente.nome || ' solicitou acesso ao seu prontuário médico pelo Portal do Paciente.');
//   
//       RETURN true;
//   END;
//   $function$
//   
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//   
// FUNCTION submit_patient_test(uuid, uuid, jsonb)
//   CREATE OR REPLACE FUNCTION public.submit_patient_test(p_hash uuid, p_teste_id uuid, p_respostas jsonb)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_paciente_id uuid;
//   BEGIN
//       SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
//       IF v_paciente_id IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       UPDATE public.testes_pacientes
//       SET status = 'concluido', respostas_json = p_respostas, data_conclusao = NOW()
//       WHERE id = p_teste_id AND paciente_id = v_paciente_id;
//       
//       RETURN FOUND;
//   END;
//   $function$
//   
// FUNCTION trigger_agendamento_confirmado()
//   CREATE OR REPLACE FUNCTION public.trigger_agendamento_confirmado()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_usuario record;
//       v_paciente record;
//       v_msg text;
//   BEGIN
//       IF NEW.status = 'confirmado' AND OLD.status != 'confirmado' THEN
//           SELECT * INTO v_usuario FROM public.usuarios WHERE id = NEW.usuario_id;
//           IF v_usuario.pre_consulta_ativa = true THEN
//               SELECT * INTO v_paciente FROM public.pacientes WHERE id = NEW.paciente_id;
//               
//               v_msg := REPLACE(v_usuario.template_pre_consulta, '[Nome]', COALESCE(v_paciente.nome, ''));
//               v_msg := REPLACE(v_msg, '[Data]', to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY'));
//               v_msg := REPLACE(v_msg, '[Hora]', to_char(NEW.data_hora AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI'));
//               v_msg := REPLACE(v_msg, '[Endereco]', COALESCE(v_paciente.endereco, 'nosso consultório'));
//               
//               INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
//               VALUES (NEW.usuario_id, 'Mensagem Automática', 'Pré-consulta agendada para ' || COALESCE(v_paciente.nome, ''));
//               
//               INSERT INTO public.historico_mensagens (usuario_id, paciente_id, tipo, conteudo, status_envio)
//               VALUES (NEW.usuario_id, NEW.paciente_id, 'pre_consulta', v_msg, 'enviado');
//           END IF;
//   
//           INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
//           VALUES (NEW.usuario_id, 'Consulta Confirmada', 'O paciente ' || (SELECT nome FROM public.pacientes WHERE id = NEW.paciente_id) || ' confirmou a consulta via portal.');
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_anamnese(uuid, jsonb)
//   CREATE OR REPLACE FUNCTION public.update_anamnese(p_hash uuid, p_anamnese jsonb)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_paciente_id uuid;
//   BEGIN
//     UPDATE public.pacientes SET anamnese = p_anamnese WHERE hash_anamnese = p_hash RETURNING id INTO v_paciente_id;
//     IF v_paciente_id IS NULL THEN
//       RETURN jsonb_build_object('success', false);
//     END IF;
//     RETURN jsonb_build_object('success', true);
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: agendamentos
//   agendamento_confirmado_trigger: CREATE TRIGGER agendamento_confirmado_trigger AFTER UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION trigger_agendamento_confirmado()
//   audit_agendamentos_trigger: CREATE TRIGGER audit_agendamentos_trigger AFTER INSERT OR DELETE OR UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION log_audit_action()
// Table: estoque
//   stock_movement_trigger: CREATE TRIGGER stock_movement_trigger AFTER INSERT OR UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION log_stock_movement()
//   trigger_check_low_stock: CREATE TRIGGER trigger_check_low_stock AFTER INSERT OR UPDATE OF quantidade, quantidade_minima ON public.estoque FOR EACH ROW EXECUTE FUNCTION check_low_stock()
// Table: financeiro
//   audit_financeiro_trigger: CREATE TRIGGER audit_financeiro_trigger AFTER INSERT OR DELETE OR UPDATE ON public.financeiro FOR EACH ROW EXECUTE FUNCTION log_audit_action()
// Table: laudos
//   audit_laudos_trigger: CREATE TRIGGER audit_laudos_trigger AFTER INSERT OR DELETE OR UPDATE ON public.laudos FOR EACH ROW EXECUTE FUNCTION log_audit_action()

// --- INDEXES ---
// Table: financeiro
//   CREATE UNIQUE INDEX financeiro_usuario_paciente_mes_ano_key ON public.financeiro USING btree (usuario_id, paciente_id, mes, ano)
// Table: prontuarios
//   CREATE UNIQUE INDEX prontuarios_paciente_id_key ON public.prontuarios USING btree (paciente_id)
// Table: sala_espera
//   CREATE UNIQUE INDEX sala_espera_agendamento_id_key ON public.sala_espera USING btree (agendamento_id)

