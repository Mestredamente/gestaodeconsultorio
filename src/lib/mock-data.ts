export const mockPatients = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 98765-4321',
    lastSession: '2023-10-25',
    status: 'Ativo',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.s@email.com',
    phone: '(11) 91234-5678',
    lastSession: '2023-10-20',
    status: 'Ativo',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
  },
  {
    id: '3',
    name: 'Beatriz Costa',
    email: 'beatriz.c@email.com',
    phone: '(11) 99876-1234',
    lastSession: '2023-09-15',
    status: 'Inativo',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
  },
  {
    id: '4',
    name: 'Diego Ferreira',
    email: 'diego.f@email.com',
    phone: '(11) 94567-8901',
    lastSession: '2023-10-26',
    status: 'Ativo',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
  },
]

export const mockAppointments = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Ana Silva',
    time: '09:00',
    duration: '50min',
    type: 'Individual',
    status: 'Confirmado',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Carlos Santos',
    time: '11:00',
    duration: '50min',
    type: 'Terapia de Casal',
    status: 'Pendente',
  },
  {
    id: '3',
    patientId: '4',
    patientName: 'Diego Ferreira',
    time: '14:30',
    duration: '50min',
    type: 'Individual',
    status: 'Concluído',
  },
]

export const mockTransactions = [
  {
    id: '1',
    description: 'Sessão - Ana Silva',
    date: '2023-10-26',
    amount: 150.0,
    status: 'Recebido',
  },
  {
    id: '2',
    description: 'Sessão - Carlos Santos',
    date: '2023-10-26',
    amount: 200.0,
    status: 'Pendente',
  },
  {
    id: '3',
    description: 'Supervisão Clínica',
    date: '2023-10-25',
    amount: 300.0,
    status: 'Recebido',
  },
  {
    id: '4',
    description: 'Sessão - Beatriz Costa',
    date: '2023-10-15',
    amount: 150.0,
    status: 'Atrasado',
  },
]

export const mockChartData = [
  { month: 'Mai', sessoes: 45 },
  { month: 'Jun', sessoes: 52 },
  { month: 'Jul', sessoes: 48 },
  { month: 'Ago', sessoes: 61 },
  { month: 'Set', sessoes: 59 },
  { month: 'Out', sessoes: 72 },
]

export const mockFinanceChartData = [
  { month: 'Mai', faturamento: 5400, despesas: 1200 },
  { month: 'Jun', faturamento: 6200, despesas: 1300 },
  { month: 'Jul', faturamento: 5800, despesas: 1250 },
  { month: 'Ago', faturamento: 7100, despesas: 1400 },
  { month: 'Set', faturamento: 6900, despesas: 1350 },
  { month: 'Out', faturamento: 8450, despesas: 1500 },
]

export const mockProntuarios = [
  {
    id: '1',
    date: '2023-10-25',
    content:
      'Paciente relatou melhora nos quadros de ansiedade durante a semana. Discutimos técnicas de respiração diafragmática.',
  },
  {
    id: '2',
    date: '2023-10-18',
    content: 'Sessão focada em identificar gatilhos emocionais no ambiente de trabalho.',
  },
]
