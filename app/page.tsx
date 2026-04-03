export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getFeaturedVehicles } from '@/lib/db/vehicles'
import VehicleCard from '@/components/vehicles/VehicleCard'
import Navbar from '@/components/ui/Navbar'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export default async function HomePage() {
  const featured = await getFeaturedVehicles(6)

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#1a3464] to-slate-900">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              Nueva colección disponible
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Encontrá tu<br />
              <span className="text-blue-400">próximo auto</span>
            </h1>
            <p className="mt-5 text-lg text-slate-300 max-w-lg leading-relaxed">
              Explorá nuestro catálogo, reservá una visita y viví la experiencia DriveOne Motors.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 hover:shadow-blue-500/40 transition-all duration-200"
              >
                Ver vehículos
              </Link>
              <Link
                href="/registro"
                className="rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESTACADOS ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Selección premium</p>
              <h2 className="text-2xl font-bold text-slate-900">Vehículos destacados</h2>
            </div>
            <Link
              href="/catalogo"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              Ver catálogo completo
              <span className="text-base">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((v, i) => (
              <div key={v.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── BENEFICIOS ──────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">¿Por qué elegirnos?</p>
            <h2 className="text-2xl font-bold text-slate-900">La experiencia DriveOne</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: '🚗',
                title: 'Catálogo curado',
                desc: 'Selección de vehículos verificados con ficha técnica completa e imágenes reales.',
              },
              {
                icon: '📅',
                title: 'Reserva en segundos',
                desc: 'Agendá tu visita online, sin llamadas ni esperas. Con o sin cuenta.',
              },
              {
                icon: '🤝',
                title: 'Asesor dedicado',
                desc: 'Cada visita con un asesor exclusivo. Cancelá hasta 30 min antes sin costo.',
              },
            ].map((b, i) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-slate-200 bg-[#F8FAFC] p-7 hover:border-blue-200 hover:bg-blue-50/50 hover:-translate-y-1 transition-all duration-250 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-3xl mb-4 block">{b.icon}</span>
                <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 p-10 md:p-16 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Empezá hoy</p>
              <h2 className="text-3xl font-bold leading-tight mb-5">
                ¿Listo para conocer<br />tu próximo auto?
              </h2>
              <p className="text-slate-400 mb-8 max-w-sm">
                Más de 20 vehículos disponibles. Reservá tu visita sin compromiso y explorá con libertad.
              </p>
              <Link
                href="/catalogo"
                className="inline-block rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all duration-200"
              >
                Explorar catálogo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: '20+', label: 'Vehículos' },
                { n: '100%', label: 'Verificados' },
                { n: '0', label: 'Comisión' },
                { n: '24/7', label: 'Reservas online' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl bg-white/10 border border-white/10 p-5 backdrop-blur-sm">
                  <p className="text-2xl font-bold text-white">{s.n}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">D</span>
              <span className="text-sm font-semibold text-slate-800">DriveOne Motors</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/catalogo" className="hover:text-slate-800 transition-colors">Catálogo</Link>
              <Link href="/login"    className="hover:text-slate-800 transition-colors">Ingresar</Link>
              <Link href="/registro" className="hover:text-slate-800 transition-colors">Registrarse</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} DriveOne Motors. Todos los derechos reservados.</p>
            <p>Desarrollado por <span className="font-medium text-slate-500">MTCDevs</span></p>
          </div>
        </div>
      </footer>
    </>
  )
}
