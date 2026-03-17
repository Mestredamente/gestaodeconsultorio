// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          data_hora: string
          especialidade: string | null
          id: string
          justificativa_falta: string | null
          paciente_id: string
          sinal_pago: boolean | null
          status: string
          status_nota_fiscal: string | null
          usuario_id: string
          valor_sinal: number | null
          valor_total: number | null
        }
        Insert: {
          data_hora: string
          especialidade?: string | null
          id?: string
          justificativa_falta?: string | null
          paciente_id: string
          sinal_pago?: boolean | null
          status?: string
          status_nota_fiscal?: string | null
          usuario_id: string
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Update: {
          data_hora?: string
          especialidade?: string | null
          id?: string
          justificativa_falta?: string | null
          paciente_id?: string
          sinal_pago?: boolean | null
          status?: string
          status_nota_fiscal?: string | null
          usuario_id?: string
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'agendamentos_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agendamentos_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'avaliacoes_agendamento_id_fkey'
            columns: ['agendamento_id']
            isOneToOne: false
            referencedRelation: 'agendamentos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacoes_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
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
            foreignKeyName: 'comunicacoes_campanhas_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'despesas_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'estoque_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      financeiro: {
        Row: {
          ano: number
          data_atualizacao: string
          id: string
          mes: number
          paciente_id: string
          usuario_id: string
          valor_a_receber: number
          valor_recebido: number
        }
        Insert: {
          ano: number
          data_atualizacao?: string
          id?: string
          mes: number
          paciente_id: string
          usuario_id: string
          valor_a_receber?: number
          valor_recebido?: number
        }
        Update: {
          ano?: number
          data_atualizacao?: string
          id?: string
          mes?: number
          paciente_id?: string
          usuario_id?: string
          valor_a_receber?: number
          valor_recebido?: number
        }
        Relationships: [
          {
            foreignKeyName: 'financeiro_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'financeiro_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'historico_cobrancas_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'historico_cobrancas_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'logs_auditoria_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'movimentacao_estoque_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'estoque'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimentacao_estoque_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
            foreignKeyName: 'notificacoes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
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
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          contrato_aceito: boolean | null
          cpf: string | null
          data_aceite_contrato: string | null
          data_criacao: string | null
          data_nascimento: string | null
          dia_pagamento: number | null
          email: string | null
          endereco: string | null
          estado: string | null
          frequencia_pagamento: string | null
          hash_anamnese: string | null
          id: string
          nome: string
          numero: string | null
          rua: string | null
          telefone: string | null
          usuario_id: string
          valor_sessao: number | null
        }
        Insert: {
          anamnese?: Json | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          contrato_aceito?: boolean | null
          cpf?: string | null
          data_aceite_contrato?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          dia_pagamento?: number | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          frequencia_pagamento?: string | null
          hash_anamnese?: string | null
          id?: string
          nome: string
          numero?: string | null
          rua?: string | null
          telefone?: string | null
          usuario_id: string
          valor_sessao?: number | null
        }
        Update: {
          anamnese?: Json | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          contrato_aceito?: boolean | null
          cpf?: string | null
          data_aceite_contrato?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          dia_pagamento?: number | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          frequencia_pagamento?: string | null
          hash_anamnese?: string | null
          id?: string
          nome?: string
          numero?: string | null
          rua?: string | null
          telefone?: string | null
          usuario_id?: string
          valor_sessao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'pacientes_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
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
            foreignKeyName: 'prescricoes_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: false
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
        ]
      }
      prontuarios: {
        Row: {
          historico_sessoes: Json
          id: string
          paciente_id: string
          queixa_principal: string | null
          usuario_id: string
        }
        Insert: {
          historico_sessoes?: Json
          id?: string
          paciente_id: string
          queixa_principal?: string | null
          usuario_id: string
        }
        Update: {
          historico_sessoes?: Json
          id?: string
          paciente_id?: string
          queixa_principal?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'prontuarios_paciente_id_fkey'
            columns: ['paciente_id']
            isOneToOne: true
            referencedRelation: 'pacientes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'prontuarios_usuario_id_fkey'
            columns: ['usuario_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
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
      usuarios: {
        Row: {
          anamnese_template: Json | null
          chave_pix: string | null
          email: string | null
          especialidades_disponiveis: string[] | null
          id: string
          lembrete_whatsapp_ativo: boolean | null
          logo_url: string | null
          meta_mensal_consultas: number | null
          nome_consultorio: string | null
          politica_cancelamento: string | null
          preferencias_dashboard: Json | null
          sync_calendarios: Json | null
          template_cobranca: string | null
          template_lembrete: string | null
          texto_contrato: string | null
        }
        Insert: {
          anamnese_template?: Json | null
          chave_pix?: string | null
          email?: string | null
          especialidades_disponiveis?: string[] | null
          id: string
          lembrete_whatsapp_ativo?: boolean | null
          logo_url?: string | null
          meta_mensal_consultas?: number | null
          nome_consultorio?: string | null
          politica_cancelamento?: string | null
          preferencias_dashboard?: Json | null
          sync_calendarios?: Json | null
          template_cobranca?: string | null
          template_lembrete?: string | null
          texto_contrato?: string | null
        }
        Update: {
          anamnese_template?: Json | null
          chave_pix?: string | null
          email?: string | null
          especialidades_disponiveis?: string[] | null
          id?: string
          lembrete_whatsapp_ativo?: boolean | null
          logo_url?: string | null
          meta_mensal_consultas?: number | null
          nome_consultorio?: string | null
          politica_cancelamento?: string | null
          preferencias_dashboard?: Json | null
          sync_calendarios?: Json | null
          template_cobranca?: string | null
          template_lembrete?: string | null
          texto_contrato?: string | null
        }
        Relationships: []
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
      get_patient_portal_data: { Args: { p_hash: string }; Returns: Json }
      get_prescricao_publica: { Args: { p_hash: string }; Returns: Json }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
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
// Table: comunicacoes_campanhas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   conteudo: text (not null)
//   data_envio: timestamp with time zone (not null, default: now())
//   tipo: text (not null, default: 'newsletter'::text)
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
// Table: financeiro
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   mes: integer (not null)
//   ano: integer (not null)
//   valor_recebido: numeric (not null, default: 0)
//   valor_a_receber: numeric (not null, default: 0)
//   data_atualizacao: timestamp with time zone (not null, default: now())
// Table: historico_cobrancas
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   paciente_id: uuid (not null)
//   data_envio: timestamp with time zone (not null, default: now())
//   valor_cobrado: numeric (not null)
//   mes_referencia: integer (not null)
//   ano_referencia: integer (not null)
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
// Table: templates_documentos
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   titulo: text (not null)
//   conteudo: text (not null)
//   tipo: text (not null, default: 'outro'::text)
//   data_criacao: timestamp with time zone (not null, default: now())
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

// --- CONSTRAINTS ---
// Table: agendamentos
//   FOREIGN KEY agendamentos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY agendamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agendamentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK valid_status: CHECK ((status = ANY (ARRAY['agendado'::text, 'compareceu'::text, 'faltou'::text, 'desmarcou'::text])))
// Table: appointments
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_agendamento_id_fkey: FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
//   CHECK avaliacoes_nota_check: CHECK (((nota >= 1) AND (nota <= 5)))
//   FOREIGN KEY avaliacoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
// Table: comunicacoes_campanhas
//   PRIMARY KEY comunicacoes_campanhas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY comunicacoes_campanhas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: despesas
//   PRIMARY KEY despesas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY despesas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: estoque
//   PRIMARY KEY estoque_pkey: PRIMARY KEY (id)
//   FOREIGN KEY estoque_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: financeiro
//   FOREIGN KEY financeiro_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY financeiro_pkey: PRIMARY KEY (id)
//   FOREIGN KEY financeiro_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   UNIQUE financeiro_usuario_paciente_mes_ano_key: UNIQUE (usuario_id, paciente_id, mes, ano)
// Table: historico_cobrancas
//   FOREIGN KEY historico_cobrancas_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY historico_cobrancas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_cobrancas_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: prescricoes
//   FOREIGN KEY prescricoes_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY prescricoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY prescricoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: prontuarios
//   FOREIGN KEY prontuarios_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   UNIQUE prontuarios_paciente_id_key: UNIQUE (paciente_id)
//   PRIMARY KEY prontuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY prontuarios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: templates_documentos
//   PRIMARY KEY templates_documentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY templates_documentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: usuarios
//   FOREIGN KEY usuarios_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
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
// Table: comunicacoes_campanhas
//   Policy "campanhas_policy" (ALL, PERMISSIVE) roles={authenticated}
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
// Table: financeiro
//   Policy "financeiro_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: historico_cobrancas
//   Policy "historico_cobrancas_policy" (ALL, PERMISSIVE) roles={authenticated}
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
//   Policy "pacientes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
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
// Table: templates_documentos
//   Policy "templates_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: usuarios
//   Policy "anon_read_usuarios" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "usuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
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
//   BEGIN
//       -- Verifica autenticidade do paciente pelo hash
//       SELECT id INTO v_paciente_id FROM public.pacientes WHERE hash_anamnese = p_hash LIMIT 1;
//       IF v_paciente_id IS NULL THEN
//           RETURN false;
//       END IF;
//
//       -- Atualiza o status e a justificativa apenas se pertencer ao paciente e estiver agendado
//       UPDATE public.agendamentos
//       SET status = 'desmarcou', justificativa_falta = p_justificativa
//       WHERE id = p_agendamento_id AND paciente_id = v_paciente_id AND status = 'agendado';
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
// FUNCTION create_public_booking(uuid, text, text, timestamp with time zone)
//   CREATE OR REPLACE FUNCTION public.create_public_booking(p_clinic_id uuid, p_nome text, p_telefone text, p_data_hora timestamp with time zone)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_paciente_id UUID;
//     v_agendamento_id UUID;
//   BEGIN
//     -- Check if patient already exists by phone and clinic
//     SELECT id INTO v_paciente_id FROM public.pacientes
//     WHERE telefone = p_telefone AND usuario_id = p_clinic_id LIMIT 1;
//
//     -- Create patient if not exists
//     IF v_paciente_id IS NULL THEN
//       INSERT INTO public.pacientes (usuario_id, nome, telefone)
//       VALUES (p_clinic_id, p_nome, p_telefone)
//       RETURNING id INTO v_paciente_id;
//     END IF;
//
//     -- Create appointment
//     INSERT INTO public.agendamentos (usuario_id, paciente_id, data_hora, status)
//     VALUES (p_clinic_id, v_paciente_id, p_data_hora, 'agendado')
//     RETURNING id INTO v_agendamento_id;
//
//     RETURN jsonb_build_object('success', true, 'agendamento_id', v_agendamento_id);
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
// FUNCTION get_patient_portal_data(uuid)
//   CREATE OR REPLACE FUNCTION public.get_patient_portal_data(p_hash uuid)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_result jsonb;
//       v_paciente record;
//       v_agendamentos jsonb;
//       v_historico jsonb;
//       v_clinica record;
//       v_past_appointments jsonb;
//   BEGIN
//       SELECT p.id, p.nome, p.cpf, p.usuario_id, p.contrato_aceito INTO v_paciente
//       FROM public.pacientes p
//       WHERE p.hash_anamnese = p_hash LIMIT 1;
//
//       IF v_paciente.id IS NULL THEN
//           RETURN '{}'::jsonb;
//       END IF;
//
//       SELECT nome_consultorio, texto_contrato, politica_cancelamento INTO v_clinica
//       FROM public.usuarios
//       WHERE id = v_paciente.usuario_id LIMIT 1;
//
//       SELECT COALESCE(jsonb_agg(jsonb_build_object(
//           'id', a.id,
//           'data_hora', a.data_hora,
//           'status', a.status,
//           'especialidade', a.especialidade,
//           'valor_total', a.valor_total
//       )), '[]'::jsonb) INTO v_agendamentos
//       FROM public.agendamentos a
//       WHERE a.paciente_id = v_paciente.id AND a.data_hora >= NOW() AND a.status = 'agendado'
//       ORDER BY a.data_hora ASC;
//
//       SELECT COALESCE(jsonb_agg(jsonb_build_object(
//           'id', a.id,
//           'data_hora', a.data_hora,
//           'especialidade', a.especialidade
//       )), '[]'::jsonb) INTO v_past_appointments
//       FROM public.agendamentos a
//       LEFT JOIN public.avaliacoes av ON a.id = av.agendamento_id
//       WHERE a.paciente_id = v_paciente.id
//         AND a.status = 'compareceu'
//         AND a.data_hora < NOW()
//         AND av.id IS NULL
//       ORDER BY a.data_hora DESC
//       LIMIT 1;
//
//       SELECT historico_sessoes INTO v_historico
//       FROM public.prontuarios
//       WHERE paciente_id = v_paciente.id LIMIT 1;
//
//       RETURN jsonb_build_object(
//           'paciente_id', v_paciente.id,
//           'paciente_nome', v_paciente.nome,
//           'paciente_cpf', v_paciente.cpf,
//           'contrato_aceito', v_paciente.contrato_aceito,
//           'consultorio', v_clinica.nome_consultorio,
//           'texto_contrato', v_clinica.texto_contrato,
//           'politica_cancelamento', v_clinica.politica_cancelamento,
//           'agendamentos', v_agendamentos,
//           'historico', COALESCE(v_historico, '[]'::jsonb),
//           'pending_survey', v_past_appointments
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
//           'medico_email', u.email
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
//   audit_agendamentos_trigger: CREATE TRIGGER audit_agendamentos_trigger AFTER INSERT OR DELETE OR UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION log_audit_action()
// Table: estoque
//   stock_movement_trigger: CREATE TRIGGER stock_movement_trigger AFTER INSERT OR UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION log_stock_movement()
//   trigger_check_low_stock: CREATE TRIGGER trigger_check_low_stock AFTER INSERT OR UPDATE OF quantidade, quantidade_minima ON public.estoque FOR EACH ROW EXECUTE FUNCTION check_low_stock()
// Table: financeiro
//   audit_financeiro_trigger: CREATE TRIGGER audit_financeiro_trigger AFTER INSERT OR DELETE OR UPDATE ON public.financeiro FOR EACH ROW EXECUTE FUNCTION log_audit_action()

// --- INDEXES ---
// Table: financeiro
//   CREATE UNIQUE INDEX financeiro_usuario_paciente_mes_ano_key ON public.financeiro USING btree (usuario_id, paciente_id, mes, ano)
// Table: prontuarios
//   CREATE UNIQUE INDEX prontuarios_paciente_id_key ON public.prontuarios USING btree (paciente_id)
