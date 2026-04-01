import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useAuth } from './use-auth'
import { supabase } from '@/lib/supabase/client'

interface AuthzContextType {
  role: string | null
  permissions: string[]
  loading: boolean
  hasPermission: (perm: string) => boolean
  getUserRole: () => string | null
}

const AuthzContext = createContext<AuthzContextType | undefined>(undefined)

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRole(null)
      setPermissions([])
      setLoading(false)
      return
    }

    const fetchRBAC = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_permissions', { p_user_id: user.id })
        if (data && !error) {
          setRole(data.role)
          setPermissions(data.permissions || [])
        } else {
          // Fallback based on userProfile
          const fallbackRole = userProfile?.role || 'professional'
          setRole(fallbackRole)
          setPermissions([])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRBAC()
  }, [user, userProfile])

  const hasPermission = (perm: string) => {
    if (role === 'admin' || role === 'superadmin') return true // Admins have all
    return permissions.includes(perm)
  }

  const getUserRole = () => role

  return (
    <AuthzContext.Provider value={{ role, permissions, loading, hasPermission, getUserRole }}>
      {children}
    </AuthzContext.Provider>
  )
}

export const useAuthorization = () => {
  const context = useContext(AuthzContext)
  if (!context) throw new Error('useAuthorization must be used within AuthorizationProvider')
  return context
}
