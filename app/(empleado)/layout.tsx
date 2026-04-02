import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV = [
  { href: '/empleado/calendario',    label: 'Calendario' },
  { href: '/empleado/vehiculos',     label: 'Vehículos' },
  { href: '/empleado/disponibilidad', label: 'Disponibilidad' },
]

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || !['empleado', 'admin'].includes(session.role)) redirect('/login')

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-200">
          <Link href="/" className="text-lg font-bold text-gray-900">DriveOne</Link>
          <p className="text-xs text-gray-500 mt-0.5">{session.nombre} {session.apellido}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              {item.label}
            </Link>
          ))}
          {session.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              Panel admin
            </Link>
          )}
        </nav>
        <div className="px-5 py-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
