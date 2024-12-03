<?php
header('Content-Type: application/json');
include 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? ($_GET['action'] ?? '');

    switch ($action) {
        case 'add':
            $id_vehiculo = $_POST['id_vehiculo'];
            $id_puesto = $_POST['id_puesto'];
            $fecha_ingreso = $_POST['fecha_ingreso'];
            $fecha_salida = $_POST['fecha_salida'] ?? null;
            $tarifa_aplicada = $_POST['tarifa_aplicada'] ?? null;
            $multa = $_POST['multa'] ?? 0;

            // Verificar si el vehículo ya tiene un ingreso activo
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM ingresos WHERE id_vehiculo = ? AND fecha_salida IS NULL");
            $stmt->execute([$id_vehiculo]);
            $vehiculoActivo = $stmt->fetchColumn();

            if ($vehiculoActivo > 0) {
                echo json_encode(['success' => false, 'message' => 'El vehículo ya tiene un ingreso activo.']);
                break;
            }

            $stmt = $pdo->prepare("INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, fecha_salida, tarifa_aplicada, multa) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $fecha_salida, $tarifa_aplicada, $multa]);

            // Actualizar el estado del puesto a 'ocupado'
            $stmt = $pdo->prepare("UPDATE puestos SET estado = 'ocupado' WHERE id_puesto = ?");
            $stmt->execute([$id_puesto]);

            echo json_encode(['success' => true, 'message' => 'Ingreso creado con éxito.']);
            break;

        case 'update':
            $id_ingreso = $_POST['id_ingreso'];
            $id_vehiculo = $_POST['id_vehiculo'];
            $id_puesto = $_POST['id_puesto'];
            $fecha_ingreso = $_POST['fecha_ingreso'];
            $fecha_salida = $_POST['fecha_salida'] ?? null;
            $tarifa_aplicada = $_POST['tarifa_aplicada'] ?? null;
            $multa = $_POST['multa'] ?? 0;

            $stmt = $pdo->prepare("UPDATE ingresos 
                                   SET id_vehiculo = ?, id_puesto = ?, fecha_ingreso = ?, fecha_salida = ?, tarifa_aplicada = ?, multa = ? 
                                   WHERE id_ingreso = ?");
            $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $fecha_salida, $tarifa_aplicada, $multa, $id_ingreso]);

            // Actualizar el estado del puesto a 'ocupado'
            $stmt = $pdo->prepare("UPDATE puestos SET estado = 'ocupado' WHERE id_puesto = ?");
            $stmt->execute([$id_puesto]);

            echo json_encode(['success' => true, 'message' => 'Ingreso actualizado con éxito.']);
            break;

        case 'delete':
            $id_ingreso = $_POST['id_ingreso'];

            // Obtener el id_puesto antes de eliminar el ingreso
            $stmt = $pdo->prepare("SELECT id_puesto FROM ingresos WHERE id_ingreso = ?");
            $stmt->execute([$id_ingreso]);
            $id_puesto = $stmt->fetchColumn();

            $stmt = $pdo->prepare("DELETE FROM ingresos WHERE id_ingreso = ?");
            $stmt->execute([$id_ingreso]);

            // Actualizar el estado del puesto a 'disponible'
            $stmt = $pdo->prepare("UPDATE puestos SET estado = 'disponible' WHERE id_puesto = ?");
            $stmt->execute([$id_puesto]);

            echo json_encode(['success' => true, 'message' => 'Ingreso eliminado con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id_ingreso'])) {
                $id_ingreso = $_POST['id_ingreso'];
                $stmt = $pdo->prepare("SELECT * FROM ingresos WHERE id_ingreso = ?");
                $stmt->execute([$id_ingreso]);
                $ingreso = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($ingreso) {
                    echo json_encode($ingreso);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Ingreso no encontrado.']);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM ingresos");
                $ingresos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($ingresos);
            }
            break;

        case 'getVehiculos':
            $stmt = $pdo->query("SELECT id_vehiculo, placa, tipo FROM vehiculos");
            $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($vehiculos);
            break;

        case 'getPuestos':
            $stmt = $pdo->query("SELECT id_puesto, codigo, estado FROM puestos WHERE estado = 'disponible'");
            $puestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($puestos);
            break;

        case 'getTarifa':
            $id_vehiculo = $_POST['id_vehiculo'];
            $stmt = $pdo->prepare("SELECT t.tarifa_hora 
                                   FROM vehiculos v 
                                   JOIN tarifas t ON v.tipo = t.tipo_vehiculo 
                                   WHERE v.id_vehiculo = ?");
            $stmt->execute([$id_vehiculo]);
            $tarifa = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($tarifa) {
                echo json_encode(['success' => true, 'tarifa_hora' => $tarifa['tarifa_hora']]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Tarifa no encontrada.']);
            }
            break;

        case 'getIngresoByPlaca':
            $placa = $_POST['placa'];
            $stmt = $pdo->prepare("
                SELECT i.*, v.placa, v.tipo, v.propietario, p.codigo AS puesto_codigo
                FROM ingresos i
                JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
                JOIN puestos p ON i.id_puesto = p.id_puesto
                WHERE v.placa = ?
                ORDER BY i.fecha_ingreso DESC
                LIMIT 1
            ");
            $stmt->execute([$placa]);
            $ingreso = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($ingreso) {
                echo json_encode(['success' => true, 'data' => $ingreso]);
            } else {
                echo json_encode(['success' => false, 'message' => 'No se encontró ningún ingreso para la placa proporcionada.']);
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