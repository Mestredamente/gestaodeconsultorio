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
import PublicBooking from './pages/PublicBooking'
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
      <Route path="/relatorios" element={<Reports />} />
      <Route path="/estoque" element={<Stock />} />
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
