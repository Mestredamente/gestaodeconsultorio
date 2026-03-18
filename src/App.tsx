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
import Marketing from './pages/Marketing'
import TelehealthSession from './pages/TelehealthSession'
import PublicTelehealth from './pages/PublicTelehealth'
import PublicBooking from './pages/PublicBooking'
import PublicAnamnesis from './pages/PublicAnamnesis'
import PublicPortal from './pages/PublicPortal'
import PublicPrescription from './pages/PublicPrescription'
import PublicConfirmation from './pages/PublicConfirmation'
import NotFound from './pages/NotFound'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import UpdatePassword from './pages/UpdatePassword'

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
    <Route path="/validar-prescricao/:hash" element={<PublicPrescription />} />
    <Route path="/confirmar/:hash/:appointmentId" element={<PublicConfirmation />} />

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
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/pacientes" element={<Patients />} />
      <Route path="/pacientes/:id" element={<PatientDetail />} />
      <Route path="/pacientes/:id/prontuario" element={<PatientRecord />} />
      <Route path="/carteira" element={<Finances />} />
      <Route path="/financeiro" element={<Navigate to="/carteira" replace />} />
      <Route path="/marketing" element={<Marketing />} />
      <Route path="/relatorios" element={<Reports />} />
      <Route path="/estoque" element={<Stock />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/configuracoes" element={<Settings />} />
      <Route path="/perfil" element={<Navigate to="/configuracoes" replace />} />
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
