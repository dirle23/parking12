<?php
// Configuración de cabecera
header('Content-Type: application/json');
include 'config.php';

try {
    // Conexión a la base de datos
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Validación de la acción
    $action = $_POST['action'] ?? '';
    if (!$action) {
        echo json_encode(['success' => false, 'message' => 'Acción no proporcionada.']);
        exit;
    }

    // Switch para manejar las acciones
    switch ($action) {
        case 'add':
            // Validación de campos requeridos
            $requiredFields = ['id_vehiculo', 'id_puesto', 'fecha_ingreso', 'tarifa_aplicada'];
            foreach ($requiredFields as $field) {
                if (empty($_POST[$field])) {
                    echo json_encode(['success' => false, 'message' => "El campo $field es obligatorio."]);
                    exit;
                }
            }

            // Asignación de variables
            $id_vehiculo = $_POST['id_vehiculo'];
            $id_puesto = $_POST['id_puesto'];
            $fecha_ingreso = $_POST['fecha_ingreso'];
            $fecha_salida = $_POST['fecha_salida'] ?? null;
            $tarifa_aplicada = $_POST['tarifa_aplicada'];
            $multa = $_POST['multa'] ?? 0;

            // Consulta preparada
            $stmt = $pdo->prepare("INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, fecha_salida, tarifa_aplicada, multa) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $fecha_salida, $tarifa_aplicada, $multa]);
            echo json_encode(['success' => true, 'message' => 'Ingreso creado con éxito.']);
            break;

        case 'update':
            // Validación de campos requeridos
            $requiredFields = ['id_ingreso', 'id_vehiculo', 'id_puesto', 'fecha_ingreso', 'tarifa_aplicada'];
            foreach ($requiredFields as $field) {
                if (empty($_POST[$field])) {
                    echo json_encode(['success' => false, 'message' => "El campo $field es obligatorio."]);
                    exit;
                }
            }

            // Asignación de variables
            $id_ingreso = $_POST['id_ingreso'];
            $id_vehiculo = $_POST['id_vehiculo'];
            $id_puesto = $_POST['id_puesto'];
            $fecha_ingreso = $_POST['fecha_ingreso'];
            $fecha_salida = $_POST['fecha_salida'] ?? null;
            $tarifa_aplicada = $_POST['tarifa_aplicada'];
            $multa = $_POST['multa'] ?? 0;

            // Actualización
            $stmt = $pdo->prepare("UPDATE ingresos 
                                   SET id_vehiculo = ?, id_puesto = ?, fecha_ingreso = ?, fecha_salida = ?, tarifa_aplicada = ?, multa = ? 
                                   WHERE id_ingreso = ?");
            $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $fecha_salida, $tarifa_aplicada, $multa, $id_ingreso]);
            echo json_encode(['success' => true, 'message' => 'Ingreso actualizado con éxito.']);
            break;

        case 'delete':
            // Validación de campo requerido
            $id_ingreso = $_POST['id_ingreso'] ?? null;
            if (!$id_ingreso) {
                echo json_encode(['success' => false, 'message' => 'ID de ingreso es obligatorio.']);
                exit;
            }

            // Eliminación
            $stmt = $pdo->prepare("DELETE FROM ingresos WHERE id_ingreso = ?");
            $stmt->execute([$id_ingreso]);
            echo json_encode(['success' => true, 'message' => 'Ingreso eliminado con éxito.']);
            break;

        case 'fetch':
            // Obtención de datos
            if (isset($_POST['id_ingreso'])) {
                $id_ingreso = $_POST['id_ingreso'];
                $stmt = $pdo->prepare("SELECT i.*, v.placa AS vehiculo, v.tipo AS tipo_vehiculo, p.codigo AS puesto, p.ubicacion AS ubicacion_puesto 
                                       FROM ingresos i
                                       JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
                                       JOIN puestos p ON i.id_puesto = p.id_puesto
                                       WHERE i.id_ingreso = ?");
                $stmt->execute([$id_ingreso]);
                $ingreso = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($ingreso ?: ['success' => false, 'message' => 'Ingreso no encontrado.']);
            } else {
                $stmt = $pdo->query("SELECT i.*, v.placa AS vehiculo, v.tipo AS tipo_vehiculo, p.codigo AS puesto, p.ubicacion AS ubicacion_puesto 
                                     FROM ingresos i
                                     JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
                                     JOIN puestos p ON i.id_puesto = p.id_puesto");
                $ingresos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($ingresos);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    // Manejo de errores de conexión
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>
