export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getFeaturedVehicles } from '@/lib/db/vehicles'
import VehicleCard from '@/components/vehicles/VehicleCard'
import Navbar from '@/components/ui/Navbar'

export default async function HomePage() {
  const featured = await getFeaturedVehicles(6)

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#0f1e3a] to-[#111827] min-h-[88vh] flex items-center">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-[#1D4ED8]/5 blur-[160px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Texto */}
            <div className="animate-slide-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-8 tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Nueva colección disponible
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
                Encontrá tu<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                  próximo auto
                </span>
              </h1>

              <p className="mt-6 text-lg text-[#94A3B8] max-w-md leading-relaxed">
                Explorá nuestro catálogo curado, reservá una visita y viví la experiencia DriveOne Motors.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/catalogo"
                  className="btn-primary text-base px-8 py-3.5 rounded-2xl"
                >
                  Ver vehículos
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#334155] bg-[#1E293B]/60 px-8 py-3.5 text-base font-semibold text-[#F1F5F9] backdrop-blur-sm hover:bg-[#334155] hover:-translate-y-0.5 transition-all duration-200"
                >
                  Crear cuenta
                </Link>
              </div>

              {/* Stats inline */}
              <div className="mt-12 flex flex-wrap gap-8">
                {[
                  { n: '20+', label: 'Vehículos' },
                  { n: '100%', label: 'Verificados' },
                  { n: '0', label: 'Comisión' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white">{s.n}</p>
                    <p className="text-xs text-[#64748B] mt-0.5 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual side — cards stack decorative */}
            <div className="hidden lg:flex justify-center items-center animate-fade-in delay-200">
              <div className="relative w-full max-w-sm">
                {/* Card decorativa de fondo */}
                <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-blue-600/10 border border-blue-500/15" />
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-[#1E293B] border border-[#334155]" />
                {/* Card principal */}
                <div className="relative card-dark rounded-3xl p-6 shadow-2xl shadow-black/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    <span className="text-xs text-[#64748B] font-medium">Disponible ahora</span>
                  </div>
                  <p className="text-[#94A3B8] text-xs uppercase tracking-widest mb-1">Selección premium</p>
                  <p className="text-2xl font-bold text-white mb-1">Toyota · Honda</p>
                  <p className="text-[#64748B] text-sm mb-5">VW · BMW · Ford · Jeep y más</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#64748B]">Desde</p>
                      <p className="text-xl font-bold text-blue-400">USD 18.500</p>
                    </div>
                    <div className="rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300">
                      Reservar →
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#334155] flex gap-2">
                    {['Sedán', 'SUV', 'Pickup', 'Hatchback'].map(t => (
                      <span key={t} className="rounded-lg bg-[#334155] px-2.5 py-1 text-xs text-[#94A3B8] font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── DESTACADOS ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-[#111827] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Selección premium</p>
                <h2 className="text-3xl font-bold text-white">Vehículos destacados</h2>
              </div>
              <Link
                href="/catalogo"
                className="text-sm font-medium text-[#94A3B8] hover:text-blue-400 transition-colors flex items-center gap-1.5"
              >
                Ver todo <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((v, i) => (
                <div key={v.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <VehicleCard vehicle={v} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFICIOS ──────────────────────────────────────── */}
      <section className="bg-[#0F172A] py-24 border-t border-[#1E293B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">¿Por qué elegirnos?</p>
            <h2 className="text-3xl font-bold text-white">La experiencia DriveOne</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                className="card-dark rounded-2xl p-8 hover:border-blue-500/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-250 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-3xl mb-5 block">{b.icon}</span>
                <h3 className="font-bold text-[#F1F5F9] mb-2">{b.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#111827] py-24 border-t border-[#1E293B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#1E40AF] p-10 md:p-16">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-blue-600/20 blur-2xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">Empezá hoy</p>
                <h2 className="text-3xl font-bold text-white leading-tight mb-5">
                  ¿Listo para conocer<br />tu próximo auto?
                </h2>
                <p className="text-blue-200 mb-8 max-w-sm">
                  Más de 20 vehículos disponibles. Reservá tu visita sin compromiso y explorá con libertad.
                </p>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
                >
                  Explorar catálogo →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { n: '20+', label: 'Vehículos' },
                  { n: '100%', label: 'Verificados' },
                  { n: '0', label: 'Comisión' },
                  { n: '24/7', label: 'Reservas online' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-white/10 border border-white/15 p-5 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-white">{s.n}</p>
                    <p className="text-sm text-blue-200 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-[#1E293B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white text-xs font-bold">D</span>
              <span className="text-sm font-semibold text-[#F1F5F9]">DriveOne Motors</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#64748B]">
              <Link href="/catalogo" className="hover:text-[#F1F5F9] transition-colors">Catálogo</Link>
              <Link href="/login"    className="hover:text-[#F1F5F9] transition-colors">Ingresar</Link>
              <Link href="/registro" className="hover:text-[#F1F5F9] transition-colors">Registrarse</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#334155]">
            <p>© {new Date().getFullYear()} DriveOne Motors. Todos los derechos reservados.</p>
            <p>Desarrollado por <span className="text-[#64748B]">MTCDevs</span></p>
          </div>
        </div>
      </footer>
    </>
  )
}
