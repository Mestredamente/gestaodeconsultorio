import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (
    email: string,
    password: string,
    clinicName?: string,
  ) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, clinicName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: clinicName ? { nome_consultorio: clinicName } : undefined,
      },
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/agenda`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      })

      if (error) {
        const isEmailProviderDisabled =
          error.code === 'email_provider_disabled' ||
          (error.status === 400 &&
            error.message?.toLowerCase().includes('email provider is disabled')) ||
          (error.status === 400 && error.message?.toLowerCase().includes('provider is disabled'))

        if (isEmailProviderDisabled) {
          return {
            error: {
              name: error.name || 'Error',
              message:
                'O serviço de envio de e-mails está temporariamente indisponível. Por favor, tente novamente mais tarde ou contate o administrador.',
              status: error.status || 400,
              code: 'email_provider_disabled',
            },
          }
        }
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      const isEmailProviderDisabled =
        error?.code === 'email_provider_disabled' ||
        (error?.status === 400 &&
          error?.message?.toLowerCase().includes('email provider is disabled')) ||
        (error?.status === 400 && error?.message?.toLowerCase().includes('provider is disabled'))

      if (isEmailProviderDisabled) {
        return {
          error: {
            name: error?.name || 'Error',
            message:
              'O serviço de envio de e-mails está temporariamente indisponível. Por favor, tente novamente mais tarde ou contate o administrador.',
            status: error?.status || 400,
            code: 'email_provider_disabled',
          },
        }
      }
      return {
        error: {
          message: error?.message || 'Ocorreu um erro inesperado. Tente novamente.',
          name: error?.name || 'UnexpectedError',
        },
      }
    }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
