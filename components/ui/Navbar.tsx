import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const session = await getSession()

  const dashboardLink = session
    ? session.role === 'admin'     ? '/admin'
    : session.role === 'empleado'  ? '/empleado/calendario'
    : '/cliente/reservas'
    : null

  const dashboardLabel = session
    ? session.role === 'admin'    ? 'Panel admin'
    : session.role === 'empleado' ? 'Panel'
    : session.nombre
    : null

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
            D
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">
            DriveOne <span className="text-slate-400 font-normal text-sm">Motors</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/catalogo"
            className="rounded-lg px-3 py-2 text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
          >
            Catálogo
          </Link>

          {session ? (
            <>
              <Link
                href={dashboardLink!}
                className="rounded-lg px-3 py-2 text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
              >
                {dashboardLabel}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 transition-all duration-150"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="ml-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200"
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
