import { Outlet } from 'react-router-dom'
import { Sidebar } from './layout/Sidebar'
import { MobileNav } from './layout/MobileNav'
import { Header } from './layout/Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen transition-all">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
