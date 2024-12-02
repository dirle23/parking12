<?php
header('Content-Type: application/json');
include 'config.php';

$action = $_GET['action'] ?? '';

if ($action == 'getDashboardData') {
    $data = [];

    // Horas totales de uso
    $stmt = $pdo->query("SELECT SUM(TIMESTAMPDIFF(HOUR, fecha_ingreso, fecha_salida)) AS horasTotales FROM ingresos WHERE fecha_salida IS NOT NULL AND id_vehiculo NOT IN (SELECT id_vehiculo FROM mensualidades WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin)");
    $data['horasTotales'] = $stmt->fetch(PDO::FETCH_ASSOC)['horasTotales'];

    // Multas por permanencia fuera del horario permitido
    $stmt = $pdo->query("SELECT SUM(monto) AS multasPermanencia FROM multas WHERE pagada = FALSE");
    $data['multasPermanencia'] = $stmt->fetch(PDO::FETCH_ASSOC)['multasPermanencia'];

    // Puestos ocupados y disponibles
    $stmt = $pdo->query("SELECT COUNT(*) AS puestosOcupados FROM puestos WHERE estado = 'ocupado'");
    $data['puestosOcupados'] = $stmt->fetch(PDO::FETCH_ASSOC)['puestosOcupados'];
    $stmt = $pdo->query("SELECT COUNT(*) AS puestosDisponibles FROM puestos WHERE estado = 'disponible'");
    $data['puestosDisponibles'] = $stmt->fetch(PDO::FETCH_ASSOC)['puestosDisponibles'];

    // Ingresos y egresos
    $stmt = $pdo->query("SELECT SUM(tarifa_aplicada) AS ingresos, SUM(multa) AS egresos FROM ingresos");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $data['ingresosEgresos'] = $result['ingresos'] - $result['egresos'];

    // Multas generadas y pagadas
    $stmt = $pdo->query("SELECT COUNT(*) AS multasGeneradas FROM multas");
    $data['multasGeneradas'] = $stmt->fetch(PDO::FETCH_ASSOC)['multasGeneradas'];
    $stmt = $pdo->query("SELECT COUNT(*) AS multasPagadas FROM multas WHERE pagada = TRUE");
    $data['multasPagadas'] = $stmt->fetch(PDO::FETCH_ASSOC)['multasPagadas'];
    $data['multasGeneradasPagadas'] = $data['multasGeneradas'] . ' / ' . $data['multasPagadas'];

    // Mensualidades activas y vencidas
    $stmt = $pdo->query("SELECT COUNT(*) AS mensualidadesActivas FROM mensualidades WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin");
    $data['mensualidadesActivas'] = $stmt->fetch(PDO::FETCH_ASSOC)['mensualidadesActivas'];
    $stmt = $pdo->query("SELECT COUNT(*) AS mensualidadesVencidas FROM mensualidades WHERE CURDATE() > fecha_fin");
    $data['mensualidadesVencidas'] = $stmt->fetch(PDO::FETCH_ASSOC)['mensualidadesVencidas'];
    $data['mensualidadesActivasVencidas'] = $data['mensualidadesActivas'] . ' / ' . $data['mensualidadesVencidas'];

    echo json_encode($data);
} else {
    echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
}
?>