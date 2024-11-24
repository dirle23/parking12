<?php
header('Content-Type: application/json');
include 'config.php';

// Manejar solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit(0);
}

try {
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmtEnum = $pdo->prepare("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'puestos' AND COLUMN_NAME = 'estado'");
    $stmtEnum->execute();
    $column_info = $stmtEnum->fetch(PDO::FETCH_ASSOC);

    if ($column_info) {
        preg_match("/enum\(\'(.*)\'\)/", $column_info['COLUMN_TYPE'], $matches);
        $enum_values = explode("','", $matches[1]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo obtener los valores del campo estado.']);
        exit;
    }

    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'add':
            $codigo = $_POST['codigo'];
            $ubicacion = $_POST['ubicacion'];
            $estado = $_POST['estado'];

            if (!in_array($estado, $enum_values)) {
                echo json_encode(['success' => false, 'message' => 'Valor de estado no válido.']);
                break;
            }

            $stmt = $pdo->prepare("INSERT INTO puestos (codigo, ubicacion, estado) VALUES (?, ?, ?)");
            $stmt->execute([$ubicacion, $codigo, $estado]);
            echo json_encode(['success' => true, 'message' => 'Puesto creado con éxito.']);
            break;

        case 'update':
            $id_puesto = $_POST['id_puesto'];
            $codigo = $_POST['codigo'];
            $ubicacion = $_POST['ubicacion'];
            $estado = $_POST['estado'];

            if (!in_array($estado, $enum_values)) {
                echo json_encode(['success' => false, 'message' => 'Valor de estado no válido.']);
                break;
            }

            $stmt = $pdo->prepare("UPDATE puestos SET codigo = ?, ubicacion = ?, estado = ? WHERE id_puesto = ?");
            $stmt->execute([$codigo, $ubicacion, $estado, $id_puesto]);
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
                    $puesto['enum_values'] = $enum_values; 
                    echo json_encode($puesto);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Puesto no encontrado.']);
                }
            } else {
                // Obtener todos los puestos
                $stmt = $pdo->query("SELECT * FROM puestos");
                $puestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
                if ($puestos) {
                    foreach ($puestos as &$puesto) {
                        $puesto['enum_values'] = $enum_values;  
                    }
                    echo json_encode($puestos);
                } else {
                    echo json_encode(['success' => false, 'message' => 'No se encontraron puestos.']);
                }
            }
            break;
            

        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
