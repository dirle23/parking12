<?php
// Configuración de cabecera
header('Content-Type: application/json');
include 'config.php';

try {
    // Obtener la acción desde la solicitud POST
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
            // Agregar una nueva tarifa
            $tipo_vehiculo = $_POST['tipo_vehiculo'];
            $tarifa_hora = $_POST['tarifa_hora'];
            $tiempo_gracia = $_POST['tiempo_gracia'];

            // Verificar si ya existen tarifas para los tipos de vehículos especificados
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM tarifas WHERE tipo_vehiculo IN ('motocicleta', 'automovil', 'camioneta')");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($result['count'] >= 3) {
                echo json_encode(['success' => false, 'message' => 'No se pueden crear más tarifas, porque ya están creadas para los tipos de vehículo: motocicleta, automovil, camioneta.']);
            } else {
                $stmt = $pdo->prepare("INSERT INTO tarifas (tipo_vehiculo, tarifa_hora, tiempo_gracia) VALUES (?, ?, ?)");
                $stmt->execute([$tipo_vehiculo, $tarifa_hora, $tiempo_gracia]);
                echo json_encode(['success' => true, 'message' => 'Tarifa creada con éxito.']);
            }
            break;

        case 'update':
            // Actualizar una tarifa existente
            $id_tarifa = $_POST['id_tarifa'];
            $tipo_vehiculo = $_POST['tipo_vehiculo'];
            $tarifa_hora = $_POST['tarifa_hora'];
            $tiempo_gracia = $_POST['tiempo_gracia'];

            $stmt = $pdo->prepare("UPDATE tarifas SET tipo_vehiculo = ?, tarifa_hora = ?, tiempo_gracia = ? WHERE id_tarifa = ?");
            $stmt->execute([$tipo_vehiculo, $tarifa_hora, $tiempo_gracia, $id_tarifa]);
            echo json_encode(['success' => true, 'message' => 'Tarifa actualizada con éxito.']);
            break;

        case 'delete':
            // Eliminar una tarifa existente
            $id_tarifa = $_POST['id_tarifa'];
            $stmt = $pdo->prepare("DELETE FROM tarifas WHERE id_tarifa = ?");
            $stmt->execute([$id_tarifa]);
            echo json_encode(['success' => true, 'message' => 'Tarifa eliminada con éxito.']);
            break;

        case 'fetch':
            // Obtener una tarifa específica o todas las tarifas
            if (isset($_POST['id_tarifa'])) {
                $id_tarifa = $_POST['id_tarifa'];
                $stmt = $pdo->prepare("SELECT * FROM tarifas WHERE id_tarifa = ?");
                $stmt->execute([$id_tarifa]);
                $tarifa = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($tarifa) {
                    echo json_encode($tarifa);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Tarifa no encontrada.']);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM tarifas");
                $tarifas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($tarifas);
            }
            break;

        case 'fetch_vehicle_types':
            // Obtener los tipos de vehículos desde la columna ENUM
            $stmt = $pdo->query("SHOW COLUMNS FROM vehiculos LIKE 'tipo'");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            preg_match("/^enum\(\'(.*)\'\)$/", $row['Type'], $matches);
            $types = explode("','", $matches[1]);
            echo json_encode($types);
            break;

        default:
            // Manejar acción no válida
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    // Manejar errores de conexión a la base de datos
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Manejar otros errores
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>