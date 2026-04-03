import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV = [
  { href: '/empleado/calendario',     label: 'Calendario',     icon: '📅' },
  { href: '/empleado/vehiculos',      label: 'Vehículos',      icon: '🚗' },
  { href: '/empleado/disponibilidad', label: 'Disponibilidad', icon: '🕐' },
]

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) redirect('/login')

  return (
    <div className="min-h-screen flex bg-[#F3F5F9]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20">
              D
            </div>
            <span className="font-bold text-slate-900">DriveOne</span>
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {session.nombre[0]}{session.apellido[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 leading-none">{session.nombre} {session.apellido}</p>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{session.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {session.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
            >
              <span className="text-base">⚙️</span>
              Panel admin
            </Link>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
