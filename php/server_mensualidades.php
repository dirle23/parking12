<?php
// Configuración de cabecera
header('Content-Type: application/json');
include 'config.php';

try {
    // Obtener la acción desde la solicitud POST
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
            // Agregar una nueva mensualidad
            $id_vehiculo = $_POST['id_vehiculo'];
            $fecha_inicio = $_POST['fecha_inicio'];
            $fecha_fin = $_POST['fecha_fin'];
            $horario_entrada = $_POST['horario_entrada'];
            $horario_salida = $_POST['horario_salida'];

            $stmt = $pdo->prepare("INSERT INTO mensualidades (id_vehiculo, fecha_inicio, fecha_fin, horario_entrada, horario_salida) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id_vehiculo, $fecha_inicio, $fecha_fin, $horario_entrada, $horario_salida]);
            echo json_encode(['success' => true, 'message' => 'Mensualidad creada con éxito.']);
            break;

        case 'update':
            // Actualizar una mensualidad existente
            $id_mensualidad = $_POST['id_mensualidad'];
            $id_vehiculo = $_POST['id_vehiculo'];
            $fecha_inicio = $_POST['fecha_inicio'];
            $fecha_fin = $_POST['fecha_fin'];
            $horario_entrada = $_POST['horario_entrada'];
            $horario_salida = $_POST['horario_salida'];

            $stmt = $pdo->prepare("UPDATE mensualidades SET id_vehiculo = ?, fecha_inicio = ?, fecha_fin = ?, horario_entrada = ?, horario_salida = ? WHERE id_mensualidad = ?");
            $stmt->execute([$id_vehiculo, $fecha_inicio, $fecha_fin, $horario_entrada, $horario_salida, $id_mensualidad]);
            echo json_encode(['success' => true, 'message' => 'Mensualidad actualizada con éxito.']);
            break;

        case 'delete':
            // Eliminar una mensualidad existente
            $id_mensualidad = $_POST['id_mensualidad'];
            $stmt = $pdo->prepare("DELETE FROM mensualidades WHERE id_mensualidad = ?");
            $stmt->execute([$id_mensualidad]);
            echo json_encode(['success' => true, 'message' => 'Mensualidad eliminada con éxito.']);
            break;

        case 'fetch':
            // Obtener una mensualidad específica o todas las mensualidades
            if (isset($_POST['id_mensualidad'])) {
                $id_mensualidad = $_POST['id_mensualidad'];
                $stmt = $pdo->prepare("SELECT * FROM mensualidades WHERE id_mensualidad = ?");
                $stmt->execute([$id_mensualidad]);
                $mensualidad = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($mensualidad) {
                    echo json_encode($mensualidad);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Mensualidad no encontrada.']);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM mensualidades");
                $mensualidades = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($mensualidades);
            }
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