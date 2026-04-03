import Link from 'next/link'
import { getSession } from '@/lib/auth/session'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const session = await getSession()

  const dashboardLink = session
    ? session.role === 'admin'    ? '/admin'
    : session.role === 'empleado' ? '/empleado/calendario'
    : '/cliente/perfil'
    : null

  const isStaff = session && (session.role === 'admin' || session.role === 'empleado')

  return (
    <header className="sticky top-0 z-50 border-b border-[#1E293B]/80 bg-[#0F172A]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-[72px] items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow duration-200"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' }}>
            {/* Volante estilizado */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.8" strokeOpacity="0.9"/>
              <circle cx="11" cy="11" r="2.5" fill="white"/>
              <line x1="11" y1="2" x2="11" y2="8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="11" y1="13.5" x2="11" y2="20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="2" y1="11" x2="8.5" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="13.5" y1="11" x2="20" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-[#F1F5F9] tracking-tight group-hover:text-white transition-colors duration-200">
              DriveOne
            </span>
            <span className="text-[10px] font-medium text-[#64748B] tracking-widest uppercase mt-0.5">
              Motors
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">

          <NavLink href="/catalogo">Catálogo</NavLink>

          {session ? (
            <>
              {/* Avatar + nombre con link al dashboard */}
              <Link
                href={dashboardLink!}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 group transition-all duration-200 hover:bg-[#1E293B]"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 transition-all duration-200 ${
                  isStaff
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:bg-blue-600/30'
                    : 'bg-[#1E293B] border border-[#334155] text-[#94A3B8] group-hover:border-[#475569]'
                }`}>
                  {session.nombre[0]}{session.apellido[0]}
                </div>
                <div className="flex flex-col leading-none text-left">
                  <span className="text-xs font-semibold text-[#F1F5F9] group-hover:text-white transition-colors">
                    {session.nombre}
                  </span>
                  {isStaff && (
                    <span className="text-[10px] text-[#64748B] capitalize mt-0.5">{session.role}</span>
                  )}
                </div>
              </Link>

              <LogoutButton />
            </>
          ) : (
            <>
              <NavLink href="/login">Ingresar</NavLink>
              <Link
                href="/registro"
                className="ml-1 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative rounded-xl px-3.5 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B]/60 transition-all duration-200 group"
    >
      {children}
      <span className="absolute bottom-0 left-3.5 right-3.5 h-px bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full" />
    </Link>
  )
}
