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
          confirmacao_paciente: string | null
          convenio_id: string | null
          data_faturamento: string | null
          data_hora: string
          especialidade: string | null
          id: string
          is_online: boolean | null
          justificativa_falta: string | null
          link_sala_virtual: string | null
          motivo_cancelamento: string | null
          paciente_id: string
          risco_cancelamento: string | null
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
          confirmacao_paciente?: string | null
          convenio_id?: string | null
          data_faturamento?: string | null
          data_hora: string
          especialidade?: string | null
          id?: string
          is_online?: boolean | null
          justificativa_falta?: string | null
          link_sala_virtual?: string | null
          motivo_cancelamento?: string | null
          paciente_id: string
          risco_cancelamento?: string | null
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
          confirmacao_paciente?: string | null
          convenio_id?: string | null
          data_faturamento?: string | null
          data_hora?: string
          especialidade?: string | null
          id?: string
          is_online?: boolean | null
          justificativa_falta?: string | null
          link_sala_virtual?: string | null
          motivo_cancelamento?: string | null
          paciente_id?: string
          risco_cancelamento?: string | null
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
      atividades: {
        Row: {
          contato_id: string | null
          created_at: string
          data_agendada: string | null
          data_conclusao: string | null
          descricao: string | null
          empresa_id: string | null
          google_event_id: string | null
          id: string
          oportunidade_id: string | null
          responsavel_id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          contato_id?: string | null
          created_at?: string
          data_agendada?: string | null
          data_conclusao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          google_event_id?: string | null
          id?: string
          oportunidade_id?: string | null
          responsavel_id: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          contato_id?: string | null
          created_at?: string
          data_agendada?: string | null
          data_conclusao?: string | null
          descricao?: string | null
          empresa_id?: string | null
          google_event_id?: string | null
          id?: string
          oportunidade_id?: string | null
          responsavel_id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
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
      campos_personalizados: {
        Row: {
          ativo: boolean | null
          created_at: string
          empresa_id: string | null
          entidade: string
          id: string
          nome: string
          obrigatorio: boolean | null
          opcoes: Json | null
          tipo: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          empresa_id?: string | null
          entidade: string
          id?: string
          nome: string
          obrigatorio?: boolean | null
          opcoes?: Json | null
          tipo: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          empresa_id?: string | null
          entidade?: string
          id?: string
          nome?: string
          obrigatorio?: boolean | null
          opcoes?: Json | null
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campos_personalizados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campos_personalizados_usuario_id_fkey"
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
      consultores: {
        Row: {
          ativo: boolean | null
          created_at: string
          especialidade: string | null
          id: string
          nome: string
          taxa_horaria_junior: number | null
          taxa_horaria_pleno: number | null
          taxa_horaria_senior: number | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          especialidade?: string | null
          id?: string
          nome: string
          taxa_horaria_junior?: number | null
          taxa_horaria_pleno?: number | null
          taxa_horaria_senior?: number | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          especialidade?: string | null
          id?: string
          nome?: string
          taxa_horaria_junior?: number | null
          taxa_horaria_pleno?: number | null
          taxa_horaria_senior?: number | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultores_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos: {
        Row: {
          cargo: string | null
          created_at: string
          email: string | null
          empresa_id: string | null
          id: string
          linkedin: string | null
          nome: string
          notas: string | null
          telefone: string | null
          updated_at: string
          usuario_id: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          linkedin?: string | null
          nome: string
          notas?: string | null
          telefone?: string | null
          updated_at?: string
          usuario_id: string
        }
        Update: {
          cargo?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string | null
          id?: string
          linkedin?: string | null
          nome?: string
          notas?: string | null
          telefone?: string | null
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatos_usuario_id_fkey"
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
      custos_operacionais: {
        Row: {
          descricao: string | null
          id: string
          proposta_id: string
          tipo: string
          valor: number
        }
        Insert: {
          descricao?: string | null
          id?: string
          proposta_id: string
          tipo: string
          valor?: number
        }
        Update: {
          descricao?: string | null
          id?: string
          proposta_id?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "custos_operacionais_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
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
      documentos: {
        Row: {
          caminho_storage: string
          created_at: string
          data_upload: string
          id: string
          nome_arquivo: string
          proposta_id: string | null
          tamanho_bytes: number
          tipo: string
          usuario_id: string
        }
        Insert: {
          caminho_storage: string
          created_at?: string
          data_upload?: string
          id?: string
          nome_arquivo: string
          proposta_id?: string | null
          tamanho_bytes: number
          tipo: string
          usuario_id: string
        }
        Update: {
          caminho_storage?: string
          created_at?: string
          data_upload?: string
          id?: string
          nome_arquivo?: string
          proposta_id?: string | null
          tamanho_bytes?: number
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      emails_automacao: {
        Row: {
          assunto: string
          corpo: string
          destinatario: string
          enviado_em: string
          fluxo_id: string
          id: string
          usuario_id: string
        }
        Insert: {
          assunto: string
          corpo: string
          destinatario: string
          enviado_em?: string
          fluxo_id: string
          id?: string
          usuario_id: string
        }
        Update: {
          assunto?: string
          corpo?: string
          destinatario?: string
          enviado_em?: string
          fluxo_id?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_automacao_fluxo_id_fkey"
            columns: ["fluxo_id"]
            isOneToOne: false
            referencedRelation: "fluxos_automacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_automacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      emails_propostas: {
        Row: {
          assunto: string
          data_envio: string
          email_destinatario: string
          email_id_resend: string | null
          id: string
          proposta_id: string
          status: string
        }
        Insert: {
          assunto: string
          data_envio?: string
          email_destinatario: string
          email_id_resend?: string | null
          id?: string
          proposta_id: string
          status?: string
        }
        Update: {
          assunto?: string
          data_envio?: string
          email_destinatario?: string
          email_id_resend?: string | null
          id?: string
          proposta_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_propostas_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          num_funcionarios: number | null
          setor: string | null
          telefone: string | null
          updated_at: string
          usuario_id: string
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          num_funcionarios?: number | null
          setor?: string | null
          telefone?: string | null
          updated_at?: string
          usuario_id: string
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          num_funcionarios?: number | null
          setor?: string | null
          telefone?: string | null
          updated_at?: string
          usuario_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_usuario_id_fkey"
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
      fluxos_automacao: {
        Row: {
          acao: string
          ativo: boolean
          created_at: string
          detalhes_acao: Json
          empresa_id: string | null
          gatilho: string
          id: string
          nome: string
          usuario_id: string
        }
        Insert: {
          acao: string
          ativo?: boolean
          created_at?: string
          detalhes_acao?: Json
          empresa_id?: string | null
          gatilho: string
          id?: string
          nome: string
          usuario_id: string
        }
        Update: {
          acao?: string
          ativo?: boolean
          created_at?: string
          detalhes_acao?: Json
          empresa_id?: string | null
          gatilho?: string
          id?: string
          nome?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fluxos_automacao_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxos_automacao_usuario_id_fkey"
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
      historico_oportunidades: {
        Row: {
          created_at: string
          estagio_anterior: string | null
          estagio_novo: string
          id: string
          oportunidade_id: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          estagio_anterior?: string | null
          estagio_novo: string
          id?: string
          oportunidade_id: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          estagio_anterior?: string | null
          estagio_novo?: string
          id?: string
          oportunidade_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_oportunidades_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_propostas: {
        Row: {
          acao: string
          data_acao: string
          id: string
          proposta_id: string
          usuario_id: string
        }
        Insert: {
          acao: string
          data_acao?: string
          id?: string
          proposta_id: string
          usuario_id: string
        }
        Update: {
          acao?: string
          data_acao?: string
          id?: string
          proposta_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_propostas_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_propostas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      hoteis_regioes: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          regiao: string
          updated_at: string
          usuario_id: string
          valor_diaria_economica: number | null
          valor_diaria_media: number | null
          valor_diaria_premium: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          regiao: string
          updated_at?: string
          usuario_id: string
          valor_diaria_economica?: number | null
          valor_diaria_media?: number | null
          valor_diaria_premium?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          regiao?: string
          updated_at?: string
          usuario_id?: string
          valor_diaria_economica?: number | null
          valor_diaria_media?: number | null
          valor_diaria_premium?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hoteis_regioes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      integracao_usuarios: {
        Row: {
          access_token: string
          ativo: boolean | null
          created_at: string | null
          data_expiracao: string | null
          id: string
          provedor: string
          refresh_token: string | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          access_token: string
          ativo?: boolean | null
          created_at?: string | null
          data_expiracao?: string | null
          id?: string
          provedor: string
          refresh_token?: string | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          access_token?: string
          ativo?: boolean | null
          created_at?: string | null
          data_expiracao?: string | null
          id?: string
          provedor?: string
          refresh_token?: string | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      itens_proposta: {
        Row: {
          descricao: string | null
          id: string
          proposta_id: string
          quantidade: number
          subtotal: number | null
          tipo_servico: string
          valor_unitario: number
        }
        Insert: {
          descricao?: string | null
          id?: string
          proposta_id: string
          quantidade?: number
          subtotal?: number | null
          tipo_servico: string
          valor_unitario?: number
        }
        Update: {
          descricao?: string | null
          id?: string
          proposta_id?: string
          quantidade?: number
          subtotal?: number | null
          tipo_servico?: string
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_proposta_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
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
      log_whatsapp: {
        Row: {
          created_at: string | null
          erro: string | null
          id: string
          mensagem: string
          status: string
          telefone: string
          tentativas: number | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          erro?: string | null
          id?: string
          mensagem: string
          status: string
          telefone: string
          tentativas?: number | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          erro?: string | null
          id?: string
          mensagem?: string
          status?: string
          telefone?: string
          tentativas?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_whatsapp_usuario_id_fkey"
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
      logs_execucao_automacao: {
        Row: {
          created_at: string
          detalhes: Json
          fluxo_id: string
          id: string
          status: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          detalhes?: Json
          fluxo_id: string
          id?: string
          status: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          detalhes?: Json
          fluxo_id?: string
          id?: string
          status?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_execucao_automacao_fluxo_id_fkey"
            columns: ["fluxo_id"]
            isOneToOne: false
            referencedRelation: "fluxos_automacao"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
          usuario_id: string
          valor_unitario: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          usuario_id: string
          valor_unitario?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          usuario_id?: string
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_usuario_id_fkey"
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
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          data_criacao?: string
          id?: string
          lida?: boolean
          mensagem: string
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          data_criacao?: string
          id?: string
          lida?: boolean
          mensagem?: string
          tipo?: string | null
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
      oportunidades: {
        Row: {
          contato_id: string | null
          created_at: string
          data_fechamento_prevista: string | null
          descricao: string | null
          empresa_id: string | null
          estagio: string
          id: string
          nome: string
          notas_internas: string | null
          probabilidade_percentual: number | null
          responsavel_id: string
          updated_at: string
          valor_estimado: number | null
        }
        Insert: {
          contato_id?: string | null
          created_at?: string
          data_fechamento_prevista?: string | null
          descricao?: string | null
          empresa_id?: string | null
          estagio?: string
          id?: string
          nome: string
          notas_internas?: string | null
          probabilidade_percentual?: number | null
          responsavel_id: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Update: {
          contato_id?: string | null
          created_at?: string
          data_fechamento_prevista?: string | null
          descricao?: string | null
          empresa_id?: string | null
          estagio?: string
          id?: string
          nome?: string
          notas_internas?: string | null
          probabilidade_percentual?: number | null
          responsavel_id?: string
          updated_at?: string
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_responsavel_id_fkey"
            columns: ["responsavel_id"]
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
      parametros_financeiros: {
        Row: {
          ativo: boolean | null
          chave: string
          created_at: string
          descricao: string | null
          id: string
          tipo: string | null
          updated_at: string
          usuario_id: string
          valor: string | null
        }
        Insert: {
          ativo?: boolean | null
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string
          usuario_id: string
          valor?: string | null
        }
        Update: {
          ativo?: boolean | null
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string | null
          updated_at?: string
          usuario_id?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametros_financeiros_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      per_diem_regioes: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          regiao: string
          updated_at: string
          usuario_id: string
          valor_diario: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          regiao: string
          updated_at?: string
          usuario_id: string
          valor_diario?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          regiao?: string
          updated_at?: string
          usuario_id?: string
          valor_diario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "per_diem_regioes_usuario_id_fkey"
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
      propostas: {
        Row: {
          comentarios_cliente: string | null
          condicoes_pagamento: string | null
          contato_id: string | null
          created_at: string
          data_emissao: string
          data_validade: string | null
          empresa_id: string | null
          id: string
          notas_internas: string | null
          numero_proposta: string | null
          oportunidade_id: string | null
          responsavel_id: string
          status: string
          status_nf: string | null
          updated_at: string
          valor_total: number
        }
        Insert: {
          comentarios_cliente?: string | null
          condicoes_pagamento?: string | null
          contato_id?: string | null
          created_at?: string
          data_emissao?: string
          data_validade?: string | null
          empresa_id?: string | null
          id?: string
          notas_internas?: string | null
          numero_proposta?: string | null
          oportunidade_id?: string | null
          responsavel_id: string
          status?: string
          status_nf?: string | null
          updated_at?: string
          valor_total?: number
        }
        Update: {
          comentarios_cliente?: string | null
          condicoes_pagamento?: string | null
          contato_id?: string | null
          created_at?: string
          data_emissao?: string
          data_validade?: string | null
          empresa_id?: string | null
          id?: string
          notas_internas?: string | null
          numero_proposta?: string | null
          oportunidade_id?: string | null
          responsavel_id?: string
          status?: string
          status_nf?: string | null
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas_versoes: {
        Row: {
          created_at: string
          dados: Json
          id: string
          proposta_id: string
          resumo_mudancas: string | null
          usuario_id: string | null
          versao: number
        }
        Insert: {
          created_at?: string
          dados: Json
          id?: string
          proposta_id: string
          resumo_mudancas?: string | null
          usuario_id?: string | null
          versao: number
        }
        Update: {
          created_at?: string
          dados?: Json
          id?: string
          proposta_id?: string
          resumo_mudancas?: string | null
          usuario_id?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "propostas_versoes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      rotas_aereas: {
        Row: {
          ativo: boolean | null
          created_at: string
          destino: string
          id: string
          origem: string
          tempo_voo: string | null
          updated_at: string
          usuario_id: string
          valor_passagem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          destino: string
          id?: string
          origem: string
          tempo_voo?: string | null
          updated_at?: string
          usuario_id: string
          valor_passagem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          destino?: string
          id?: string
          origem?: string
          tempo_voo?: string | null
          updated_at?: string
          usuario_id?: string
          valor_passagem?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rotas_aereas_usuario_id_fkey"
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
      testes_psicologicos: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          nome: string
          tempo_aplicacao: string | null
          updated_at: string
          usuario_id: string
          valor_unitario: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome: string
          tempo_aplicacao?: string | null
          updated_at?: string
          usuario_id: string
          valor_unitario?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          nome?: string
          tempo_aplicacao?: string | null
          updated_at?: string
          usuario_id?: string
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_psicologicos_usuario_id_fkey"
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
          created_at: string | null
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
          nome: string | null
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
          created_at?: string | null
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
          nome?: string | null
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
          created_at?: string | null
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
          nome?: string | null
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
      valores_campos_personalizados: {
        Row: {
          campo_id: string
          created_at: string
          id: string
          registro_id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          campo_id: string
          created_at?: string
          id?: string
          registro_id: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          campo_id?: string
          created_at?: string
          id?: string
          registro_id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "valores_campos_personalizados_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_personalizados"
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
      get_public_proposal: { Args: { p_proposta_id: string }; Returns: Json }
      get_tenant_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      pay_appointment_portal: {
        Args: { p_agendamento_id: string; p_hash: string }
        Returns: boolean
      }
      request_medical_record: { Args: { p_hash: string }; Returns: boolean }
      respond_public_proposal: {
        Args: { p_comentario: string; p_proposta_id: string; p_status: string }
        Returns: boolean
      }
      snapshot_proposta: {
        Args: { p_proposta_id: string; p_resumo: string; p_usuario_id: string }
        Returns: string
      }
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
//   motivo_cancelamento: text (nullable)
//   confirmacao_paciente: text (nullable)
//   risco_cancelamento: text (nullable, default: 'baixo'::text)
// Table: appointments
//   id: uuid (not null, default: gen_random_uuid())
//   patient_name: text (not null)
//   appointment_time: timestamp with time zone (not null)
//   session_value: numeric (not null)
//   status: text (not null, default: 'scheduled'::text)
//   user_id: uuid (nullable)
// Table: atividades
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null)
//   titulo: text (not null)
//   descricao: text (nullable)
//   data_agendada: timestamp with time zone (nullable)
//   data_conclusao: timestamp with time zone (nullable)
//   status: text (not null, default: 'Agendada'::text)
//   empresa_id: uuid (nullable)
//   contato_id: uuid (nullable)
//   oportunidade_id: uuid (nullable)
//   responsavel_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   google_event_id: text (nullable)
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
// Table: campos_personalizados
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   entidade: text (not null)
//   nome: text (not null)
//   tipo: text (not null)
//   opcoes: jsonb (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   empresa_id: uuid (nullable)
//   obrigatorio: boolean (nullable, default: false)
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
// Table: consultores
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   especialidade: text (nullable)
//   taxa_horaria_junior: numeric (nullable, default: 0)
//   taxa_horaria_pleno: numeric (nullable, default: 0)
//   taxa_horaria_senior: numeric (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: contatos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   cargo: text (nullable)
//   email: text (nullable)
//   telefone: text (nullable)
//   linkedin: text (nullable)
//   empresa_id: uuid (nullable)
//   notas: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: convenios
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   registro_ans: text (nullable)
//   contato: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: custos_operacionais
//   id: uuid (not null, default: gen_random_uuid())
//   proposta_id: uuid (not null)
//   tipo: text (not null)
//   descricao: text (nullable)
//   valor: numeric (not null, default: 0)
// Table: despesas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   descricao: text (not null)
//   valor: numeric (not null, default: 0)
//   data: date (not null)
//   categoria: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: documentos
//   id: uuid (not null, default: gen_random_uuid())
//   proposta_id: uuid (nullable)
//   tipo: text (not null)
//   nome_arquivo: text (not null)
//   caminho_storage: text (not null)
//   tamanho_bytes: bigint (not null)
//   data_upload: timestamp with time zone (not null, default: now())
//   usuario_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: emails_automacao
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   fluxo_id: uuid (not null)
//   destinatario: text (not null)
//   assunto: text (not null)
//   corpo: text (not null)
//   enviado_em: timestamp with time zone (not null, default: now())
// Table: emails_propostas
//   id: uuid (not null, default: gen_random_uuid())
//   proposta_id: uuid (not null)
//   email_destinatario: text (not null)
//   assunto: text (not null)
//   data_envio: timestamp with time zone (not null, default: now())
//   status: text (not null, default: 'Enviado'::text)
//   email_id_resend: text (nullable)
// Table: empresas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   cnpj: text (nullable)
//   setor: text (nullable)
//   endereco: text (nullable)
//   website: text (nullable)
//   num_funcionarios: integer (nullable, default: 0)
//   email: text (nullable)
//   telefone: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
// Table: fluxos_automacao
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   gatilho: text (not null)
//   acao: text (not null)
//   empresa_id: uuid (nullable)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   detalhes_acao: jsonb (not null, default: '{}'::jsonb)
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
// Table: historico_oportunidades
//   id: uuid (not null, default: gen_random_uuid())
//   oportunidade_id: uuid (not null)
//   usuario_id: uuid (not null)
//   estagio_anterior: text (nullable)
//   estagio_novo: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: historico_propostas
//   id: uuid (not null, default: gen_random_uuid())
//   proposta_id: uuid (not null)
//   acao: text (not null)
//   data_acao: timestamp with time zone (not null, default: now())
//   usuario_id: uuid (not null)
// Table: hoteis_regioes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   regiao: text (not null)
//   valor_diaria_economica: numeric (nullable, default: 0)
//   valor_diaria_media: numeric (nullable, default: 0)
//   valor_diaria_premium: numeric (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: integracao_usuarios
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   provedor: text (not null)
//   access_token: text (not null)
//   refresh_token: text (nullable)
//   data_expiracao: timestamp with time zone (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: itens_proposta
//   id: uuid (not null, default: gen_random_uuid())
//   proposta_id: uuid (not null)
//   tipo_servico: text (not null)
//   descricao: text (nullable)
//   quantidade: numeric (not null, default: 1)
//   valor_unitario: numeric (not null, default: 0)
//   subtotal: numeric (nullable)
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
// Table: log_whatsapp
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (nullable)
//   telefone: text (not null)
//   mensagem: text (not null)
//   status: text (not null)
//   tentativas: integer (nullable, default: 1)
//   erro: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: logs_auditoria
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   acao: text (not null)
//   tabela_afetada: text (not null)
//   registro_id: uuid (not null)
//   detalhes: jsonb (not null, default: '{}'::jsonb)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: logs_execucao_automacao
//   id: uuid (not null, default: gen_random_uuid())
//   fluxo_id: uuid (not null)
//   usuario_id: uuid (not null)
//   status: text (not null)
//   detalhes: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: materiais
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   valor_unitario: numeric (nullable, default: 0)
//   categoria: text (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
//   tipo: text (nullable, default: 'sistema'::text)
// Table: oportunidades
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   empresa_id: uuid (nullable)
//   contato_id: uuid (nullable)
//   valor_estimado: numeric (nullable, default: 0)
//   data_fechamento_prevista: date (nullable)
//   probabilidade_percentual: integer (nullable, default: 0)
//   estagio: text (not null, default: 'Prospecção'::text)
//   responsavel_id: uuid (not null)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   notas_internas: text (nullable)
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
// Table: parametros_financeiros
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   chave: text (not null)
//   valor: text (nullable)
//   descricao: text (nullable)
//   tipo: text (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: per_diem_regioes
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   regiao: text (not null)
//   valor_diario: numeric (nullable, default: 0)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
// Table: propostas
//   id: uuid (not null, default: gen_random_uuid())
//   numero_proposta: text (nullable)
//   empresa_id: uuid (nullable)
//   contato_id: uuid (nullable)
//   oportunidade_id: uuid (nullable)
//   status: text (not null, default: 'Rascunho'::text)
//   valor_total: numeric (not null, default: 0)
//   data_emissao: date (not null, default: CURRENT_DATE)
//   data_validade: date (nullable)
//   responsavel_id: uuid (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   notas_internas: text (nullable)
//   condicoes_pagamento: text (nullable)
//   status_nf: text (nullable, default: 'Pendente'::text)
//   comentarios_cliente: text (nullable)
// Table: propostas_versoes
//   id: uuid (not null, default: gen_random_uuid())
//   proposta_id: uuid (not null)
//   versao: integer (not null)
//   dados: jsonb (not null)
//   resumo_mudancas: text (nullable)
//   usuario_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: rotas_aereas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   origem: text (not null)
//   destino: text (not null)
//   valor_passagem: numeric (nullable, default: 0)
//   tempo_voo: text (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
// Table: testes_psicologicos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome: text (not null)
//   valor_unitario: numeric (nullable, default: 0)
//   tempo_aplicacao: text (nullable)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
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
//   nome: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: valores_campos_personalizados
//   id: uuid (not null, default: gen_random_uuid())
//   campo_id: uuid (not null)
//   registro_id: uuid (not null)
//   valor: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())

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
// Table: atividades
//   FOREIGN KEY atividades_contato_id_fkey: FOREIGN KEY (contato_id) REFERENCES contatos(id) ON DELETE SET NULL
//   FOREIGN KEY atividades_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
//   FOREIGN KEY atividades_oportunidade_id_fkey: FOREIGN KEY (oportunidade_id) REFERENCES oportunidades(id) ON DELETE CASCADE
//   PRIMARY KEY atividades_pkey: PRIMARY KEY (id)
//   FOREIGN KEY atividades_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK atividades_status_check: CHECK ((status = ANY (ARRAY['Agendada'::text, 'Concluída'::text, 'Cancelada'::text])))
//   CHECK atividades_tipo_check: CHECK ((tipo = ANY (ARRAY['Ligação'::text, 'Email'::text, 'Reunião'::text, 'Tarefa Interna'::text, 'Acompanhamento'::text])))
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_agendamento_id_fkey: FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
//   CHECK avaliacoes_nota_check: CHECK (((nota >= 1) AND (nota <= 5)))
//   FOREIGN KEY avaliacoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
// Table: bloqueios_agenda
//   PRIMARY KEY bloqueios_agenda_pkey: PRIMARY KEY (id)
//   FOREIGN KEY bloqueios_agenda_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: campos_personalizados
//   FOREIGN KEY campos_personalizados_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   PRIMARY KEY campos_personalizados_pkey: PRIMARY KEY (id)
//   FOREIGN KEY campos_personalizados_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: casos_supervisao
//   PRIMARY KEY casos_supervisao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY casos_supervisao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: comunicacoes_campanhas
//   PRIMARY KEY comunicacoes_campanhas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY comunicacoes_campanhas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: consultores
//   PRIMARY KEY consultores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY consultores_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: contatos
//   FOREIGN KEY contatos_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   PRIMARY KEY contatos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contatos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: convenios
//   PRIMARY KEY convenios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY convenios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: custos_operacionais
//   PRIMARY KEY custos_operacionais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY custos_operacionais_proposta_id_fkey: FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE
//   CHECK custos_operacionais_tipo_check: CHECK ((tipo = ANY (ARRAY['Deslocamento'::text, 'Hospedagem'::text, 'Alimentação'::text, 'Testes'::text, 'Materiais'::text])))
// Table: despesas
//   PRIMARY KEY despesas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY despesas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: documentos
//   PRIMARY KEY documentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY documentos_proposta_id_fkey: FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE
//   FOREIGN KEY documentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: emails_automacao
//   FOREIGN KEY emails_automacao_fluxo_id_fkey: FOREIGN KEY (fluxo_id) REFERENCES fluxos_automacao(id) ON DELETE CASCADE
//   PRIMARY KEY emails_automacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY emails_automacao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: emails_propostas
//   PRIMARY KEY emails_propostas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY emails_propostas_proposta_id_fkey: FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE
// Table: empresas
//   PRIMARY KEY empresas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY empresas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
// Table: fluxos_automacao
//   CHECK fluxos_automacao_acao_check: CHECK ((acao = ANY (ARRAY['Enviar Email'::text, 'Criar Tarefa'::text, 'Atualizar Campo'::text, 'Enviar Webhook'::text])))
//   FOREIGN KEY fluxos_automacao_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   CHECK fluxos_automacao_gatilho_check: CHECK ((gatilho = ANY (ARRAY['Nova Empresa Criada'::text, 'Contato Criado'::text, 'Oportunidade Criada'::text, 'Oportunidade Ganha'::text, 'Proposta Aceita'::text, 'Proposta Rejeitada'::text, 'Proposta Aguardando NF'::text])))
//   PRIMARY KEY fluxos_automacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY fluxos_automacao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: historico_cobrancas
//   FOREIGN KEY historico_cobrancas_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY historico_cobrancas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_cobrancas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: historico_mensagens
//   FOREIGN KEY historico_mensagens_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY historico_mensagens_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_mensagens_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: historico_oportunidades
//   FOREIGN KEY historico_oportunidades_oportunidade_id_fkey: FOREIGN KEY (oportunidade_id) REFERENCES oportunidades(id) ON DELETE CASCADE
//   PRIMARY KEY historico_oportunidades_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_oportunidades_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: historico_propostas
//   PRIMARY KEY historico_propostas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_propostas_proposta_id_fkey: FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE
//   FOREIGN KEY historico_propostas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: hoteis_regioes
//   PRIMARY KEY hoteis_regioes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY hoteis_regioes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: integracao_usuarios
//   PRIMARY KEY integracao_usuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY integracao_usuarios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE integracao_usuarios_usuario_id_provedor_key: UNIQUE (usuario_id, provedor)
// Table: itens_proposta
//   PRIMARY KEY itens_proposta_pkey: PRIMARY KEY (id)
//   FOREIGN KEY itens_proposta_proposta_id_fkey: FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE
// Table: laudos
//   FOREIGN KEY laudos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY laudos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY laudos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: lista_espera
//   FOREIGN KEY lista_espera_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY lista_espera_pkey: PRIMARY KEY (id)
//   FOREIGN KEY lista_espera_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: log_whatsapp
//   PRIMARY KEY log_whatsapp_pkey: PRIMARY KEY (id)
//   FOREIGN KEY log_whatsapp_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: logs_auditoria
//   PRIMARY KEY logs_auditoria_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_auditoria_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: logs_execucao_automacao
//   FOREIGN KEY logs_execucao_automacao_fluxo_id_fkey: FOREIGN KEY (fluxo_id) REFERENCES fluxos_automacao(id) ON DELETE CASCADE
//   PRIMARY KEY logs_execucao_automacao_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_execucao_automacao_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: materiais
//   PRIMARY KEY materiais_pkey: PRIMARY KEY (id)
//   FOREIGN KEY materiais_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: movimentacao_estoque
//   FOREIGN KEY movimentacao_estoque_item_id_fkey: FOREIGN KEY (item_id) REFERENCES estoque(id) ON DELETE CASCADE
//   PRIMARY KEY movimentacao_estoque_pkey: PRIMARY KEY (id)
//   CHECK movimentacao_estoque_tipo_check: CHECK ((tipo = ANY (ARRAY['entrada'::text, 'saida'::text])))
//   FOREIGN KEY movimentacao_estoque_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: notificacoes
//   PRIMARY KEY notificacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: oportunidades
//   FOREIGN KEY oportunidades_contato_id_fkey: FOREIGN KEY (contato_id) REFERENCES contatos(id) ON DELETE SET NULL
//   FOREIGN KEY oportunidades_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   CHECK oportunidades_estagio_check: CHECK ((estagio = ANY (ARRAY['Prospecção'::text, 'Qualificação'::text, 'Proposta'::text, 'Negociação'::text, 'Fechamento'::text, 'Ganho'::text, 'Perdido'::text])))
//   PRIMARY KEY oportunidades_pkey: PRIMARY KEY (id)
//   CHECK oportunidades_probabilidade_percentual_check: CHECK (((probabilidade_percentual >= 0) AND (probabilidade_percentual <= 100)))
//   FOREIGN KEY oportunidades_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: pacientes
//   FOREIGN KEY pacientes_convenio_id_fkey: FOREIGN KEY (convenio_id) REFERENCES convenios(id) ON DELETE SET NULL
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: parametros_financeiros
//   PRIMARY KEY parametros_financeiros_pkey: PRIMARY KEY (id)
//   UNIQUE parametros_financeiros_usuario_id_chave_key: UNIQUE (usuario_id, chave)
//   FOREIGN KEY parametros_financeiros_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: per_diem_regioes
//   PRIMARY KEY per_diem_regioes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY per_diem_regioes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
// Table: propostas
//   FOREIGN KEY propostas_contato_id_fkey: FOREIGN KEY (contato_id) REFERENCES contatos(id) ON DELETE SET NULL
//   FOREIGN KEY propostas_empresa_id_fkey: FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
//   UNIQUE propostas_numero_proposta_key: UNIQUE (numero_proposta)
//   FOREIGN KEY propostas_oportunidade_id_fkey: FOREIGN KEY (oportunidade_id) REFERENCES oportunidades(id) ON DELETE SET NULL
//   PRIMARY KEY propostas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY propostas_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK propostas_status_check: CHECK ((status = ANY (ARRAY['Rascunho'::text, 'Enviada'::text, 'Visualizada'::text, 'Aceita'::text, 'Rejeitada'::text, 'Enviada via WhatsApp'::text])))
// Table: propostas_versoes
//   PRIMARY KEY propostas_versoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY propostas_versoes_proposta_id_fkey: FOREIGN KEY (proposta_id) REFERENCES propostas(id) ON DELETE CASCADE
//   FOREIGN KEY propostas_versoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: rotas_aereas
//   PRIMARY KEY rotas_aereas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY rotas_aereas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
// Table: testes_psicologicos
//   PRIMARY KEY testes_psicologicos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY testes_psicologicos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_parent_id_fkey: FOREIGN KEY (parent_id) REFERENCES usuarios(id)
//   PRIMARY KEY usuarios_pkey: PRIMARY KEY (id)
// Table: valores_campos_personalizados
//   FOREIGN KEY valores_campos_personalizados_campo_id_fkey: FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id) ON DELETE CASCADE
//   PRIMARY KEY valores_campos_personalizados_pkey: PRIMARY KEY (id)

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
// Table: atividades
//   Policy "atividades_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (responsavel_id = auth.uid())
//     WITH CHECK: (responsavel_id = auth.uid())
//   Policy "team_select_atividades" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((responsavel_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
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
// Table: campos_personalizados
//   Policy "campos_personalizados_policy" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: consultores
//   Policy "consultores_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_consultores" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
// Table: contatos
//   Policy "contatos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_contatos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
// Table: convenios
//   Policy "convenios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: custos_operacionais
//   Policy "custos_operacionais_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = custos_operacionais.proposta_id) AND ((p.responsavel_id = auth.uid()) OR ((p.responsavel_id IN ( SELECT usuarios.id            FROM usuarios           WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = custos_operacionais.proposta_id) AND (p.responsavel_id = auth.uid()))))
// Table: despesas
//   Policy "despesas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: documentos
//   Policy "documentos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: emails_automacao
//   Policy "emails_automacao_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: emails_propostas
//   Policy "emails_propostas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = emails_propostas.proposta_id) AND ((p.responsavel_id = auth.uid()) OR ((p.responsavel_id IN ( SELECT usuarios.id            FROM usuarios           WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = emails_propostas.proposta_id) AND (p.responsavel_id = auth.uid()))))
// Table: empresas
//   Policy "empresas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_empresas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
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
// Table: fluxos_automacao
//   Policy "fluxos_automacao_policy" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: historico_oportunidades
//   Policy "historico_oportunidades_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: historico_propostas
//   Policy "historico_propostas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = historico_propostas.proposta_id) AND ((p.responsavel_id = auth.uid()) OR ((p.responsavel_id IN ( SELECT usuarios.id            FROM usuarios           WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = historico_propostas.proposta_id) AND (p.responsavel_id = auth.uid()))))
// Table: hoteis_regioes
//   Policy "hoteis_regioes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_hoteis_regioes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
// Table: integracao_usuarios
//   Policy "integracao_usuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: itens_proposta
//   Policy "itens_proposta_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = itens_proposta.proposta_id) AND ((p.responsavel_id = auth.uid()) OR ((p.responsavel_id IN ( SELECT usuarios.id            FROM usuarios           WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM propostas p   WHERE ((p.id = itens_proposta.proposta_id) AND (p.responsavel_id = auth.uid()))))
// Table: laudos
//   Policy "laudos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: lista_espera
//   Policy "lista_espera_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: log_whatsapp
//   Policy "log_whatsapp_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: logs_auditoria
//   Policy "logs_auditoria_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: logs_execucao_automacao
//   Policy "logs_execucao_automacao_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: materiais
//   Policy "materiais_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_materiais" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
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
// Table: oportunidades
//   Policy "oportunidades_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (responsavel_id = auth.uid())
//     WITH CHECK: (responsavel_id = auth.uid())
//   Policy "team_select_oportunidades" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((responsavel_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
// Table: pacientes
//   Policy "anon_select_pacientes" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "pacientes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: parametros_financeiros
//   Policy "parametros_financeiros_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_parametros_financeiros" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
// Table: per_diem_regioes
//   Policy "per_diem_regioes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_per_diem_regioes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
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
// Table: propostas
//   Policy "propostas_own_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (responsavel_id = auth.uid())
//     WITH CHECK: (responsavel_id = auth.uid())
//   Policy "propostas_team_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((responsavel_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
// Table: propostas_versoes
//   Policy "propostas_versoes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: rotas_aereas
//   Policy "rotas_aereas_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
//   Policy "team_select_rotas_aereas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
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
// Table: testes_psicologicos
//   Policy "team_select_testes_psicologicos" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((usuario_id IN ( SELECT usuarios.id    FROM usuarios   WHERE (COALESCE(usuarios.parent_id, usuarios.id) = get_tenant_id()))) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
//   Policy "testes_psicologicos_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: usuarios
//   Policy "admin_update_usuarios" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((get_user_role() = 'admin'::text) AND (COALESCE(parent_id, id) = get_tenant_id()))
//     WITH CHECK: ((get_user_role() = 'admin'::text) AND (COALESCE(parent_id, id) = get_tenant_id()))
//   Policy "anon_read_usuarios" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "parent_select_usuarios" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((COALESCE(parent_id, id) = get_tenant_id()) AND (get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])))
//   Policy "usuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
//   Policy "usuarios_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
// Table: valores_campos_personalizados
//   Policy "valores_campos_personalizados_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (campo_id IN ( SELECT campos_personalizados.id    FROM campos_personalizados   WHERE (campos_personalizados.usuario_id = auth.uid())))
//     WITH CHECK: (campo_id IN ( SELECT campos_personalizados.id    FROM campos_personalizados   WHERE (campos_personalizados.usuario_id = auth.uid())))

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
//       SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
//       IF v_paciente_id IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       SELECT data_hora INTO v_data_hora FROM public.agendamentos 
//       WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
//       
//       IF v_data_hora IS NULL THEN
//           RETURN false;
//       END IF;
//   
//       IF v_data_hora < (NOW() + interval '24 hours') THEN
//           RAISE EXCEPTION 'Cancelamento permitido apenas com 24 horas de antecedência.';
//       END IF;
//   
//       UPDATE public.agendamentos 
//       SET status = 'desmarcou', 
//           justificativa_falta = p_justificativa,
//           motivo_cancelamento = p_justificativa
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
// FUNCTION generate_numero_proposta()
//   CREATE OR REPLACE FUNCTION public.generate_numero_proposta()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       current_year text := to_char(CURRENT_DATE, 'YYYY');
//       max_seq int;
//   BEGIN
//       IF NEW.numero_proposta IS NULL THEN
//           SELECT COALESCE(MAX(substring(numero_proposta from 'PROP-\d{4}-(\d+)')::int), 0)
//           INTO max_seq
//           FROM public.propostas
//           WHERE numero_proposta LIKE 'PROP-' || current_year || '-%';
//           
//           NEW.numero_proposta := 'PROP-' || current_year || '-' || lpad((max_seq + 1)::text, 3, '0');
//       END IF;
//       RETURN NEW;
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
// FUNCTION get_public_proposal(uuid)
//   CREATE OR REPLACE FUNCTION public.get_public_proposal(p_proposta_id uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_proposta jsonb;
//       v_itens jsonb;
//       v_empresa jsonb;
//       v_consultorio jsonb;
//   BEGIN
//       SELECT jsonb_build_object(
//           'id', p.id,
//           'numero_proposta', p.numero_proposta,
//           'status', p.status,
//           'valor_total', p.valor_total,
//           'data_emissao', p.data_emissao,
//           'data_validade', p.data_validade,
//           'condicoes_pagamento', p.condicoes_pagamento,
//           'comentarios_cliente', p.comentarios_cliente
//       ) INTO v_proposta
//       FROM public.propostas p
//       WHERE p.id = p_proposta_id;
//   
//       IF v_proposta IS NULL THEN
//           RETURN NULL;
//       END IF;
//   
//       SELECT COALESCE(jsonb_agg(jsonb_build_object(
//           'tipo_servico', i.tipo_servico,
//           'descricao', i.descricao,
//           'quantidade', i.quantidade,
//           'valor_unitario', i.valor_unitario,
//           'subtotal', i.subtotal
//       )), '[]'::jsonb) INTO v_itens
//       FROM public.itens_proposta i
//       WHERE i.proposta_id = p_proposta_id;
//   
//       SELECT jsonb_build_object(
//           'nome', e.nome
//       ) INTO v_empresa
//       FROM public.propostas p
//       LEFT JOIN public.empresas e ON p.empresa_id = e.id
//       WHERE p.id = p_proposta_id;
//   
//       SELECT jsonb_build_object(
//           'nome', u.nome,
//           'nome_consultorio', u.nome_consultorio,
//           'email', u.email,
//           'telefone_consultorio', u.telefone_consultorio,
//           'logo_url', u.logo_url
//       ) INTO v_consultorio
//       FROM public.propostas p
//       JOIN public.usuarios u ON p.responsavel_id = u.id
//       WHERE p.id = p_proposta_id;
//   
//       RETURN jsonb_build_object(
//           'proposta', v_proposta,
//           'itens', v_itens,
//           'empresa', v_empresa,
//           'consultorio', v_consultorio
//       );
//   END;
//   $function$
//   
// FUNCTION get_tenant_id()
//   CREATE OR REPLACE FUNCTION public.get_tenant_id()
//    RETURNS uuid
//    LANGUAGE sql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT COALESCE(parent_id, id) FROM public.usuarios WHERE id = auth.uid();
//   $function$
//   
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE sql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT role FROM public.usuarios WHERE id = auth.uid();
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
// FUNCTION invoke_executar_automacao()
//   CREATE OR REPLACE FUNCTION public.invoke_executar_automacao()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     req_id bigint;
//     base_url text;
//   BEGIN
//     -- Known production edge function URL
//     base_url := 'https://qkxjdsdvxxgtdmlivxue.supabase.co/functions/v1'; 
//   
//     SELECT net.http_post(
//         url:=(base_url || '/executar_automacao'),
//         headers:='{"Content-Type": "application/json"}'::jsonb,
//         body:=json_build_object(
//             'type', TG_OP,
//             'table', TG_TABLE_NAME,
//             'record', row_to_json(NEW),
//             'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
//         )::jsonb
//     ) INTO req_id;
//   
//     RETURN NEW;
//   EXCEPTION WHEN OTHERS THEN
//     RAISE WARNING 'invoke_executar_automacao failed: %', SQLERRM;
//     RETURN NEW;
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
// FUNCTION log_oportunidade_estagio()
//   CREATE OR REPLACE FUNCTION public.log_oportunidade_estagio()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF TG_OP = 'INSERT' THEN
//       INSERT INTO public.historico_oportunidades (oportunidade_id, usuario_id, estagio_novo)
//       VALUES (NEW.id, NEW.responsavel_id, NEW.estagio);
//     ELSIF TG_OP = 'UPDATE' AND NEW.estagio IS DISTINCT FROM OLD.estagio THEN
//       INSERT INTO public.historico_oportunidades (oportunidade_id, usuario_id, estagio_anterior, estagio_novo)
//       VALUES (NEW.id, NEW.responsavel_id, OLD.estagio, NEW.estagio);
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION log_proposta_creation()
//   CREATE OR REPLACE FUNCTION public.log_proposta_creation()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       INSERT INTO public.historico_propostas (proposta_id, acao, usuario_id)
//       VALUES (NEW.id, 'Criada', NEW.responsavel_id);
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION log_proposta_status_change()
//   CREATE OR REPLACE FUNCTION public.log_proposta_status_change()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('Enviada', 'Visualizada', 'Aceita', 'Rejeitada') THEN
//           INSERT INTO public.historico_propostas (proposta_id, acao, usuario_id)
//           VALUES (NEW.id, NEW.status, COALESCE(auth.uid(), NEW.responsavel_id));
//       END IF;
//       RETURN NEW;
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
// FUNCTION respond_public_proposal(uuid, text, text)
//   CREATE OR REPLACE FUNCTION public.respond_public_proposal(p_proposta_id uuid, p_status text, p_comentario text)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF p_status NOT IN ('Aceita', 'Rejeitada') THEN
//           RAISE EXCEPTION 'Status inválido';
//       END IF;
//   
//       UPDATE public.propostas
//       SET status = p_status,
//           comentarios_cliente = p_comentario
//       WHERE id = p_proposta_id AND status NOT IN ('Aceita', 'Rejeitada');
//   
//       IF FOUND THEN
//           -- O trigger log_proposta_status_change cuidará de inserir em historico_propostas
//           -- e o trigger trg_notifica_status_proposta cuidará das notificações
//           RETURN true;
//       END IF;
//   
//       RETURN false;
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
// FUNCTION set_updated_at()
//   CREATE OR REPLACE FUNCTION public.set_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION snapshot_proposta(uuid, uuid, text)
//   CREATE OR REPLACE FUNCTION public.snapshot_proposta(p_proposta_id uuid, p_usuario_id uuid, p_resumo text)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_versao int;
//     v_dados jsonb;
//     v_version_id uuid;
//   BEGIN
//     -- Determine next version number
//     SELECT COALESCE(MAX(versao), 0) + 1 INTO v_versao
//     FROM public.propostas_versoes
//     WHERE proposta_id = p_proposta_id;
//   
//     -- Build JSON snapshot of proposal, items, and costs
//     SELECT jsonb_build_object(
//       'proposta', row_to_json(p),
//       'itens', (SELECT COALESCE(jsonb_agg(row_to_json(i)), '[]'::jsonb) FROM public.itens_proposta i WHERE i.proposta_id = p_proposta_id),
//       'custos', (SELECT COALESCE(jsonb_agg(row_to_json(c)), '[]'::jsonb) FROM public.custos_operacionais c WHERE c.proposta_id = p_proposta_id)
//     ) INTO v_dados
//     FROM public.propostas p
//     WHERE p.id = p_proposta_id;
//   
//     -- Only snapshot if proposal exists
//     IF v_dados->>'proposta' IS NULL THEN
//       RETURN NULL;
//     END IF;
//   
//     -- Insert the version
//     INSERT INTO public.propostas_versoes (proposta_id, versao, dados, resumo_mudancas, usuario_id)
//     VALUES (p_proposta_id, v_versao, v_dados, p_resumo, p_usuario_id)
//     RETURNING id INTO v_version_id;
//   
//     RETURN v_version_id;
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
//       req_id bigint;
//       base_url text;
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
//               
//               base_url := 'https://qkxjdsdvxxgtdmlivxue.supabase.co/functions/v1';
//               IF v_paciente.telefone IS NOT NULL THEN
//                 SELECT net.http_post(
//                     url:=(base_url || '/enviar_mensagem_whatsapp'),
//                     headers:='{"Content-Type": "application/json"}'::jsonb,
//                     body:=json_build_object(
//                         'tipo_whatsapp', COALESCE(v_usuario.whatsapp_tipo, 'padrao'),
//                         'telefone', v_paciente.telefone,
//                         'mensagem', v_msg,
//                         'usuario_id', NEW.usuario_id
//                     )::jsonb
//                 ) INTO req_id;
//               END IF;
//           END IF;
//   
//           INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
//           VALUES (NEW.usuario_id, 'Consulta Confirmada', 'O paciente ' || (SELECT nome FROM public.pacientes WHERE id = NEW.paciente_id) || ' confirmou a consulta via portal.');
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION trigger_notifica_status_proposta()
//   CREATE OR REPLACE FUNCTION public.trigger_notifica_status_proposta()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_msg TEXT;
//   BEGIN
//       IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('Aceita', 'Rejeitada', 'Visualizada') THEN
//           v_msg := 'A proposta ' || COALESCE(NEW.numero_proposta, 'S/N') || ' foi marcada como ' || NEW.status || ' pelo cliente.';
//           IF NEW.comentarios_cliente IS NOT NULL AND NEW.comentarios_cliente IS DISTINCT FROM OLD.comentarios_cliente THEN
//               v_msg := v_msg || ' Comentário: ' || NEW.comentarios_cliente;
//           END IF;
//   
//           INSERT INTO public.notificacoes (usuario_id, titulo, mensagem)
//           VALUES (NEW.responsavel_id, 'Atualização de Proposta', v_msg);
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
// Table: atividades
//   set_atividades_updated_at: CREATE TRIGGER set_atividades_updated_at BEFORE UPDATE ON public.atividades FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: consultores
//   set_consultores_updated_at: CREATE TRIGGER set_consultores_updated_at BEFORE UPDATE ON public.consultores FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: contatos
//   set_contatos_updated_at: CREATE TRIGGER set_contatos_updated_at BEFORE UPDATE ON public.contatos FOR EACH ROW EXECUTE FUNCTION set_updated_at()
//   trg_automacao_contatos: CREATE TRIGGER trg_automacao_contatos AFTER INSERT ON public.contatos FOR EACH ROW EXECUTE FUNCTION invoke_executar_automacao()
// Table: empresas
//   set_empresas_updated_at: CREATE TRIGGER set_empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION set_updated_at()
//   trg_automacao_empresas: CREATE TRIGGER trg_automacao_empresas AFTER INSERT ON public.empresas FOR EACH ROW EXECUTE FUNCTION invoke_executar_automacao()
// Table: estoque
//   stock_movement_trigger: CREATE TRIGGER stock_movement_trigger AFTER INSERT OR UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION log_stock_movement()
//   trigger_check_low_stock: CREATE TRIGGER trigger_check_low_stock AFTER INSERT OR UPDATE OF quantidade, quantidade_minima ON public.estoque FOR EACH ROW EXECUTE FUNCTION check_low_stock()
// Table: financeiro
//   audit_financeiro_trigger: CREATE TRIGGER audit_financeiro_trigger AFTER INSERT OR DELETE OR UPDATE ON public.financeiro FOR EACH ROW EXECUTE FUNCTION log_audit_action()
// Table: hoteis_regioes
//   set_hoteis_regioes_updated_at: CREATE TRIGGER set_hoteis_regioes_updated_at BEFORE UPDATE ON public.hoteis_regioes FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: integracao_usuarios
//   set_integracao_usuarios_updated_at: CREATE TRIGGER set_integracao_usuarios_updated_at BEFORE UPDATE ON public.integracao_usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: laudos
//   audit_laudos_trigger: CREATE TRIGGER audit_laudos_trigger AFTER INSERT OR DELETE OR UPDATE ON public.laudos FOR EACH ROW EXECUTE FUNCTION log_audit_action()
// Table: materiais
//   set_materiais_updated_at: CREATE TRIGGER set_materiais_updated_at BEFORE UPDATE ON public.materiais FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: oportunidades
//   log_oportunidade_estagio_trigger: CREATE TRIGGER log_oportunidade_estagio_trigger AFTER INSERT OR UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION log_oportunidade_estagio()
//   set_oportunidades_updated_at: CREATE TRIGGER set_oportunidades_updated_at BEFORE UPDATE ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION set_updated_at()
//   trg_automacao_oportunidades_ins: CREATE TRIGGER trg_automacao_oportunidades_ins AFTER INSERT ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION invoke_executar_automacao()
//   trg_automacao_oportunidades_upd: CREATE TRIGGER trg_automacao_oportunidades_upd AFTER UPDATE OF estagio ON public.oportunidades FOR EACH ROW EXECUTE FUNCTION invoke_executar_automacao()
// Table: parametros_financeiros
//   set_parametros_financeiros_updated_at: CREATE TRIGGER set_parametros_financeiros_updated_at BEFORE UPDATE ON public.parametros_financeiros FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: per_diem_regioes
//   set_per_diem_regioes_updated_at: CREATE TRIGGER set_per_diem_regioes_updated_at BEFORE UPDATE ON public.per_diem_regioes FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: propostas
//   set_propostas_updated_at: CREATE TRIGGER set_propostas_updated_at BEFORE UPDATE ON public.propostas FOR EACH ROW EXECUTE FUNCTION set_updated_at()
//   trg_automacao_propostas_ins: CREATE TRIGGER trg_automacao_propostas_ins AFTER INSERT ON public.propostas FOR EACH ROW EXECUTE FUNCTION invoke_executar_automacao()
//   trg_automacao_propostas_upd: CREATE TRIGGER trg_automacao_propostas_upd AFTER UPDATE OF status, status_nf ON public.propostas FOR EACH ROW EXECUTE FUNCTION invoke_executar_automacao()
//   trg_generate_numero_proposta: CREATE TRIGGER trg_generate_numero_proposta BEFORE INSERT ON public.propostas FOR EACH ROW EXECUTE FUNCTION generate_numero_proposta()
//   trg_log_proposta_creation: CREATE TRIGGER trg_log_proposta_creation AFTER INSERT ON public.propostas FOR EACH ROW EXECUTE FUNCTION log_proposta_creation()
//   trg_log_proposta_status_change: CREATE TRIGGER trg_log_proposta_status_change AFTER UPDATE OF status ON public.propostas FOR EACH ROW EXECUTE FUNCTION log_proposta_status_change()
//   trg_notifica_status_proposta: CREATE TRIGGER trg_notifica_status_proposta AFTER UPDATE OF status ON public.propostas FOR EACH ROW EXECUTE FUNCTION trigger_notifica_status_proposta()
// Table: rotas_aereas
//   set_rotas_aereas_updated_at: CREATE TRIGGER set_rotas_aereas_updated_at BEFORE UPDATE ON public.rotas_aereas FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: testes_psicologicos
//   set_testes_psicologicos_updated_at: CREATE TRIGGER set_testes_psicologicos_updated_at BEFORE UPDATE ON public.testes_psicologicos FOR EACH ROW EXECUTE FUNCTION set_updated_at()
// Table: valores_campos_personalizados
//   set_valores_campos_personalizados_updated_at: CREATE TRIGGER set_valores_campos_personalizados_updated_at BEFORE UPDATE ON public.valores_campos_personalizados FOR EACH ROW EXECUTE FUNCTION set_updated_at()

// --- INDEXES ---
// Table: atividades
//   CREATE INDEX idx_atividades_contato_id ON public.atividades USING btree (contato_id)
//   CREATE INDEX idx_atividades_data_agendada ON public.atividades USING btree (data_agendada)
//   CREATE INDEX idx_atividades_empresa_id ON public.atividades USING btree (empresa_id)
//   CREATE INDEX idx_atividades_oportunidade_id ON public.atividades USING btree (oportunidade_id)
//   CREATE INDEX idx_atividades_responsavel_id ON public.atividades USING btree (responsavel_id)
// Table: consultores
//   CREATE INDEX idx_consultores_ativo ON public.consultores USING btree (ativo)
// Table: custos_operacionais
//   CREATE INDEX idx_custos_operacionais_proposta_id ON public.custos_operacionais USING btree (proposta_id)
// Table: emails_automacao
//   CREATE INDEX idx_emails_automacao_fluxo_id ON public.emails_automacao USING btree (fluxo_id)
//   CREATE INDEX idx_emails_automacao_usuario_id ON public.emails_automacao USING btree (usuario_id)
// Table: emails_propostas
//   CREATE INDEX idx_emails_propostas_proposta_id ON public.emails_propostas USING btree (proposta_id)
// Table: financeiro
//   CREATE UNIQUE INDEX financeiro_usuario_paciente_mes_ano_key ON public.financeiro USING btree (usuario_id, paciente_id, mes, ano)
// Table: fluxos_automacao
//   CREATE INDEX idx_fluxos_automacao_empresa_id ON public.fluxos_automacao USING btree (empresa_id)
//   CREATE INDEX idx_fluxos_automacao_usuario_id ON public.fluxos_automacao USING btree (usuario_id)
// Table: historico_propostas
//   CREATE INDEX idx_historico_propostas_proposta_id ON public.historico_propostas USING btree (proposta_id)
// Table: hoteis_regioes
//   CREATE INDEX idx_hoteis_regioes_ativo ON public.hoteis_regioes USING btree (ativo)
//   CREATE INDEX idx_hoteis_regioes_regiao ON public.hoteis_regioes USING btree (regiao)
// Table: integracao_usuarios
//   CREATE UNIQUE INDEX integracao_usuarios_usuario_id_provedor_key ON public.integracao_usuarios USING btree (usuario_id, provedor)
// Table: itens_proposta
//   CREATE INDEX idx_itens_proposta_proposta_id ON public.itens_proposta USING btree (proposta_id)
// Table: logs_execucao_automacao
//   CREATE INDEX idx_logs_execucao_automacao_fluxo_id ON public.logs_execucao_automacao USING btree (fluxo_id)
//   CREATE INDEX idx_logs_execucao_automacao_usuario_id ON public.logs_execucao_automacao USING btree (usuario_id)
// Table: materiais
//   CREATE INDEX idx_materiais_ativo ON public.materiais USING btree (ativo)
// Table: oportunidades
//   CREATE INDEX idx_oportunidades_empresa_id ON public.oportunidades USING btree (empresa_id)
//   CREATE INDEX idx_oportunidades_responsavel_id ON public.oportunidades USING btree (responsavel_id)
// Table: parametros_financeiros
//   CREATE INDEX idx_parametros_financeiros_ativo ON public.parametros_financeiros USING btree (ativo)
//   CREATE INDEX idx_parametros_financeiros_chave ON public.parametros_financeiros USING btree (chave)
//   CREATE UNIQUE INDEX parametros_financeiros_usuario_id_chave_key ON public.parametros_financeiros USING btree (usuario_id, chave)
// Table: per_diem_regioes
//   CREATE INDEX idx_per_diem_regioes_ativo ON public.per_diem_regioes USING btree (ativo)
//   CREATE INDEX idx_per_diem_regioes_regiao ON public.per_diem_regioes USING btree (regiao)
// Table: prontuarios
//   CREATE UNIQUE INDEX prontuarios_paciente_id_key ON public.prontuarios USING btree (paciente_id)
// Table: propostas
//   CREATE INDEX idx_propostas_empresa_id ON public.propostas USING btree (empresa_id)
//   CREATE INDEX idx_propostas_responsavel_id ON public.propostas USING btree (responsavel_id)
//   CREATE INDEX idx_propostas_status ON public.propostas USING btree (status)
//   CREATE UNIQUE INDEX propostas_numero_proposta_key ON public.propostas USING btree (numero_proposta)
// Table: rotas_aereas
//   CREATE INDEX idx_rotas_aereas_ativo ON public.rotas_aereas USING btree (ativo)
// Table: sala_espera
//   CREATE UNIQUE INDEX sala_espera_agendamento_id_key ON public.sala_espera USING btree (agendamento_id)
// Table: testes_psicologicos
//   CREATE INDEX idx_testes_psicologicos_ativo ON public.testes_psicologicos USING btree (ativo)

