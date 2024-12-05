<?php
if ($_POST['action'] == 'getVehiculo') {
    $placa = $_POST['placa'];

    // Conexión a la base de datos
    $conn = new mysqli('localhost', 'root', '', 'parqueadero');
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Error de conexión.']);
        exit;
    }

    // Consulta para obtener el vehículo y su información relacionada
    $sql = "SELECT 
                v.tipo,
                v.propietario,
                i.fecha_ingreso,
                i.id_puesto,
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
        echo json_encode(['success' => true, 'vehiculo' => $vehiculo]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Vehículo no encontrado o ya salió del parqueadero.']);
    }

    $stmt->close();
    $conn->close();
}
?>
