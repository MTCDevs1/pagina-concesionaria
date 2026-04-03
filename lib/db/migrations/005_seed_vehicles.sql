-- ============================================================
-- Seed 005: 20 vehículos con imágenes (exterior, interior, maletero)
-- URLs de Unsplash (dominio público)
-- ============================================================

-- Limpiar vehículos previos del seed (solo si se quiere resetear)
-- DELETE FROM vehicle_images WHERE vehicle_id IN (SELECT id FROM vehicles WHERE created_at < NOW());
-- DELETE FROM vehicles WHERE created_at < NOW();

INSERT INTO vehicles
  (marca, modelo, version, anio, precio, kilometraje, combustible, transmision, color, tipo, estado_comercial, publicado, destacado, orden_destacado, descripcion)
VALUES
-- 1
('Toyota','Corolla','XEI 2.0',2022,22000,18000,'Nafta','Automática','Blanco perla','Sedán','disponible',TRUE,TRUE,1,
 'Sedán confiable con excelente rendimiento urbano. Motor 2.0 de 152 cv, pantalla táctil de 8'', Apple CarPlay y Android Auto.'),
-- 2
('Toyota','Hilux','SRV 2.8 TDI 4x4',2023,48000,5000,'Diesel','Automática','Gris oscuro','Pickup','disponible',TRUE,TRUE,2,
 'La pickup más vendida. Motor diesel 2.8 con 204 cv, tracción 4x4, diferencial trasero bloqueado y 1 tonelada de carga útil.'),
-- 3
('Honda','Civic','EXL 2.0',2022,27500,12000,'Nafta','Automática','Azul metálico','Sedán','disponible',TRUE,TRUE,3,
 'Sedán deportivo con diseño premium. Techo solar panorámico, cuero en tapizado y sistema Honda Sensing de seguridad activa.'),
-- 4
('Honda','CR-V','Touring Hybrid e:HEV',2023,38000,3000,'Híbrido','Automática','Blanco','SUV','disponible',TRUE,TRUE,4,
 'SUV híbrido de última generación. Sistema e:HEV con 184 cv combinados, sin necesidad de enchufar. Amplio espacio interior y maletero de 561 L.'),
-- 5
('Volkswagen','Golf','GTI 2.0 TSI',2022,32000,15000,'Nafta','Automática','Rojo racing','Hatchback','disponible',TRUE,TRUE,5,
 'El referente del hot hatch. Motor 2.0 TSI de 245 cv, diferencial de deslizamiento limitado y suspensión deportiva de serie.'),
-- 6
('Volkswagen','Tiguan','Allspace R-Line 2.0 TSI',2022,41000,8000,'Nafta','Automática','Plata reflex','SUV','disponible',TRUE,TRUE,6,
 'SUV familiar con 7 asientos. Motor 2.0 TSI de 220 cv, tracción 4Motion, techo panorámico y pantalla de 10''.'),
-- 7
('Ford','Ranger','XLT 3.2 TDCi 4x4',2022,43000,22000,'Diesel','Manual','Negro','Pickup','disponible',TRUE,FALSE,NULL,
 'Pickup de trabajo y aventura. Motor 3.2 TDCi de 200 cv, caja de 6 velocidades y capacidad de remolque de 3.5 toneladas.'),
-- 8
('Ford','Bronco Sport','Big Bend 1.5 EcoBoost',2023,39000,6000,'Nafta','Automática','Verde antimatter','SUV','disponible',TRUE,FALSE,NULL,
 'SUV off-road con carácter. Motor EcoBoost de 181 cv, tracción AWD con control de terreno GOAT y ground clearance de 21.6 cm.'),
-- 9
('Chevrolet','Tracker','Premier 1.2T',2022,24000,19000,'Nafta','Automática','Rojo passion','SUV','disponible',TRUE,FALSE,NULL,
 'SUV compacta ideal para la ciudad. Motor 1.2 turbo de 133 cv, pantalla de 8'', cámara de retroceso y asistente de arranque en pendiente.'),
-- 10
('Chevrolet','S10','High Country 2.8 TDI 4x4',2022,46000,11000,'Diesel','Automática','Blanco summit','Pickup','disponible',TRUE,FALSE,NULL,
 'La versión tope de gama de la S10. Motor 2.8 TDI de 200 cv, cuero premium, pantalla de 8'', tracción 4x4 con modos on/off road.'),
-- 11
('Nissan','Frontier','PRO-4X 2.3 Biturbo 4x4',2023,44000,4000,'Diesel','Manual','Gris gun metal','Pickup','disponible',TRUE,FALSE,NULL,
 'Pickup mid-size con equipamiento off-road. Motor biturbo de 190 cv, bloqueo de diferencial trasero y diferencial frontal tipo Torsen.'),
-- 12
('Nissan','Kicks','Exclusive Hybrid',2022,28000,14000,'Híbrido','Automática','Naranja sunset','SUV','disponible',TRUE,FALSE,NULL,
 'SUV con tecnología e-Power. Tren motriz eléctrico alimentado por un generador de combustión, sin necesidad de enchufar.'),
-- 13
('Hyundai','Tucson','Plug-in Hybrid N Line',2023,45000,2000,'Híbrido','Automática','Azul neptune','SUV','disponible',TRUE,FALSE,NULL,
 'Hyundai PHEV con 261 cv combinados. Autonomía eléctrica de 62 km, diseño paramétrico y tecnología de primera clase.'),
