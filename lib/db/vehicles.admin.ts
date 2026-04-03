import { query, queryOne } from './client'

export type VehicleInput = {
  marca: string
  modelo: string
  version?: string
  anio: number
  precio: number
  kilometraje: number
  combustible: string
  transmision: string
  color: string
  descripcion?: string
  tipo?: string
  estado_comercial?: 'disponible' | 'reservado' | 'vendido'
  publicado?: boolean
  destacado?: boolean
  orden_destacado?: number | null
}

export async function createVehicle(data: VehicleInput): Promise<number> {
  const result = await queryOne<{ id: number }>(
    `INSERT INTO vehicles
       (marca, modelo, version, anio, precio, kilometraje, combustible, transmision, color,
        descripcion, tipo, estado_comercial, publicado, destacado, orden_destacado)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id`,
    [
      data.marca, data.modelo, data.version ?? null,
      data.anio, data.precio, data.kilometraje,
      data.combustible, data.transmision, data.color,
      data.descripcion ?? null,
      data.tipo ?? null,
      data.estado_comercial ?? 'disponible',
      data.publicado ?? true,
      data.destacado ?? false,
      data.orden_destacado ?? null,
    ]
  )
  return result!.id
}

export async function updateVehicle(id: number, data: Partial<VehicleInput>) {
  const fields = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k], i) => `${k} = $${i + 2}`)
    .join(', ')
  const values = Object.values(data).filter(v => v !== undefined)
  if (!fields) return
  await query(`UPDATE vehicles SET ${fields}, updated_at = NOW() WHERE id = $1`, [id, ...values])
}

export async function deleteVehicle(id: number): Promise<{ error?: string }> {
  const future = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM appointments
     WHERE vehicle_id = $1 AND fecha_hora > NOW() AND estado = 'confirmada'`,
    [id]
  )
  if (future && parseInt(future.count) > 0) {
    return { error: `No se puede eliminar: tiene ${future.count} reserva(s) futura(s) activa(s)` }
  }
  await query(`UPDATE vehicles SET deleted_at = NOW() WHERE id = $1`, [id])
  return {}
}

export async function addVehicleImage(vehicleId: number, url: string, esPortada: boolean, orden: number) {
  if (esPortada) {
    await query(`UPDATE vehicle_images SET es_portada = FALSE WHERE vehicle_id = $1`, [vehicleId])
  }
  await query(
    `INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES ($1,$2,$3,$4)`,
    [vehicleId, url, esPortada, orden]
  )
}

export async function deleteVehicleImage(imageId: number) {
  await query(`DELETE FROM vehicle_images WHERE id = $1`, [imageId])
}

export async function setPortada(imageId: number, vehicleId: number) {
  await query(`UPDATE vehicle_images SET es_portada = FALSE WHERE vehicle_id = $1`, [vehicleId])
  await query(`UPDATE vehicle_images SET es_portada = TRUE WHERE id = $1`, [imageId])
}

export async function updateImageOrder(imageId: number, orden: number) {
  await query(`UPDATE vehicle_images SET orden = $1 WHERE id = $2`, [orden, imageId])
}

export async function getAllVehiclesAdmin() {
  return query<{
    id: number; marca: string; modelo: string; version: string | null
    anio: number; precio: number; tipo: string | null
    estado_comercial: string; publicado: boolean
    destacado: boolean; deleted_at: string | null
    portada_url: string | null; total_reservas: string
  }>(
    `SELECT
       v.id, v.marca, v.modelo, v.version, v.anio, v.precio,
       v.tipo, v.estado_comercial, v.publicado,
       v.destacado, v.deleted_at,
       img.url AS portada_url,
       COUNT(a.id)::text AS total_reservas
     FROM vehicles v
     LEFT JOIN vehicle_images img ON img.vehicle_id = v.id AND img.es_portada = TRUE
     LEFT JOIN appointments a ON a.vehicle_id = v.id AND a.estado != 'cancelada'
     GROUP BY v.id, img.url
     ORDER BY v.created_at DESC`
  )
}
