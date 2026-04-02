-- ============================================================
-- DriveOne Motors – Schema inicial
-- Zona horaria: America/Montevideo
-- ============================================================

-- Extensión para UUIDs (opcional, usamos serial por simplicidad)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
  id   SMALLINT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO roles (id, name) VALUES
  (1, 'cliente'),
  (2, 'empleado'),
  (3, 'admin');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  telefono      VARCHAR(30),
  role_id       SMALLINT     NOT NULL REFERENCES roles(id),
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id              SERIAL PRIMARY KEY,
  marca           VARCHAR(100) NOT NULL,
  modelo          VARCHAR(100) NOT NULL,
  version         VARCHAR(150),
  anio            SMALLINT    NOT NULL,
  precio          NUMERIC(12,2) NOT NULL,
  kilometraje     INTEGER      NOT NULL DEFAULT 0,
  combustible     VARCHAR(50)  NOT NULL,  -- nafta, diesel, electrico, hibrido
  transmision     VARCHAR(50)  NOT NULL,  -- manual, automatica
  color           VARCHAR(80)  NOT NULL,
  descripcion     TEXT,
  destacado       BOOLEAN      NOT NULL DEFAULT FALSE,
  orden_destacado SMALLINT,
  -- Soft delete: bloqueado si tiene reservas futuras
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_deleted_at ON vehicles(deleted_at);
CREATE INDEX idx_vehicles_destacado  ON vehicles(destacado) WHERE destacado = TRUE;

-- ============================================================
-- VEHICLE IMAGES
-- ============================================================
CREATE TABLE vehicle_images (
  id         SERIAL PRIMARY KEY,
  vehicle_id INTEGER      NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url        TEXT         NOT NULL,
  es_portada BOOLEAN      NOT NULL DEFAULT FALSE,
  orden      SMALLINT     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);

-- Solo una portada por vehículo
CREATE UNIQUE INDEX idx_vehicle_images_portada
  ON vehicle_images(vehicle_id)
  WHERE es_portada = TRUE;

-- ============================================================
-- EMPLOYEE AVAILABILITY (horario semanal regular)
-- ============================================================
CREATE TABLE employee_availability (
  id           SERIAL PRIMARY KEY,
  employee_id  INTEGER    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- 0=domingo, 1=lunes, ..., 6=sabado
  dia_semana   SMALLINT   NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio  TIME       NOT NULL,
  hora_fin     TIME       NOT NULL,
  pausa_inicio TIME,
  pausa_fin    TIME,
  CONSTRAINT chk_horario CHECK (hora_inicio < hora_fin),
  CONSTRAINT chk_pausa   CHECK (
    (pausa_inicio IS NULL AND pausa_fin IS NULL)
    OR (pausa_inicio IS NOT NULL AND pausa_fin IS NOT NULL AND pausa_inicio < pausa_fin)
  ),
  UNIQUE (employee_id, dia_semana)
);

-- ============================================================
-- EMPLOYEE EXCEPTIONS (días no disponibles)
-- ============================================================
CREATE TABLE employee_exceptions (
  id          SERIAL PRIMARY KEY,
  employee_id INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha       DATE        NOT NULL,
  motivo      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, fecha)
);

-- ============================================================
-- APPOINTMENTS (reservas)
-- ============================================================
CREATE TYPE appointment_estado AS ENUM (
  'confirmada',
  'realizada',
  'cancelada',
  'no_asistio'
);

CREATE TABLE appointments (
  id           SERIAL PRIMARY KEY,
  vehicle_id   INTEGER              NOT NULL REFERENCES vehicles(id),
  employee_id  INTEGER              NOT NULL REFERENCES users(id),
  -- NULL si el cliente no está registrado
  client_id    INTEGER              REFERENCES users(id),

  -- Datos del visitante (usado cuando client_id IS NULL)
  guest_nombre   VARCHAR(100),
  guest_apellido VARCHAR(100),
  guest_telefono VARCHAR(30),
  guest_email    VARCHAR(255),
  guest_mensaje  TEXT,

  -- Turno en zona horaria Uruguay
  fecha_hora   TIMESTAMPTZ          NOT NULL,

  estado       appointment_estado   NOT NULL DEFAULT 'confirmada',
  notas        TEXT,                        -- notas internas del empleado
  cancelled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

  -- O tiene cliente registrado o tiene datos de visitante
  CONSTRAINT chk_client_or_guest CHECK (
    (client_id IS NOT NULL)
    OR (
      guest_nombre   IS NOT NULL AND
      guest_apellido IS NOT NULL AND
      guest_telefono IS NOT NULL AND
      guest_email    IS NOT NULL
    )
  )
);

-- Sin solapamiento: mismo vehículo + mismo horario (solo reservas activas)
CREATE UNIQUE INDEX idx_appointments_vehicle_slot
  ON appointments(vehicle_id, fecha_hora)
  WHERE estado NOT IN ('cancelada');

-- Sin solapamiento: mismo empleado + mismo horario (solo reservas activas)
CREATE UNIQUE INDEX idx_appointments_employee_slot
  ON appointments(employee_id, fecha_hora)
  WHERE estado NOT IN ('cancelada');

CREATE INDEX idx_appointments_client_id    ON appointments(client_id);
CREATE INDEX idx_appointments_employee_id  ON appointments(employee_id);
CREATE INDEX idx_appointments_fecha_hora   ON appointments(fecha_hora);
CREATE INDEX idx_appointments_estado       ON appointments(estado);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER,     -- NULL si acción anónima
  action      VARCHAR(50)  NOT NULL,  -- CREATE, UPDATE, DELETE, LOGIN, etc.
  entity_type VARCHAR(50)  NOT NULL,  -- users, vehicles, appointments, etc.
  entity_id   INTEGER,
  old_data    JSONB,
  new_data    JSONB,
  ip          VARCHAR(45),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id     ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at  ON audit_logs(created_at DESC);

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
