-- Eliminar la base de datos si existe
DROP DATABASE IF EXISTS parqueadero;

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS parqueadero;
USE parqueadero;

CREATE TABLE puestos (
    id_puesto INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    ubicacion VARCHAR(255) NOT NULL,
    estado ENUM('disponible', 'ocupado') DEFAULT 'disponible'
);

CREATE TABLE vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    tipo ENUM('motocicleta', 'automovil', 'camioneta') NOT NULL,
    propietario VARCHAR(255) NOT NULL
);

CREATE TABLE tarifas (
    id_tarifa INT AUTO_INCREMENT PRIMARY KEY,
    tipo_vehiculo ENUM('motocicleta', 'automovil', 'camioneta') NOT NULL UNIQUE,
    tarifa_hora DECIMAL(10, 2) NOT NULL,
    tiempo_gracia INT DEFAULT 15
);

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

CREATE TABLE mensualidades (
    id_mensualidad INT AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    horario_entrada TIME NOT NULL,
    horario_salida TIME NOT NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
);

CREATE TABLE multas (
    id_multa INT AUTO_INCREMENT PRIMARY KEY,
    id_ingreso INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_generada DATETIME NOT NULL,
    pagada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_ingreso) REFERENCES ingresos(id_ingreso)
);


INSERT INTO puestos (codigo, ubicacion, estado) VALUES
('P01', 'Zona A1', 'disponible'),
('P02', 'Zona A2', 'ocupado'),
('P03', 'Zona B1', 'disponible'),
('P04', 'Zona B2', 'disponible');

INSERT INTO vehiculos (placa, tipo, propietario) VALUES
('AAA123', 'automovil', 'Carlos Pérez'),
('BBB456', 'motocicleta', 'Laura Gómez'),
('CCC789', 'camioneta', 'Juan Rodríguez'),
('DDD321', 'automovil', 'María López');

INSERT INTO tarifas (tipo_vehiculo, tarifa_hora, tiempo_gracia) VALUES
('motocicleta', 5.00, 15),
('automovil', 10.00, 15),
('camioneta', 15.00, 15);

INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, fecha_salida, tarifa_aplicada, multa) VALUES
(1, 2, '2024-11-22 08:00:00', '2024-11-22 12:00:00', 40.00, 0.00),
(2, 1, '2024-11-23 09:30:00', NULL, NULL, 0.00);

INSERT INTO mensualidades (id_vehiculo, fecha_inicio, fecha_fin, horario_entrada, horario_salida) VALUES
(3, '2024-11-01', '2024-11-30', '08:00:00', '20:00:00'),
(4, '2024-11-15', '2024-12-15', '07:00:00', '19:00:00');

INSERT INTO multas (id_ingreso, monto, fecha_generada, pagada) VALUES
(1, 10.00, '2024-11-22 12:10:00', TRUE),
(2, 20.00, '2024-11-23 12:00:00', FALSE);
