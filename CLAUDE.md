# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: DriveOne Motors

Plataforma de concesionaria real (no landing). Foco en sistema de reservas sólido, gestión de vehículos y experiencia profesional.

## Stack

- **Frontend/Backend:** Next.js 16 (App Router) + Tailwind CSS v4
- **DB:** PostgreSQL
- **Imágenes:** Vercel Blob
- **Hosting:** Vercel
- **Auth:** Email + contraseña (sin recuperación de contraseña)

## Commands

```bash
npm run dev       # desarrollo local
npm run build     # build producción
npm run lint      # linting
```

## Architecture

```
app/
  (public)/          # rutas sin auth: home, catálogo, detalle vehículo, reserva visitante
  (auth)/            # login, registro
  (cliente)/         # perfil, mis reservas, reserva múltiple
  (empleado)/        # calendario, gestión vehículos, disponibilidad
  (admin)/           # usuarios, métricas, auditoría, reasignación
  api/               # API routes
lib/
  db/                # cliente PostgreSQL, queries
  auth/              # lógica de sesión/roles
  scheduling/        # lógica de turnos, validaciones de solapamiento
components/
  ui/                # componentes base (botones, modales, cards)
  vehicles/          # catálogo, cards, galería, filtros
  booking/           # flujo de reserva, selector fecha/hora/empleado
  admin/             # tablas, dashboard, panel empleado
```

## Roles

| Rol | Acceso |
|-----|--------|
| Visitante | Catálogo, detalle, reservar sin login |
| Cliente | + Ver/cancelar reservas, reserva múltiple (hasta 3 vehículos) |
| Empleado | + Gestionar vehículos, calendario, marcar estados, disponibilidad |
| Admin | + Usuarios, métricas, auditoría, reasignación de reservas |

## Reglas críticas de negocio (NO negociables)

- **Sin duplicados:** mismo vehículo+horario o mismo empleado+horario → bloquear
- **Max 2 reservas activas** por cliente
- **Max 3 vehículos** en reserva múltiple (solo desde perfil del cliente)
- **Ventana de agenda:** hasta 14 días adelante, hasta 30 min antes del turno
- **Cancelación:** permitida hasta 30 min antes → libera el horario automáticamente
- **Duración visible:** 45 min | **Bloqueo real:** 1 hora por turno
- **Eliminación de vehículo:** bloqueada si tiene reservas futuras
- **Empleado marca día no disponible:** cancela reservas afectadas automáticamente + muestra popup con clientes afectados (permite email manual, NO automático)
- **Zona horaria:** Uruguay (America/Montevideo)
- **Emails:** NO automáticos. Solo envío manual desde el popup de cancelación por indisponibilidad

## Generación de turnos

Ejemplo con empleado 09:00–14:00:
- Turnos disponibles: 09:30 / 10:30 / 11:30 / 12:30 / 13:30

## DB (tablas mínimas)

`users` · `roles` · `vehicles` · `vehicle_images` · `appointments` · `employee_availability` · `employee_exceptions` · `audit_logs`

## Lo que NO hacer

- No hardcodear datos
- No omitir validaciones de horario
- No permitir solapamientos
- No permitir reservas fuera de horario laboral
- No simplificar lógica de agenda
- No enviar emails automáticos
