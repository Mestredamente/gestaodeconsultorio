import { ReactNode } from 'react'
import { useAuthorization } from '@/hooks/use-authorization'

interface ProtectedComponentProps {
  requiredPermission?: string
  allowedRoles?: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedComponent({
  requiredPermission,
  allowedRoles,
  children,
  fallback = null,
}: ProtectedComponentProps) {
  const { hasPermission, getUserRole, loading } = useAuthorization()

  if (loading) return null

  const role = getUserRole()

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
