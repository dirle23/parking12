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
            $id_ingreso = $_POST['id_ingreso'];
            $monto = $_POST['monto'];
            $fecha_generada = $_POST['fecha_generada'];
            $pagada = $_POST['pagada'] ?? false;

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
            $pagada = $_POST['pagada'] ?? false;

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

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>