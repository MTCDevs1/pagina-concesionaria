-- ============================================================
-- Seed: usuario admin por defecto
-- Password: Admin1234! (bcrypt hash – reemplazar en producción)
-- ============================================================

INSERT INTO users (email, password_hash, nombre, apellido, role_id)
VALUES (
  'admin@driveone.com',
  '$2b$12$PLACEHOLDER_HASH_CHANGE_ME',
  'Admin',
  'DriveOne',
  3
);
