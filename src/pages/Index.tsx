import { useAuthorization } from '@/hooks/use-authorization'
import { ClinicOwnerDashboard } from '@/components/dashboards/ClinicOwnerDashboard'
import { ProfessionalDashboard } from '@/components/dashboards/ProfessionalDashboard'
import { SecretaryDashboard } from '@/components/dashboards/SecretaryDashboard'
import { PatientDashboard } from '@/components/dashboards/PatientDashboard'
import { Loader2 } from 'lucide-react'

export default function Index() {
  const { getUserRole, loading } = useAuthorization()

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const role = getUserRole()

  if (role === 'admin' || role === 'superadmin' || role === 'clinic_owner') {
    return <ClinicOwnerDashboard />
  }

  if (role === 'secretary') {
    return <SecretaryDashboard />
  }

  if (role === 'patient') {
    return <PatientDashboard />
  }

  return <ProfessionalDashboard />
}
