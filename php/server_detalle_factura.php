<?php
header('Content-Type: application/json');
$dsn = 'mysql:host=localhost;dbname=sistema_facturacion;charset=utf8';
$username = 'root';
$password = '';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
            $id_factura = $_POST['id_factura'];
            $id_producto = $_POST['id_producto'];
            $cantidad = $_POST['cantidad'];
            $precio_unitario = $_POST['precio_unitario'];

            $stmt = $pdo->prepare("INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
            $stmt->execute([$id_factura, $id_producto, $cantidad, $precio_unitario]);
            echo json_encode(['success' => true, 'message' => 'Detalle de factura creado con éxito.']);
            break;

        case 'update':
            $id = $_POST['id'];
            $id_factura = $_POST['id_factura'];
            $id_producto = $_POST['id_producto'];
            $cantidad = $_POST['cantidad'];
            $precio_unitario = $_POST['precio_unitario'];

            $stmt = $pdo->prepare("UPDATE detalle_factura SET id_factura = ?, id_producto = ?, cantidad = ?, precio_unitario = ? WHERE id_detalle = ?");
            $stmt->execute([$id_factura, $id_producto, $cantidad, $precio_unitario, $id]);
            echo json_encode(['success' => true, 'message' => 'Detalle de factura actualizado con éxito.']);
            break;

        case 'delete':
            $id = $_POST['id'];
            $stmt = $pdo->prepare("DELETE FROM detalle_factura WHERE id_detalle = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Detalle de factura eliminado con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id'])) {
                $id = $_POST['id'];
                $stmt = $pdo->prepare("SELECT df.*, p.nombre AS nombre_producto FROM detalle_factura df JOIN productos p ON df.id_producto = p.id_producto WHERE df.id_detalle = ?");
                $stmt->execute([$id]);
                $detalle = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($detalle) {
                    echo json_encode($detalle);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Detalle de factura no encontrado.']);
                }
            } else {
                $stmt = $pdo->query("SELECT df.*, p.nombre AS nombre_producto FROM detalle_factura df JOIN productos p ON df.id_producto = p.id_producto");
                $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($detalles);
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