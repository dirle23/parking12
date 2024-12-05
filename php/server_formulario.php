<?php
header('Content-Type: application/json');
include 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? ($_GET['action'] ?? '');

    switch ($action) {
        case 'add':
            $placa = $_POST['placa'];
            $tipo = $_POST['tipoVehiculo'];
            $propietario = $_POST['propietario'] ?? 'Invitado';
            $id_puesto = $_POST['puesto'];
            $fecha_ingreso = $_POST['fechaIngreso'] . ' ' . $_POST['horaIngreso'];
            $tarifa_aplicada = $_POST['tarifa'];
            $esMensualidad = $_POST['esMensualidad'] ?? 'no';

            if ($esMensualidad === 'si') {
                $propietario = $_POST['propietario'] ?? 'Invitado';
            } else {
                $propietario = 'Invitado';
            }

            $stmt = $pdo->prepare("SELECT id_vehiculo FROM vehiculos WHERE placa = ?");
            $stmt->execute([$placa]);
            $vehiculo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$vehiculo) {
                $stmt = $pdo->prepare("INSERT INTO vehiculos (placa, tipo, propietario) VALUES (?, ?, ?)");
                $stmt->execute([$placa, $tipo, $propietario]);
                $id_vehiculo = $pdo->lastInsertId();
            } else {
                $id_vehiculo = $vehiculo['id_vehiculo'];
            }

            $stmt = $pdo->prepare("INSERT INTO ingresos (id_vehiculo, id_puesto, fecha_ingreso, tarifa_aplicada) VALUES (?, ?, ?, ?)");
            $stmt->execute([$id_vehiculo, $id_puesto, $fecha_ingreso, $tarifa_aplicada]);

            $stmt = $pdo->prepare("UPDATE puestos SET estado = 'ocupado' WHERE id_puesto = ?");
            $stmt->execute([$id_puesto]);

            if ($esMensualidad === 'si') {
                $fecha_inicio = $_POST['fechaInicio'];
                $fecha_fin = $_POST['fechaFin'];
                $horario_entrada = $_POST['horarioEntrada'];
                $horario_salida = $_POST['horarioSalida'];

                $stmt = $pdo->prepare("INSERT INTO mensualidades (id_vehiculo, fecha_inicio, fecha_fin, horario_entrada, horario_salida) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$id_vehiculo, $fecha_inicio, $fecha_fin, $horario_entrada, $horario_salida]);
            }

            echo json_encode(['success' => true, 'message' => 'Ingreso creado con éxito.']);
            break;

        case 'getPuestos':
            $stmt = $pdo->query("SELECT id_puesto, codigo, estado FROM puestos WHERE estado = 'disponible'");
            $puestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($puestos);
            break;

        case 'getTarifa':
            $tipoVehiculo = $_POST['tipoVehiculo'];
            $stmt = $pdo->prepare("SELECT tarifa_hora FROM tarifas WHERE tipo_vehiculo = ?");
            $stmt->execute([$tipoVehiculo]);
            $tarifa = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($tarifa) {
                echo json_encode(['success' => true, 'tarifa_hora' => $tarifa['tarifa_hora']]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Tarifa no encontrada.']);
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