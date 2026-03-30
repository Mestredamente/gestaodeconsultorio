import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Agenda from './pages/Agenda'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import PatientRecord from './pages/PatientRecord'
import Finances from './pages/Finances'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Stock from './pages/Stock'
import Logs from './pages/Logs'
import Notifications from './pages/Notifications'
import Marketing from './pages/Marketing'
import Supervision from './pages/Supervision'
import TelehealthSession from './pages/TelehealthSession'
import PublicTelehealth from './pages/PublicTelehealth'
import PublicBooking from './pages/PublicBooking'
import PublicAnamnesis from './pages/PublicAnamnesis'
import PublicPortal from './pages/PublicPortal'
import PublicPrescription from './pages/PublicPrescription'
import PublicConfirmation from './pages/PublicConfirmation'
import PublicVirtualRoom from './pages/PublicVirtualRoom'
import NotFound from './pages/NotFound'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import UpdatePassword from './pages/UpdatePassword'
import Plans from './pages/Plans'
import Onboarding from './pages/Onboarding'
import HR from './pages/HR'
import VirtualRoom from './pages/VirtualRoom'
import Contacts from './pages/Contacts'
import NewPatientForm from './components/NewPatientForm'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (!session) return <Navigate to="/auth" replace />
  return <>{children}</>
}

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/recuperar-senha" element={<ResetPassword />} />
    <Route path="/atualizar-senha" element={<UpdatePassword />} />
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    <Route path="/agendar/:clinicId" element={<PublicBooking />} />
    <Route path="/anamnese/:hash" element={<PublicAnamnesis />} />
    <Route path="/portal/:hash" element={<PublicPortal />} />
    <Route path="/sessao/:hash" element={<PublicTelehealth />} />
    <Route path="/sala-virtual/:id/:token" element={<PublicVirtualRoom />} />
    <Route path="/validar-prescricao/:hash" element={<PublicPrescription />} />
    <Route path="/confirmar/:hash/:appointmentId" element={<PublicConfirmation />} />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      }
    />
    <Route
      path="/planos"
      element={
        <ProtectedRoute>
          <div className="min-h-screen bg-slate-50/50">
            <Plans />
          </div>
        </ProtectedRoute>
      }
    />
    <Route
      path="/atendimento/:agendamentoId"
      element={
        <ProtectedRoute>
          <TelehealthSession />
        </ProtectedRoute>
      }
    />
    <Route
      path="/consulta-online/:agendamentoId"
      element={
        <ProtectedRoute>
          <TelehealthSession />
        </ProtectedRoute>
      }
    />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Index />} />
      <Route path="/sala-virtual" element={<VirtualRoom />} />
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/pacientes" element={<Patients />} />
      <Route
        path="/pacientes/novo"
        element={
          <div className="max-w-4xl mx-auto py-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6 px-4 md:px-0">
              Novo Paciente
            </h1>
            <NewPatientForm />
          </div>
        }
      />
      <Route path="/pacientes/:id" element={<PatientDetail />} />
      <Route path="/pacientes/:id/prontuario" element={<PatientRecord />} />
      <Route path="/carteira" element={<Finances />} />
      <Route path="/financeiro" element={<Navigate to="/carteira" replace />} />
      <Route path="/rh" element={<HR />} />
      <Route path="/marketing" element={<Marketing />} />
      <Route path="/supervisao" element={<Supervision />} />
      <Route path="/relatorios" element={<Reports />} />
      <Route path="/estoque" element={<Stock />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/notificacoes" element={<Notifications />} />
      <Route path="/configuracoes" element={<Settings />} />
      <Route path="/perfil" element={<Navigate to="/configuracoes" replace />} />
      <Route path="/contatos" element={<Contacts />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
