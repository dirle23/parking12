<?php
// Configuración de cabecera
header('Content-Type: application/json');
include 'config.php';

try {
    // Conexión a la base de datos
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener la acción desde la solicitud POST
    $action = $_POST['action'] ?? '';

    // Manejar diferentes acciones
    switch ($action) {
        case 'add':
            // Agregar un nuevo vehículo
            $placa = $_POST['placa'];
            $tipo = $_POST['tipo'];
            $propietario = $_POST['propietario'];

            $stmt = $pdo->prepare("INSERT INTO vehiculos (placa, tipo, propietario) VALUES (?, ?, ?)");
            $stmt->execute([$placa, $tipo, $propietario]);
            echo json_encode(['success' => true, 'message' => 'Vehículo creado con éxito.']);
            break;

        case 'update':
            // Actualizar un vehículo existente
            $id_vehiculo = $_POST['id_vehiculo'];
            $placa = $_POST['placa'];
            $tipo = $_POST['tipo'];
            $propietario = $_POST['propietario'];

            $stmt = $pdo->prepare("UPDATE vehiculos SET placa = ?, tipo = ?, propietario = ? WHERE id_vehiculo = ?");
            $stmt->execute([$placa, $tipo, $propietario, $id_vehiculo]);
            echo json_encode(['success' => true, 'message' => 'Vehículo actualizado con éxito.']);
            break;

        case 'delete':
            // Eliminar un vehículo
            $id_vehiculo = $_POST['id_vehiculo'];
            $stmt = $pdo->prepare("DELETE FROM vehiculos WHERE id_vehiculo = ?");
            $stmt->execute([$id_vehiculo]);
            echo json_encode(['success' => true, 'message' => 'Vehículo eliminado con éxito.']);
            break;

        case 'fetch':
            // Obtener información de vehículos
            if (isset($_POST['id_vehiculo'])) {
                // Obtener un vehículo específico
                $id_vehiculo = $_POST['id_vehiculo'];
                $stmt = $pdo->prepare("SELECT * FROM vehiculos WHERE id_vehiculo = ?");
                $stmt->execute([$id_vehiculo]);
                $vehiculo = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($vehiculo) {
                    echo json_encode($vehiculo);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Vehículo no encontrado.']);
                }
            } else {
                // Obtener todos los vehículos
                $stmt = $pdo->query("SELECT * FROM vehiculos");
                $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($vehiculos);
            }
            break;

        case 'fetch_types':
            // Obtener los tipos de vehículos
            $stmt = $pdo->query("SHOW COLUMNS FROM vehiculos LIKE 'tipo'");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            preg_match("/^enum\(\'(.*)\'\)$/", $row['Type'], $matches);
            $types = explode("','", $matches[1]);
            echo json_encode($types);
            break;

        default:
            // Acción no válida
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    // Manejo de errores de conexión
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>