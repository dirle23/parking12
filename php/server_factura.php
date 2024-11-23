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
            $id_cliente = $_POST['cliente_id'];
            $id_usuario = $_POST['usuario_id'];
            $fecha = $_POST['fecha'];
            $id_producto = $_POST['id_producto'];
            $cantidad = $_POST['cantidad'];

            // Obtener el precio del producto
            $stmt = $pdo->prepare("SELECT precio FROM productos WHERE id_producto = ?");
            $stmt->execute([$id_producto]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            $precio_unitario = $producto['precio'];

            $total = $cantidad * $precio_unitario; // Calcular el total

            $stmt = $pdo->prepare("INSERT INTO facturas (id_cliente, id_usuario, fecha, id_producto, cantidad, total) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id_cliente, $id_usuario, $fecha, $id_producto, $cantidad, $total]);
            echo json_encode(['success' => true, 'message' => 'Factura creada con éxito.']);
            break;

        case 'update':
            $id = $_POST['id'];
            $id_cliente = $_POST['cliente_id'];
            $id_usuario = $_POST['usuario_id'];
            $fecha = $_POST['fecha'];
            $id_producto = $_POST['id_producto'];
            $cantidad = $_POST['cantidad'];

            // Obtener el precio del producto
            $stmt = $pdo->prepare("SELECT precio FROM productos WHERE id_producto = ?");
            $stmt->execute([$id_producto]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);
            $precio_unitario = $producto['precio'];

            $total = $cantidad * $precio_unitario; // Calcular el total

            $stmt = $pdo->prepare("UPDATE facturas SET id_cliente = ?, id_usuario = ?, fecha = ?, id_producto = ?, cantidad = ?, total = ? WHERE id_factura = ?");
            $stmt->execute([$id_cliente, $id_usuario, $fecha, $id_producto, $cantidad, $total, $id]);
            echo json_encode(['success' => true, 'message' => 'Factura actualizada con éxito.']);
            break;

        case 'delete':
            $id = $_POST['id'];
            $stmt = $pdo->prepare("DELETE FROM facturas WHERE id_factura = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Factura eliminada con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id'])) {
                $id = $_POST['id'];
                $stmt = $pdo->prepare("SELECT f.id_factura, f.id_cliente, f.id_usuario, f.fecha, f.id_producto, f.cantidad, f.total, c.nombre AS cliente, u.nombre AS usuario, p.nombre AS producto, p.precio AS precio_unitario 
                                       FROM facturas f 
                                       JOIN clientes c ON f.id_cliente = c.id_cliente 
                                       JOIN usuarios u ON f.id_usuario = u.id 
                                       JOIN productos p ON f.id_producto = p.id_producto 
                                       WHERE f.id_factura = ?");
                $stmt->execute([$id]);
                $factura = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($factura) {
                    echo json_encode($factura);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Factura no encontrada.']);
                }
            } else {
                $stmt = $pdo->query("SELECT f.id_factura, f.fecha, f.total, c.nombre AS cliente, u.nombre AS usuario, p.nombre AS producto, f.cantidad, p.precio AS precio_unitario 
                                     FROM facturas f 
                                     JOIN clientes c ON f.id_cliente = c.id_cliente 
                                     JOIN usuarios u ON f.id_usuario = u.id 
                                     JOIN productos p ON f.id_producto = p.id_producto");
                $facturas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($facturas);
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