-- Eliminar la base de datos si ya existe
DROP DATABASE IF EXISTS parqueadero;

-- Crear la base de datos
CREATE DATABASE parqueadero;
USE parqueadero;

-- Crear la tabla puestos
CREATE TABLE puestos (
    id_puesto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    ubicacion VARCHAR(255) NOT NULL,
    estado ENUM('disponible', 'ocupado') DEFAULT 'disponible'
);

-- Crear la tabla vehiculos
CREATE TABLE vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    tipo ENUM('motocicleta', 'automovil', 'camioneta') NOT NULL,
    propietario VARCHAR(255) NOT NULL
);

-- Crear la tabla tarifas
CREATE TABLE tarifas (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    tipo_vehiculo ENUM('motocicleta', 'automovil', 'camioneta') NOT NULL UNIQUE,
    tarifa_hora DECIMAL(10, 2) NOT NULL,
    tiempo_gracia INT DEFAULT 15
);

-- Crear la tabla ingresos
CREATE TABLE ingresos (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT NOT NULL,
    id_puesto INT NOT NULL,
    fecha_ingreso DATETIME NOT NULL,
    fecha_salida DATETIME,
    tarifa_aplicada DECIMAL(10, 2),
    multa DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo),
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto)
);

-- Crear la tabla mensualidades
CREATE TABLE mensualidades (
    id_mensualidad INT AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horario_entrada TIME NOT NULL,
    horario_salida TIME NOT NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
);

-- Crear la tabla multas
CREATE TABLE multas (
    id_multa INT AUTO_INCREMENT PRIMARY KEY,
    id_ingreso INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_generada DATETIME NOT NULL,
    pagada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_ingreso) REFERENCES ingresos(id_ingreso)
);

-- Insertar datos ficticios en la tabla puestos
INSERT INTO puestos (codigo, ubicacion, estado) VALUES
-- Zona A
('P001', 'Zona A', 'disponible'),
('P002', 'Zona A', 'ocupado'),
('P003', 'Zona A', 'disponible'),
('P004', 'Zona A', 'ocupado'),
('P005', 'Zona A', 'disponible'),
('P006', 'Zona A', 'ocupado'),
('P007', 'Zona A', 'disponible'),
('P008', 'Zona A', 'ocupado'),
('P009', 'Zona A', 'disponible'),
('P010', 'Zona A', 'ocupado'),
('P011', 'Zona A', 'disponible'),
('P012', 'Zona A', 'ocupado'),
('P013', 'Zona A', 'disponible'),
('P014', 'Zona A', 'ocupado'),
('P015', 'Zona A', 'disponible'),
('P016', 'Zona A', 'ocupado'),
('P017', 'Zona A', 'disponible'),
('P018', 'Zona A', 'ocupado'),
('P019', 'Zona A', 'disponible'),
('P020', 'Zona A', 'ocupado'),
('P021', 'Zona A', 'disponible'),
('P022', 'Zona A', 'ocupado'),
('P023', 'Zona A', 'disponible'),
('P024', 'Zona A', 'ocupado'),
('P025', 'Zona A', 'disponible'),
('P026', 'Zona A', 'ocupado'),
('P027', 'Zona A', 'disponible'),
('P028', 'Zona A', 'ocupado'),
('P029', 'Zona A', 'disponible'),
('P030', 'Zona A', 'ocupado'),
('P031', 'Zona A', 'disponible'),
('P032', 'Zona A', 'ocupado'),
('P033', 'Zona A', 'disponible'),
('P034', 'Zona A', 'ocupado'),
('P035', 'Zona A', 'disponible'),
('P036', 'Zona A', 'ocupado'),
('P037', 'Zona A', 'disponible'),
('P038', 'Zona A', 'ocupado'),
('P039', 'Zona A', 'disponible'),
('P040', 'Zona A', 'ocupado'),

