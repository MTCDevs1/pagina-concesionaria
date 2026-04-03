-- ============================================================
-- Migration 004: tipo, estado_comercial, publicado en vehicles
-- ============================================================

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS tipo            VARCHAR(50),
  ADD COLUMN IF NOT EXISTS estado_comercial VARCHAR(20) NOT NULL DEFAULT 'disponible',
  ADD COLUMN IF NOT EXISTS publicado        BOOLEAN     NOT NULL DEFAULT TRUE;

ALTER TABLE vehicles
  DROP CONSTRAINT IF EXISTS chk_estado_comercial;

ALTER TABLE vehicles
  ADD CONSTRAINT chk_estado_comercial
  CHECK (estado_comercial IN ('disponible', 'reservado', 'vendido'));

CREATE INDEX IF NOT EXISTS idx_vehicles_publicado ON vehicles(publicado) WHERE publicado = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_tipo      ON vehicles(tipo);
