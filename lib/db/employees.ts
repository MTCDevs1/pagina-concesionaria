import { query, queryOne } from './client'

export type Employee = {
  id: number
  nombre: string
  apellido: string
}

export type EmployeeAvailability = {
  id: number
  employee_id: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
  pausa_inicio: string | null
  pausa_fin: string | null
}

export async function getActiveEmployees(): Promise<Employee[]> {
  return query<Employee>(
    `SELECT u.id, u.nombre, u.apellido
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.name IN ('empleado', 'admin') AND u.activo = TRUE
     ORDER BY u.nombre`
  )
}

export async function getEmployeeAvailability(
  employeeId: number,
  diaSemana: number
): Promise<EmployeeAvailability | null> {
  return queryOne<EmployeeAvailability>(
    `SELECT * FROM employee_availability
     WHERE employee_id = $1 AND dia_semana = $2`,
    [employeeId, diaSemana]
  )
}

export async function hasException(employeeId: number, fecha: string): Promise<boolean> {
  const row = await queryOne(
    `SELECT 1 FROM employee_exceptions WHERE employee_id = $1 AND fecha = $2`,
    [employeeId, fecha]
  )
  return row !== null
}

// Empleados que trabajan en una fecha determinada (sin excepción)
export async function getAvailableEmployeesForDate(fecha: Date): Promise<Employee[]> {
  const diaSemana = fecha.getDay() // 0=domingo
  const fechaStr = fecha.toISOString().split('T')[0]

  return query<Employee>(
    `SELECT DISTINCT u.id, u.nombre, u.apellido
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN employee_availability ea ON ea.employee_id = u.id
     WHERE r.name IN ('empleado', 'admin')
       AND u.activo = TRUE
       AND ea.dia_semana = $1
       AND NOT EXISTS (
         SELECT 1 FROM employee_exceptions ee
         WHERE ee.employee_id = u.id AND ee.fecha = $2
       )
     ORDER BY u.nombre`,
    [diaSemana, fechaStr]
  )
}
