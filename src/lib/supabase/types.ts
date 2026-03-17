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
          id: string
          paciente_id: string
          status: string
          usuario_id: string
        }
        Insert: {
          data_hora: string
          id?: string
          paciente_id: string
          status?: string
          usuario_id: string
        }
        Update: {
          data_hora?: string
          id?: string
          paciente_id?: string
          status?: string
          usuario_id?: string
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
      estoque: {
        Row: {
          data_atualizacao: string | null
          id: string
          nome_item: string
          quantidade: number
          usuario_id: string
        }
        Insert: {
          data_atualizacao?: string | null
          id?: string
          nome_item: string
          quantidade?: number
          usuario_id: string
        }
        Update: {
          data_atualizacao?: string | null
          id?: string
          nome_item?: string
          quantidade?: number
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
      pacientes: {
        Row: {
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          cpf: string | null
          data_criacao: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          usuario_id: string
          valor_sessao: number | null
        }
        Insert: {
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          cpf?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          usuario_id: string
          valor_sessao?: number | null
        }
        Update: {
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          cpf?: string | null
          data_criacao?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
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
      usuarios: {
        Row: {
          chave_pix: string | null
          email: string | null
          id: string
          nome_consultorio: string | null
          template_cobranca: string | null
        }
        Insert: {
          chave_pix?: string | null
          email?: string | null
          id: string
          nome_consultorio?: string | null
          template_cobranca?: string | null
        }
        Update: {
          chave_pix?: string | null
          email?: string | null
          id?: string
          nome_consultorio?: string | null
          template_cobranca?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_public_booking: {
        Args: {
          p_clinic_id: string
          p_data_hora: string
          p_nome: string
          p_telefone: string
        }
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
// Table: appointments
//   id: uuid (not null, default: gen_random_uuid())
//   patient_name: text (not null)
//   appointment_time: timestamp with time zone (not null)
//   session_value: numeric (not null)
//   status: text (not null, default: 'scheduled'::text)
//   user_id: uuid (nullable)
// Table: estoque
//   id: uuid (not null, default: gen_random_uuid())
//   usuario_id: uuid (not null)
//   nome_item: text (not null)
//   quantidade: integer (not null, default: 0)
//   data_atualizacao: timestamp with time zone (nullable, default: now())
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
// Table: prontuarios
//   id: uuid (not null, default: gen_random_uuid())
//   paciente_id: uuid (not null)
//   usuario_id: uuid (not null)
//   queixa_principal: text (nullable)
//   historico_sessoes: jsonb (not null, default: '[]'::jsonb)
// Table: usuarios
//   id: uuid (not null)
//   email: text (nullable)
//   nome_consultorio: text (nullable)
//   chave_pix: text (nullable)
//   template_cobranca: text (nullable)

// --- CONSTRAINTS ---
// Table: agendamentos
//   FOREIGN KEY agendamentos_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   PRIMARY KEY agendamentos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY agendamentos_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
//   CHECK valid_status: CHECK ((status = ANY (ARRAY['agendado'::text, 'compareceu'::text, 'faltou'::text, 'desmarcou'::text])))
// Table: appointments
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
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
// Table: pacientes
//   PRIMARY KEY pacientes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY pacientes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
// Table: prontuarios
//   FOREIGN KEY prontuarios_paciente_id_fkey: FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
//   UNIQUE prontuarios_paciente_id_key: UNIQUE (paciente_id)
//   PRIMARY KEY prontuarios_pkey: PRIMARY KEY (id)
//   FOREIGN KEY prontuarios_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
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
// Table: pacientes
//   Policy "pacientes_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: prontuarios
//   Policy "prontuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (usuario_id = auth.uid())
//     WITH CHECK: (usuario_id = auth.uid())
// Table: usuarios
//   Policy "anon_read_usuarios" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "usuarios_policy" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())

// --- DATABASE FUNCTIONS ---
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

// --- INDEXES ---
// Table: financeiro
//   CREATE UNIQUE INDEX financeiro_usuario_paciente_mes_ano_key ON public.financeiro USING btree (usuario_id, paciente_id, mes, ano)
// Table: prontuarios
//   CREATE UNIQUE INDEX prontuarios_paciente_id_key ON public.prontuarios USING btree (paciente_id)
