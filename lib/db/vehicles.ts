import { query, queryOne } from './client'

export type Vehicle = {
  id: number
  marca: string
  modelo: string
  version: string | null
  anio: number
  precio: number
  kilometraje: number
  combustible: string
  transmision: string
  color: string
  descripcion: string | null
  destacado: boolean
  orden_destacado: number | null
  portada_url: string | null
}

export type VehicleWithImages = Vehicle & {
  images: { id: number; url: string; es_portada: boolean; orden: number }[]
}

export type VehicleFilters = {
  marca?: string
  combustible?: string
  transmision?: string
  anio_min?: number
  anio_max?: number
  precio_min?: number
  precio_max?: number
  km_max?: number
  q?: string
}

// ─── CATÁLOGO ────────────────────────────────────────────────
export async function getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const conditions: string[] = ['v.deleted_at IS NULL']
  const params: unknown[] = []
  let i = 1

  if (filters.marca) {
    conditions.push(`v.marca ILIKE $${i++}`)
    params.push(`%${filters.marca}%`)
  }
  if (filters.combustible) {
    conditions.push(`v.combustible = $${i++}`)
    params.push(filters.combustible)
  }
  if (filters.transmision) {
    conditions.push(`v.transmision = $${i++}`)
    params.push(filters.transmision)
  }
  if (filters.anio_min) {
    conditions.push(`v.anio >= $${i++}`)
    params.push(filters.anio_min)
  }
  if (filters.anio_max) {
    conditions.push(`v.anio <= $${i++}`)
    params.push(filters.anio_max)
  }
  if (filters.precio_min) {
    conditions.push(`v.precio >= $${i++}`)
    params.push(filters.precio_min)
  }
  if (filters.precio_max) {
    conditions.push(`v.precio <= $${i++}`)
    params.push(filters.precio_max)
  }
  if (filters.km_max) {
    conditions.push(`v.kilometraje <= $${i++}`)
    params.push(filters.km_max)
  }
  if (filters.q) {
    conditions.push(`(v.marca ILIKE $${i} OR v.modelo ILIKE $${i} OR v.version ILIKE $${i})`)
    params.push(`%${filters.q}%`)
    i++
  }

  const where = conditions.join(' AND ')

  return query<Vehicle>(
    `SELECT
       v.*,
       img.url AS portada_url
     FROM vehicles v
     LEFT JOIN vehicle_images img
       ON img.vehicle_id = v.id AND img.es_portada = TRUE
     WHERE ${where}
     ORDER BY v.created_at DESC`,
    params
  )
}

// ─── DESTACADOS ──────────────────────────────────────────────
export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  return query<Vehicle>(
    `SELECT
       v.*,
       img.url AS portada_url
     FROM vehicles v
     LEFT JOIN vehicle_images img
       ON img.vehicle_id = v.id AND img.es_portada = TRUE
     WHERE v.deleted_at IS NULL AND v.destacado = TRUE
     ORDER BY v.orden_destacado ASC NULLS LAST
     LIMIT $1`,
    [limit]
  )
}

// ─── DETALLE ─────────────────────────────────────────────────
export async function getVehicleById(id: number): Promise<VehicleWithImages | null> {
  const vehicle = await queryOne<Vehicle>(
    `SELECT v.*, img.url AS portada_url
     FROM vehicles v
     LEFT JOIN vehicle_images img ON img.vehicle_id = v.id AND img.es_portada = TRUE
     WHERE v.id = $1 AND v.deleted_at IS NULL`,
    [id]
  )
  if (!vehicle) return null

  const images = await query<{ id: number; url: string; es_portada: boolean; orden: number }>(
    `SELECT id, url, es_portada, orden
     FROM vehicle_images
     WHERE vehicle_id = $1
     ORDER BY orden ASC`,
    [id]
  )

  return { ...vehicle, images }
}

// ─── FILTROS DISPONIBLES ─────────────────────────────────────
export async function getFilterOptions() {
  const [marcas, combustibles, transmisiones, years] = await Promise.all([
    query<{ marca: string }>(`SELECT DISTINCT marca FROM vehicles WHERE deleted_at IS NULL ORDER BY marca`),
    query<{ combustible: string }>(`SELECT DISTINCT combustible FROM vehicles WHERE deleted_at IS NULL ORDER BY combustible`),
    query<{ transmision: string }>(`SELECT DISTINCT transmision FROM vehicles WHERE deleted_at IS NULL ORDER BY transmision`),
    query<{ anio: number }>(`SELECT DISTINCT anio FROM vehicles WHERE deleted_at IS NULL ORDER BY anio DESC`),
  ])
  return {
    marcas: marcas.map(r => r.marca),
    combustibles: combustibles.map(r => r.combustible),
    transmisiones: transmisiones.map(r => r.transmision),
    years: years.map(r => r.anio),
  }
}
