import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const session = await getSession()

  const dashboardLink = session
    ? session.role === 'admin'
      ? '/admin'
      : session.role === 'empleado'
        ? '/empleado/calendario'
        : '/cliente/reservas'
    : null

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          DriveOne
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/catalogo" className="text-gray-600 hover:text-gray-900 transition">
            Vehículos
          </Link>

          {session ? (
            <>
              <Link href={dashboardLink!} className="text-gray-600 hover:text-gray-900 transition">
                {session.nombre}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