-- Zona B
('P041', 'Zona B', 'disponible'),
('P042', 'Zona B', 'ocupado'),
('P043', 'Zona B', 'disponible'),
('P044', 'Zona B', 'ocupado'),
('P045', 'Zona B', 'disponible'),
('P046', 'Zona B', 'ocupado'),
('P047', 'Zona B', 'disponible'),
('P048', 'Zona B', 'ocupado'),
('P049', 'Zona B', 'disponible'),
('P050', 'Zona B', 'ocupado'),
('P051', 'Zona B', 'disponible'),
('P052', 'Zona B', 'ocupado'),
('P053', 'Zona B', 'disponible'),
('P054', 'Zona B', 'ocupado'),
('P055', 'Zona B', 'disponible'),
('P056', 'Zona B', 'ocupado'),
('P057', 'Zona B', 'disponible'),
('P058', 'Zona B', 'ocupado'),
('P059', 'Zona B', 'disponible'),
('P060', 'Zona B', 'ocupado'),
('P061', 'Zona B', 'disponible'),
('P062', 'Zona B', 'ocupado'),
('P063', 'Zona B', 'disponible'),
('P064', 'Zona B', 'ocupado'),
('P065', 'Zona B', 'disponible'),
('P066', 'Zona B', 'ocupado'),
('P067', 'Zona B', 'disponible'),
('P068', 'Zona B', 'ocupado'),
('P069', 'Zona B', 'disponible'),
('P070', 'Zona B', 'ocupado'),
('P071', 'Zona B', 'disponible'),
('P072', 'Zona B', 'ocupado'),
('P073', 'Zona B', 'disponible'),
('P074', 'Zona B', 'ocupado'),
('P075', 'Zona B', 'disponible'),
('P076', 'Zona B', 'ocupado'),
('P077', 'Zona B', 'disponible'),
('P078', 'Zona B', 'ocupado'),
('P079', 'Zona B', 'disponible'),
('P080', 'Zona B', 'ocupado'),

-- Zona C
('P081', 'Zona C', 'disponible'),
('P082', 'Zona C', 'ocupado'),
('P083', 'Zona C', 'disponible'),
('P084', 'Zona C', 'ocupado'),
('P085', 'Zona C', 'disponible'),
('P086', 'Zona C', 'ocupado'),
('P087', 'Zona C', 'disponible'),
('P088', 'Zona C', 'ocupado'),
('P089', 'Zona C', 'disponible'),
('P090', 'Zona C', 'ocupado'),
('P091', 'Zona C', 'disponible'),
('P092', 'Zona C', 'ocupado'),
('P093', 'Zona C', 'disponible'),
('P094', 'Zona C', 'ocupado'),
('P095', 'Zona C', 'disponible'),
('P096', 'Zona C', 'ocupado'),
('P097', 'Zona C', 'disponible'),
('P098', 'Zona C', 'ocupado'),
('P099', 'Zona C', 'disponible'),
('P100', 'Zona C', 'ocupado'),
('P101', 'Zona C', 'disponible'),
('P102', 'Zona C', 'ocupado'),
('P103', 'Zona C', 'disponible'),
('P104', 'Zona C', 'ocupado'),
('P105', 'Zona C', 'disponible'),
('P106', 'Zona C', 'ocupado'),
('P107', 'Zona C', 'disponible'),
('P108', 'Zona C', 'ocupado'),
('P109', 'Zona C', 'disponible'),
('P110', 'Zona C', 'ocupado'),
('P111', 'Zona C', 'disponible'),
('P112', 'Zona C', 'ocupado'),
('P113', 'Zona C', 'disponible'),
('P114', 'Zona C', 'ocupado'),
('P115', 'Zona C', 'disponible'),
('P116', 'Zona C', 'ocupado'),
('P117', 'Zona C', 'disponible'),
('P118', 'Zona C', 'ocupado'),
('P119', 'Zona C', 'disponible'),
('P120', 'Zona C', 'ocupado');

-- Insertar datos ficticios en la tabla vehiculos
INSERT INTO vehiculos (placa, tipo, propietario) VALUES
('ABC123', 'automovil', 'Juan Perez'),
('XYZ789', 'motocicleta', 'Maria Lopez'),
('LMN456', 'camioneta', 'Carlos Garcia');

-- Insertar datos ficticios en la tabla tarifas
INSERT INTO tarifas (tipo_vehiculo, tarifa_hora, tiempo_gracia) VALUES
('automovil', 2500, 10),
('motocicleta', 1000, 10),
('camioneta', 3000, 10);

-- Insertar datos ficticios en la tabla ingresos
INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, fecha_salida, tarifa_aplicada, multa) VALUES
(1, 2, '2023-10-01 08:00:00', '2023-10-01 10:00:00', 2500, 0.00),
(2, 1, '2023-10-02 09:00:00', '2023-10-02 11:00:00', 1000, 0.00),
(3, 3, '2023-10-03 07:00:00', '2023-10-03 09:00:00', 3000, 0.00);

-- Insertar datos ficticios en la tabla mensualidades
INSERT INTO mensualidades (id_vehiculo, fecha_inicio, fecha_fin, horario_entrada, horario_salida) VALUES
(1, '2023-10-01', '2023-10-31', '08:00:00', '18:00:00'),
(2, '2023-10-01', '2023-10-31', '09:00:00', '19:00:00'),
(3, '2023-10-01', '2023-10-31', '07:00:00', '17:00:00');

-- Insertar datos ficticios en la tabla multas
INSERT INTO multas (id_ingreso, monto, fecha_generada, pagada) VALUES
(1, 10000, '2023-10-01 10:30:00', FALSE),
(2, 10000, '2023-10-02 11:30:00', TRUE),
(3, 10000, '2023-10-03 09:30:00', FALSE);