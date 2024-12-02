<?php
header('Content-Type: application/json');
include 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_POST['action'] ?? ($_GET['action'] ?? '');

    switch ($action) {
        case 'add':
            $codigo = $_POST['codigo'];
            $ubicacion = $_POST['ubicacion'];
            $estado = $_POST['estado'];

            $stmt = $pdo->prepare("INSERT INTO puestos (codigo, ubicacion, estado) VALUES (?, ?, ?)");
            $stmt->execute([$codigo, $ubicacion, $estado]);
            echo json_encode(['success' => true, 'message' => 'Puesto creado con éxito.']);
            break;

        case 'update':
            $id_puesto = $_POST['id_puesto'];
            $codigo = $_POST['codigo'];
            $ubicacion = $_POST['ubicacion'];
            $estado = $_POST['estado'] ?? null;

            if ($estado) {
                $stmt = $pdo->prepare("UPDATE puestos SET codigo = ?, ubicacion = ?, estado = ? WHERE id_puesto = ?");
                $stmt->execute([$codigo, $ubicacion, $estado, $id_puesto]);
            } else {
                $stmt = $pdo->prepare("UPDATE puestos SET codigo = ?, ubicacion = ? WHERE id_puesto = ?");
                $stmt->execute([$codigo, $ubicacion, $id_puesto]);
            }
            echo json_encode(['success' => true, 'message' => 'Puesto actualizado con éxito.']);
            break;

        case 'delete':
            $id_puesto = $_POST['id_puesto'];
            $stmt = $pdo->prepare("DELETE FROM puestos WHERE id_puesto = ?");
            $stmt->execute([$id_puesto]);
            echo json_encode(['success' => true, 'message' => 'Puesto eliminado con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id_puesto'])) {
                $id_puesto = $_POST['id_puesto'];
                $stmt = $pdo->prepare("SELECT * FROM puestos WHERE id_puesto = ?");
                $stmt->execute([$id_puesto]);
                $puesto = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($puesto) {
                    echo json_encode($puesto);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Puesto no encontrado.']);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM puestos");
                $puestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'puestos' => $puestos]);
            }
            break;

        case 'getPuestos':
            $stmt = $pdo->query("SELECT id_puesto, codigo, estado FROM puestos WHERE estado = 'disponible'");
            $puestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'puestos' => $puestos]);
            break;

        case 'get_enum_values':
            $stmt = $pdo->query("SHOW COLUMNS FROM puestos LIKE 'estado'");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            preg_match_all("/'([^']+)'/", $row['Type'], $matches);
            $enum_values = $matches[1];
            echo json_encode(['success' => true, 'enum_values' => $enum_values]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>