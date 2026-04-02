-- Vehículos adicionales en una reserva múltiple.
-- El vehicle_id principal queda en appointments.
-- Este tabla almacena los vehículos secundarios (hasta 2 adicionales).
CREATE TABLE appointment_vehicles (
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  vehicle_id     INTEGER NOT NULL REFERENCES vehicles(id),
  PRIMARY KEY (appointment_id, vehicle_id)
);

CREATE INDEX idx_appt_vehicles_vehicle_id ON appointment_vehicles(vehicle_id);
