import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const session = await getSession()

  const dashboardLink = session
    ? session.role === 'admin'    ? '/admin'
    : session.role === 'empleado' ? '/empleado/calendario'
    : '/cliente/reservas'
    : null

  const dashboardLabel = session
    ? session.role === 'admin'    ? 'Panel admin'
    : session.role === 'empleado' ? 'Panel'
    : session.nombre
    : null

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#0F172A]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors duration-200">
            D
          </span>
          <span className="text-sm font-bold tracking-tight text-[#F1F5F9]">
            DriveOne <span className="text-[#64748B] font-normal">Motors</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/catalogo"
            className="rounded-xl px-3.5 py-2 text-[#94A3B8] font-medium hover:text-[#F1F5F9] hover:bg-[#1E293B] transition-all duration-180"
          >
            Catálogo
          </Link>

          {session ? (
            <>
              <Link
                href={dashboardLink!}
                className="rounded-xl px-3.5 py-2 text-[#94A3B8] font-medium hover:text-[#F1F5F9] hover:bg-[#1E293B] transition-all duration-180"
              >
                {dashboardLabel}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-[#94A3B8] font-medium hover:text-[#F1F5F9] hover:bg-[#1E293B] transition-all duration-180"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="ml-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
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
