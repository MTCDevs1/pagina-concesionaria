import { query } from './client'

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'REGISTER'
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'CANCEL' | 'REASSIGN' | 'STATUS_UPDATE'

export async function logAudit(params: {
  action: AuditAction
  entityType: string
  entityId?: number
  userId?: number
  oldData?: unknown
  newData?: unknown
  ip?: string
}) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.userId ?? null,
        params.action,
        params.entityType,
        params.entityId ?? null,
        params.oldData ? JSON.stringify(params.oldData) : null,
        params.newData ? JSON.stringify(params.newData) : null,
        params.ip ?? null,
      ]
    )
  } catch {
    // Audit failures nunca deben romper el flujo principal
  }
}

/** Extrae la IP real de un NextRequest */
export function getIp(req: { headers: { get: (k: string) => string | null } }): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  )
}
