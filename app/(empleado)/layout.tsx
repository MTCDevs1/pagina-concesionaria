import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV = [
  { href: '/empleado/calendario',     label: 'Calendario',     icon: '◷' },
  { href: '/empleado/vehiculos',      label: 'Vehículos',      icon: '▣' },
  { href: '/empleado/disponibilidad', label: 'Disponibilidad', icon: '◈' },
]

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) redirect('/login')

  return (
    <div className="min-h-screen flex bg-[#0F172A]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#020617] border-r border-[#1E293B] flex flex-col">
        {/* Logo + user */}
        <div className="px-5 py-5 border-b border-[#1E293B]">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30">
              D
            </div>
            <span className="font-bold text-white text-sm">DriveOne</span>
          </Link>
          <div className="flex items-center gap-2.5 bg-[#0F172A] rounded-xl px-3 py-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E293B] border border-[#334155] text-xs font-bold text-[#94A3B8] shrink-0">
              {session.nombre[0]}{session.apellido[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#F1F5F9] leading-none truncate">{session.nombre} {session.apellido}</p>
              <p className="text-xs text-[#64748B] mt-0.5 capitalize">{session.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#0F172A] hover:text-[#F1F5F9] transition-all duration-150"
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          {session.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#0F172A] hover:text-[#F1F5F9] transition-all duration-150"
            >
              <span className="w-4 text-center">◉</span>
              Panel admin
            </Link>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-[#1E293B]">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#0F172A]">{children}</main>
    </div>
  )
}