-- 14
('Hyundai','Creta','Prestige 2.0',2022,26000,16000,'Nafta','Automática','Plateado fluid','SUV','disponible',TRUE,FALSE,NULL,
 'SUV compacta con excelente relación calidad-precio. Motor 2.0 de 167 cv, pantalla de 10'', Apple CarPlay inalámbrico y techo solar.'),
-- 15
('Peugeot','3008','GT Pack 1.6 THP',2022,34000,20000,'Nafta','Automática','Gris artense','SUV','disponible',TRUE,FALSE,NULL,
 'SUV francesa de diseño audaz. Cockpit digital i-Cockpit con volante compacto, pantalla de 12'', cuero Nappa y masaje en asientos delanteros.'),
-- 16
('Peugeot','208','GT Line 1.6 THP',2021,18500,28000,'Nafta','Automática','Blanco banquise','Hatchback','disponible',TRUE,FALSE,NULL,
 'Hatchback premium de segmento B. Motor 1.6 THP de 165 cv, i-Cockpit de 3D, pantalla capacitiva de 7'' y sensores de estacionamiento.'),
-- 17
('Renault','Duster','Iconic 1.3 TCe 4x2',2022,22000,25000,'Nafta','Manual','Naranja atacama','SUV','disponible',TRUE,FALSE,NULL,
 'El SUV accesible por excelencia. Motor 1.3 TCe de 130 cv, altísima ground clearance y capacidad de maletero de 445 L.'),
-- 18
('Renault','Kangoo','Stepway 1.6',2022,19000,32000,'Nafta','Manual','Gris highland','Minivan','disponible',TRUE,FALSE,NULL,
 'Minivan versátil para familia y trabajo. Motor 1.6 de 115 cv, Easy Life con puertas batientes traseras y espacio para 5 pasajeros.'),
-- 19
('Jeep','Renegade','Trailhawk 1.3 T270 4xe',2023,42000,7000,'Híbrido','Automática','Verde bikini','SUV','disponible',TRUE,FALSE,NULL,
 'Jeep PHEV con capacidad off-road real. Sistema 4xe con 240 cv, autonomía eléctrica de 40 km y ángulo de ataque de 29°.'),
-- 20
('BMW','320i','Sport Line G20',2021,51000,35000,'Nafta','Automática','Azul san marino','Sedán','disponible',TRUE,FALSE,NULL,
 'El sedán deportivo premium por definición. Motor 2.0 TwinPower Turbo de 184 cv, iDrive 7, Live Cockpit Professional y frenos M Sport.');

-- ─── IMÁGENES ────────────────────────────────────────────────
-- Formato: vehicle_id relativo al INSERT anterior. Se usan DO $$ BLOCK para obtener IDs.
DO $$
DECLARE
  ids INTEGER[];
  v   INTEGER;
BEGIN
  -- Obtener los últimos 20 vehículos insertados (por orden de creación desc)
  SELECT ARRAY(
    SELECT id FROM vehicles WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 20
  ) INTO ids;

  -- Invertir el array para que ids[1] = primero insertado
  ids := ARRAY(SELECT unnest(ids) ORDER BY 1 ASC);

  -- ─── Vehículo 1: Toyota Corolla ───
  v := ids[1];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 2: Toyota Hilux ───
  v := ids[2];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1566008885218-90abaa0b3e5f?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 3: Honda Civic ───
  v := ids[3];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 4: Honda CR-V ───
  v := ids[4];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1618843986574-42c96b5b49c5?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 5: VW Golf GTI ───
  v := ids[5];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 6: VW Tiguan ───
  v := ids[6];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 7: Ford Ranger ───
  v := ids[7];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 8: Ford Bronco Sport ───
  v := ids[8];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1618843986574-42c96b5b49c5?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 9: Chevrolet Tracker ───
  v := ids[9];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 10: Chevrolet S10 ───
  v := ids[10];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1566008885218-90abaa0b3e5f?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 11: Nissan Frontier ───
  v := ids[11];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 12: Nissan Kicks ───
  v := ids[12];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 13: Hyundai Tucson ───
  v := ids[13];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1618843986574-42c96b5b49c5?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 14: Hyundai Creta ───
  v := ids[14];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 15: Peugeot 3008 ───
  v := ids[15];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 16: Peugeot 208 ───
  v := ids[16];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 17: Renault Duster ───
  v := ids[17];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 18: Renault Kangoo ───
  v := ids[18];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1549317661-cf369e14e5c9?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 3);

  -- ─── Vehículo 19: Jeep Renegade ───
  v := ids[19];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1618843986574-42c96b5b49c5?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1600706432502-a57a58b29c2b?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1487252665478-49b61b47f302?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

  -- ─── Vehículo 20: BMW 320i ───
  v := ids[20];
  INSERT INTO vehicle_images (vehicle_id, url, es_portada, orden) VALUES
    (v, 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80', TRUE,  0),
    (v, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', FALSE, 1),
    (v, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80', FALSE, 2),
    (v, 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=1200&q=80', FALSE, 3),
    (v, 'https://images.unsplash.com/photo-1547047493-0c9f2d87e07f?auto=format&fit=crop&w=1200&q=80', FALSE, 4);

END $$;

-- Borrar los 8 vehículos viejos del seed anterior (sin imágenes de calidad)
-- Se puede correr manualmente si se quiere limpiar los vehículos anteriores:
-- DELETE FROM vehicles WHERE id NOT IN (SELECT vehicle_id FROM vehicle_images) AND created_at < NOW() - INTERVAL '1 minute';
