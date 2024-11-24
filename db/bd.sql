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
('P001', 'Zona A', 'disponible'),
('P002', 'Zona B', 'ocupado'),
('P003', 'Zona C', 'disponible');

-- Insertar datos ficticios en la tabla vehiculos
INSERT INTO vehiculos (placa, tipo, propietario) VALUES
('ABC123', 'automovil', 'Juan Perez'),
('XYZ789', 'motocicleta', 'Maria Lopez'),
('LMN456', 'camioneta', 'Carlos Garcia');

-- Insertar datos ficticios en la tabla tarifas
INSERT INTO tarifas (tipo_vehiculo, tarifa_hora, tiempo_gracia) VALUES
('automovil', 10.00, 15),
('motocicleta', 5.00, 15),
('camioneta', 15.00, 15);

-- Insertar datos ficticios en la tabla ingresos
INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, fecha_salida, tarifa_aplicada, multa) VALUES
(1, 2, '2023-10-01 08:00:00', '2023-10-01 10:00:00', 20.00, 0.00),
(2, 1, '2023-10-02 09:00:00', '2023-10-02 11:00:00', 10.00, 0.00),
(3, 3, '2023-10-03 07:00:00', '2023-10-03 09:00:00', 30.00, 0.00);

-- Insertar datos ficticios en la tabla mensualidades
INSERT INTO mensualidades (id_vehiculo, fecha_inicio, fecha_fin, horario_entrada, horario_salida) VALUES
(1, '2023-10-01', '2023-10-31', '08:00:00', '18:00:00'),
(2, '2023-10-01', '2023-10-31', '09:00:00', '19:00:00'),
(3, '2023-10-01', '2023-10-31', '07:00:00', '17:00:00');

-- Insertar datos ficticios en la tabla multas
INSERT INTO multas (id_ingreso, monto, fecha_generada, pagada) VALUES
(1, 50.00, '2023-10-01 10:30:00', FALSE),
(2, 30.00, '2023-10-02 11:30:00', TRUE),
(3, 40.00, '2023-10-03 09:30:00', FALSE);