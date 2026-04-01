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
    nome?: string,
    especialidade?: string,
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
    let mounted = true

    const clearLocalData = () => {
      try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
        sessionStorage.clear()
      } catch (e) {
        console.error('Failed to clear storage:', e)
      }
    }

    const handleAuthError = (err: any) => {
      if (!mounted) return
      const msg = err?.message || err?.error_description || String(err) || ''
      if (
        msg.toLowerCase().includes('refresh token') ||
        msg.toLowerCase().includes('session missing') ||
        msg.toLowerCase().includes('invalid token')
      ) {
        console.warn('Invalid session detected, clearing local data...')
        clearLocalData()

        supabase.auth.signOut().catch(() => {})
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      if (event.reason) {
        const msg =
          event.reason.message || event.reason.error_description || String(event.reason) || ''
        if (
          msg.toLowerCase().includes('refresh token') ||
          msg.toLowerCase().includes('session missing') ||
          msg.toLowerCase().includes('invalid token')
        ) {
          event.preventDefault()
          event.stopPropagation()
          handleAuthError(event.reason)
        }
      }
    }

    const errorHandler = (event: ErrorEvent) => {
      const msg = event.message || event.error?.message || ''
      if (
        msg.toLowerCase().includes('refresh token') ||
        msg.toLowerCase().includes('session missing') ||
        msg.toLowerCase().includes('invalid token')
      ) {
        event.preventDefault()
        event.stopPropagation()
        handleAuthError(event.error)
      }
    }

    window.addEventListener('unhandledrejection', unhandledRejectionHandler)
    window.addEventListener('error', errorHandler)

    // Override console.error temporarily to suppress unhandled library errors from crashing the UI overlay
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const msg = args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ')
        .toLowerCase()
      if (
        msg.includes('refresh token') ||
        msg.includes('session missing') ||
        msg.includes('invalid token')
      ) {
        handleAuthError(new Error('Suppressed Auth Error'))
        return
      }
      originalConsoleError.apply(console, args)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT') {
        clearLocalData()
        setSession(null)
        setUser(null)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return
        if (error) {
          handleAuthError(error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      })
      .catch((err) => {
        if (!mounted) return
        handleAuthError(err)
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
      window.removeEventListener('error', errorHandler)
      console.error = originalConsoleError
    }
  }, [])

  const signUp = async (
    email: string,
    password: string,
    clinicName?: string,
    nome?: string,
    especialidade?: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome_consultorio: clinicName, nome, especialidade },
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
