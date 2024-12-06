<?php
// Configuración de conexión a la base de datos
$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'parqueadero';

// Crear conexión
$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos.']);
    exit;
}

// Determinar la acción solicitada
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'getVehiculo':
        getVehiculo($conn);
        break;

    case 'verificarHorarioYMulta':
        verificarHorarioYMulta($conn);
        break;

    case 'registrarSalida':
        registrarSalida($conn);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
        break;
}

$conn->close();

/**
 * Función para obtener la información del vehículo y su ingreso
 */
function getVehiculo($conn)
{
    $placa = $_POST['placa'] ?? '';

    if (empty($placa)) {
        echo json_encode(['success' => false, 'message' => 'Placa no proporcionada.']);
        return;
    }

    $sql = "SELECT 
                v.tipo,
                v.propietario,
                i.fecha_ingreso,
                i.id_puesto,
                i.id_ingreso,
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
        echo json_encode(['success' => false, 'message' => 'Vehículo no encontrado o ya ha salido.']);
    }
}

/**
 * Función para verificar el horario y calcular la multa
 */
function verificarHorarioYMulta($conn)
{
    $fechaIngreso = $_POST['fechaIngreso'] ?? '';
    $idIngreso = $_POST['idIngreso'] ?? '';

    if (empty($fechaIngreso) || empty($idIngreso)) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos para verificar el horario.']);
        return;
    }

    $fechaIngreso = new DateTime($fechaIngreso);
    $diaSemana = $fechaIngreso->format('l'); // Obtener el día de la semana

    $horaSalida = new DateTime(); // Hora actual como hora de salida
    $horaSalidaActual = $horaSalida->format('H:i');

    // Definir horarios de apertura del parqueadero
    $horarios = [
        'Monday' => ['06:00', '22:00'],
        'Tuesday' => ['06:00', '22:00'],
        'Wednesday' => ['06:00', '22:00'],
        'Thursday' => ['06:00', '22:00'],
        'Friday' => ['06:00', '22:00'],
        'Saturday' => ['09:00', '19:00'],
        'Sunday' => ['09:00', '12:00'],
    ];

    $horaApertura = $horarios[$diaSemana][0] ?? '00:00';
    $horaCierre = $horarios[$diaSemana][1] ?? '23:59';

    $multa = 0;

    // Verificar si está fuera de horario
    if ($horaSalidaActual > $horaCierre || $horaSalidaActual < $horaApertura) {
        $sql = "SELECT monto FROM multas WHERE id_ingreso = ? ORDER BY fecha_generada DESC LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $idIngreso);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $multa = $result->fetch_assoc()['monto'];
        } else {
            $multa = 5000; // Multa por defecto si no hay registros
        }
    }

    echo json_encode(['success' => true, 'multa' => $multa]);
}

/**
 * Función para registrar la salida del vehículo
 */
function registrarSalida($conn)
{
    $idIngreso = $_POST['idIngreso'] ?? '';
    $fechaSalida = $_POST['fechaSalida'] ?? '';
    $tarifaAplicada = $_POST['tarifaAplicada'] ?? 0;
    $multa = $_POST['multa'] ?? 0;

    if (empty($idIngreso) || empty($fechaSalida) || !is_numeric($tarifaAplicada)) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos para registrar la salida.']);
        return;
    }

    $sql = "UPDATE ingresos SET 
                fecha_salida = ?, 
                tarifa_aplicada = ?, 
                multa = ? 
            WHERE id_ingreso = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sdii', $fechaSalida, $tarifaAplicada, $multa, $idIngreso);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Salida registrada correctamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar la salida.']);
    }

    $stmt->close();
}
?>