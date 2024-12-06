<?php
// Configuración de conexión a la base de datos
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'parqueadero';

// Crear conexión
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.']);
    exit;
}

// Determinar la acción solicitada
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'getVehiculo':
        getVehiculo($conn);
        break;

    case 'getMulta':
        getMulta($conn);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
        break;
}

$conn->close();

/**
 * Función para obtener la información del vehículo y su ingreso
 */
function getVehiculo($conn)
{
    $placa = $_POST['placa'] ?? '';

    if (empty($placa)) {
        echo json_encode(['success' => false, 'message' => 'Placa no proporcionada.']);
        return;
    }

    $sql = "SELECT 
                v.tipo,
                v.propietario,
                i.fecha_ingreso,
                i.id_puesto,
                i.id_ingreso,
                p.codigo AS codigo_puesto,
                p.ubicacion AS ubicacion_puesto,
                t.tarifa_hora AS tarifa
            FROM vehiculos v
            JOIN ingresos i ON v.id_vehiculo = i.id_vehiculo
            JOIN puestos p ON i.id_puesto = p.id_puesto
            JOIN tarifas t ON v.tipo = t.tipo_vehiculo
            WHERE v.placa = ? AND i.fecha_salida IS NULL";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $placa);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $vehiculo = $result->fetch_assoc();

        // Obtener multa asociada al ingreso
        $id_ingreso = $vehiculo['id_ingreso'];
        $sql_multa = "SELECT monto, pagada FROM multas WHERE id_ingreso = ?";
        $stmt_multa = $conn->prepare($sql_multa);
        $stmt_multa->bind_param('i', $id_ingreso);
        $stmt_multa->execute();
        $result_multa = $stmt_multa->get_result();

        if ($result_multa->num_rows > 0) {
            $multa = $result_multa->fetch_assoc();
            $vehiculo['multa'] = $multa['monto'];
            $vehiculo['multa_pagada'] = $multa['pagada'];
        } else {
            $vehiculo['multa'] = 0; // No hay multa registrada
            $vehiculo['multa_pagada'] = false;
        }

        echo json_encode(['success' => true, 'vehiculo' => $vehiculo]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Vehículo no encontrado o ya salió del parqueadero.']);
    }

    $stmt->close();
}

/**
 * Función para obtener la multa asociada a un ingreso
 */
function getMulta($conn)
{
    $idIngreso = $_POST['idIngreso'] ?? '';

    if (empty($idIngreso)) {
        echo json_encode(['success' => false, 'message' => 'ID de ingreso no proporcionado.']);
        return;
    }

    $sql = "SELECT monto, pagada FROM multas WHERE id_ingreso = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $idIngreso);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $multa = $result->fetch_assoc();
        echo json_encode(['success' => true, 'multa' => $multa['monto'], 'pagada' => $multa['pagada']]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontró multa asociada al ingreso.']);
    }

    $stmt->close();
}
?>
