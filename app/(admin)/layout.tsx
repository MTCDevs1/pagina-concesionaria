import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import LogoutButton from '@/components/ui/LogoutButton'

const NAV = [
  { href: '/admin',           label: 'Dashboard' },
  { href: '/admin/usuarios',  label: 'Usuarios' },
  { href: '/admin/reservas',  label: 'Reservas' },
  { href: '/admin/metricas',  label: 'Métricas' },
  { href: '/admin/auditoria', label: 'Auditoría' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 bg-gray-950 text-gray-300 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/" className="text-lg font-bold text-white">DriveOne</Link>
          <p className="text-xs text-gray-500 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm hover:bg-gray-800 hover:text-white transition">
              {item.label}
            </Link>
          ))}
          <Link href="/empleado/calendario"
            className="flex items-center rounded-lg px-3 py-2 text-sm hover:bg-gray-800 hover:text-white transition">
            Panel empleado
          </Link>
        </nav>
        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">{session.nombre} {session.apellido}</p>
          <LogoutButton className="text-sm text-gray-400 hover:text-white transition" />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
