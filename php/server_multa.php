<?php
// Configuración de cabecera
header('Content-Type: application/json');
include 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? ($_GET['action'] ?? '');

    switch ($action) {
        case 'add':
            $id_ingreso = $_POST['id_ingreso'];
            $monto = $_POST['monto'];
            $fecha_generada = $_POST['fecha_generada'];
            $pagada = filter_var($_POST['pagada'], FILTER_VALIDATE_BOOLEAN);

            $stmt = $pdo->prepare("INSERT INTO multas (id_ingreso, monto, fecha_generada, pagada) 
                                   VALUES (?, ?, ?, ?)");
            $stmt->execute([$id_ingreso, $monto, $fecha_generada, $pagada]);
            echo json_encode(['success' => true, 'message' => 'Multa creada con éxito.']);
            break;

        case 'update':
            $id_multa = $_POST['id_multa'];
            $id_ingreso = $_POST['id_ingreso'];
            $monto = $_POST['monto'];
            $fecha_generada = $_POST['fecha_generada'];
            $pagada = filter_var($_POST['pagada'], FILTER_VALIDATE_BOOLEAN);

            $stmt = $pdo->prepare("UPDATE multas 
                                   SET id_ingreso = ?, monto = ?, fecha_generada = ?, pagada = ? 
                                   WHERE id_multa = ?");
            $stmt->execute([$id_ingreso, $monto, $fecha_generada, $pagada, $id_multa]);
            echo json_encode(['success' => true, 'message' => 'Multa actualizada con éxito.']);
            break;

        case 'delete':
            $id_multa = $_POST['id_multa'];
            $stmt = $pdo->prepare("DELETE FROM multas WHERE id_multa = ?");
            $stmt->execute([$id_multa]);
            echo json_encode(['success' => true, 'message' => 'Multa eliminada con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id_multa'])) {
                $id_multa = $_POST['id_multa'];
                $stmt = $pdo->prepare("SELECT m.*, i.id_ingreso, i.fecha_ingreso 
                                       FROM multas m
                                       JOIN ingresos i ON m.id_ingreso = i.id_ingreso
                                       WHERE m.id_multa = ?");
                $stmt->execute([$id_multa]);
                $multa = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($multa) {
                    echo json_encode($multa);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Multa no encontrada.']);
                }
            } else {
                $stmt = $pdo->query("SELECT m.*, i.id_ingreso, i.fecha_ingreso 
                                     FROM multas m
                                     JOIN ingresos i ON m.id_ingreso = i.id_ingreso");
                $multas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($multas);
            }
            break;

        case 'obtenerDatosVehiculo':
            if (isset($_GET['placa'])) {
                $placa = $_GET['placa'];
                $stmt = $pdo->prepare("SELECT v.placa, v.tipo AS tipoVehiculo, i.fecha_ingreso AS fechaIngreso, p.ubicacion AS puesto, t.tarifa_hora AS tarifaHora
                                       FROM vehiculos v
                                       JOIN ingresos i ON v.id_vehiculo = i.id_vehiculo
                                       JOIN puestos p ON i.id_puesto = p.id_puesto
                                       JOIN tarifas t ON v.tipo = t.tipo_vehiculo
                                       WHERE v.placa = ?");
                $stmt->execute([$placa]);
                $vehiculo = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($vehiculo) {
                    $stmt = $pdo->prepare("SELECT m.monto
                                           FROM multas m
                                           JOIN ingresos i ON m.id_ingreso = i.id_ingreso
                                           JOIN vehiculos v ON i.id_vehiculo = v.id_vehiculo
                                           WHERE v.placa = ? AND m.pagada = FALSE");
                    $stmt->execute([$placa]);
                    $multas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $vehiculo['multas'] = $multas;
                    echo json_encode($vehiculo);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Vehículo no encontrado.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Placa no proporcionada.']);
            }
            break;

        case 'verificarMensualidad':
            if (isset($_GET['idVehiculo'])) {
                $idVehiculo = $_GET['idVehiculo'];
                $stmt = $pdo->prepare("SELECT COUNT(*) AS tieneMensualidad
                                       FROM mensualidades
                                       WHERE id_vehiculo = ? AND CURDATE() BETWEEN fecha_inicio AND fecha_fin");
                $stmt->execute([$idVehiculo]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode(['tieneMensualidad' => $result['tieneMensualidad'] > 0]);
            } else {
                echo json_encode(['success' => false, 'message' => 'ID del vehículo no proporcionado.']);
            }
            break;

        case 'obtenerHorarioMensualidad':
            if (isset($_GET['idVehiculo'])) {
                $idVehiculo = $_GET['idVehiculo'];
                $stmt = $pdo->prepare("SELECT horario_entrada, horario_salida
                                       FROM mensualidades
                                       WHERE id_vehiculo = ? AND CURDATE() BETWEEN fecha_inicio AND fecha_fin");
                $stmt->execute([$idVehiculo]);
                $horario = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($horario) {
                    echo json_encode($horario);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Horario de mensualidad no encontrado.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'ID del vehículo no proporcionado.']);
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