<?php
// Configuración de cabecera
header('Content-Type: application/json');
include 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
            $placa = $_POST['placa'];
            $tipo = $_POST['tipo'];
            $propietario = $_POST['propietario'];

            $stmt = $pdo->prepare("INSERT INTO vehiculos (placa, tipo, propietario) VALUES (?, ?, ?)");
            $stmt->execute([$placa, $tipo, $propietario]);
            echo json_encode(['success' => true, 'message' => 'Vehículo creado con éxito.']);
            break;

        case 'update':
            $id_vehiculo = $_POST['id_vehiculo'];
            $placa = $_POST['placa'];
            $tipo = $_POST['tipo'];
            $propietario = $_POST['propietario'];

            $stmt = $pdo->prepare("UPDATE vehiculos SET placa = ?, tipo = ?, propietario = ? WHERE id_vehiculo = ?");
            $stmt->execute([$placa, $tipo, $propietario, $id_vehiculo]);
            echo json_encode(['success' => true, 'message' => 'Vehículo actualizado con éxito.']);
            break;

        case 'delete':
            $id_vehiculo = $_POST['id_vehiculo'];
            $stmt = $pdo->prepare("DELETE FROM vehiculos WHERE id_vehiculo = ?");
            $stmt->execute([$id_vehiculo]);
            echo json_encode(['success' => true, 'message' => 'Vehículo eliminado con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id_vehiculo'])) {
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
                $stmt = $pdo->query("SELECT * FROM vehiculos");
                $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($vehiculos);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>