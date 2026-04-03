import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV = [
  { href: '/admin',           label: 'Dashboard', icon: '📊' },
  { href: '/admin/usuarios',  label: 'Usuarios',  icon: '👥' },
  { href: '/admin/reservas',  label: 'Reservas',  icon: '📅' },
  { href: '/admin/metricas',  label: 'Métricas',  icon: '📈' },
  { href: '/admin/auditoria', label: 'Auditoría', icon: '🔍' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen flex bg-[#F3F5F9]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-900 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/30">
              D
            </div>
            <span className="font-bold text-white">DriveOne</span>
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
              {session.nombre[0]}{session.apellido[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 leading-none">{session.nombre} {session.apellido}</p>
              <p className="text-xs text-slate-500 mt-0.5">Administrador</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 mt-2">
            <Link
              href="/empleado/calendario"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-white transition-all duration-150"
            >
              <span className="text-base">🗓️</span>
              Panel empleado
            </Link>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <LogoutButton className="text-sm text-slate-400 hover:text-white transition-colors" />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
