<?php
header('Content-Type: application/json');
include 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
            $id_vehiculo = filter_var($_POST['id_vehiculo'], FILTER_SANITIZE_NUMBER_INT);
            $id_puesto = filter_var($_POST['id_puesto'], FILTER_SANITIZE_NUMBER_INT);
            $fecha_ingreso = filter_var($_POST['fecha_ingreso'], FILTER_SANITIZE_STRING);
            $fecha_salida = $_POST['fecha_salida'] ? filter_var($_POST['fecha_salida'], FILTER_SANITIZE_STRING) : null;
            $tarifa_aplicada = filter_var($_POST['tarifa_aplicada'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $multa = $_POST['multa'] ? filter_var($_POST['multa'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION) : 0;

            try {
                $stmt = $pdo->prepare("INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, fecha_salida, tarifa_aplicada, multa) 
                                       VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $fecha_salida, $tarifa_aplicada, $multa]);
                echo json_encode(['success' => true, 'message' => 'Ingreso creado con éxito.']);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al crear ingreso: ' . $e->getMessage()]);
            }
            break;

        case 'update':
            $id_ingreso = filter_var($_POST['id_ingreso'], FILTER_SANITIZE_NUMBER_INT);
            $id_vehiculo = filter_var($_POST['id_vehiculo'], FILTER_SANITIZE_NUMBER_INT);
            $id_puesto = filter_var($_POST['id_puesto'], FILTER_SANITIZE_NUMBER_INT);
            $fecha_ingreso = filter_var($_POST['fecha_ingreso'], FILTER_SANITIZE_STRING);
            $fecha_salida = $_POST['fecha_salida'] ? filter_var($_POST['fecha_salida'], FILTER_SANITIZE_STRING) : null;
            $tarifa_aplicada = filter_var($_POST['tarifa_aplicada'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
            $multa = $_POST['multa'] ? filter_var($_POST['multa'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION) : 0;

            try {
                $stmt = $pdo->prepare("UPDATE ingresos 
                                       SET id_vehiculo = ?, id_puesto = ?, fecha_ingreso = ?, fecha_salida = ?, tarifa_aplicada = ?, multa = ? 
                                       WHERE id_ingreso = ?");
                $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $fecha_salida, $tarifa_aplicada, $multa, $id_ingreso]);
                echo json_encode(['success' => true, 'message' => 'Ingreso actualizado con éxito.']);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar ingreso: ' . $e->getMessage()]);
            }
            break;

        case 'delete':
            $id_ingreso = filter_var($_POST['id_ingreso'], FILTER_SANITIZE_NUMBER_INT);

            try {
                $stmt = $pdo->prepare("DELETE FROM ingresos WHERE id_ingreso = ?");
                $stmt->execute([$id_ingreso]);
                echo json_encode(['success' => true, 'message' => 'Ingreso eliminado con éxito.']);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al eliminar ingreso: ' . $e->getMessage()]);
            }
            break;

        case 'fetch':
            try {
                if (isset($_POST['id_ingreso'])) {
                    $id_ingreso = filter_var($_POST['id_ingreso'], FILTER_SANITIZE_NUMBER_INT);
                    $stmt = $pdo->prepare("SELECT i.id_ingreso, i.fecha_ingreso, i.fecha_salida, i.tarifa_aplicada, i.multa, 
                                                  v.placa AS vehiculo, v.tipo AS tipo_vehiculo, 
                                                  p.codigo AS puesto, p.ubicacion AS ubicacion_puesto 
                                           FROM ingresos i
                                           JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
                                           JOIN puestos p ON i.id_puesto = p.id_puesto
                                           WHERE i.id_ingreso = ?");
                    $stmt->execute([$id_ingreso]);
                    $ingreso = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($ingreso) {
                        echo json_encode($ingreso);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Ingreso no encontrado.']);
                    }
                } else {
                    $stmt = $pdo->query("SELECT i.id_ingreso, i.fecha_ingreso, i.fecha_salida, i.tarifa_aplicada, i.multa, 
                                                v.placa AS vehiculo, v.tipo AS tipo_vehiculo, 
                                                p.codigo AS puesto, p.ubicacion AS ubicacion_puesto 
                                         FROM ingresos i
                                         JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
                                         JOIN puestos p ON i.id_puesto = p.id_puesto");
                    $ingresos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode($ingresos);
                }
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error al obtener ingresos: ' . $e->getMessage()]);
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
