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

      {/* Hero */}
      <section className="bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
            Encontrá tu próximo auto
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Explorá nuestro catálogo y reservá una visita sin compromiso.
          </p>
          <Link
            href="/catalogo"
            className="mt-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold hover:bg-blue-500 transition"
          >
            Ver vehículos
          </Link>
        </div>
      </section>

      {/* Destacados */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Destacados</h2>
            <Link href="/catalogo" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(v => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            { title: 'Reserva online', desc: 'Coordiná tu visita sin llamadas ni esperas.' },
            { title: 'Atención personalizada', desc: 'Cada visita con un asesor dedicado a vos.' },
            { title: 'Sin compromiso', desc: 'Cancelá hasta 30 minutos antes sin costo.' },
          ].map(b => (
            <div key={b.title} className="space-y-2">
              <h3 className="font-semibold text-gray-900">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Listo para conocer tu auto?</h2>
        <Link
          href="/catalogo"
          className="inline-block rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-700 transition"
        >
          Ver catálogo
        </Link>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} DriveOne Motors
      </footer>
    </>
  )
}
