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
            $id_usuario = $_POST['id_usuario'];
            $permisos = implode(',', $_POST['permisos']);

            $stmt = $pdo->prepare("INSERT INTO permisos_usuario (id_usuario, permisos) VALUES (?, ?)");
            $stmt->execute([$id_usuario, $permisos]);
            echo json_encode(['success' => true, 'message' => 'Permiso de usuario creado con éxito.']);
            break;

        case 'update':
            $id_permiso = $_POST['id_permiso'];
            $id_usuario = $_POST['id_usuario'];
            $permisos = implode(',', $_POST['permisos']);

            $stmt = $pdo->prepare("UPDATE permisos_usuario SET id_usuario = ?, permisos = ? WHERE id_permiso = ?");
            $stmt->execute([$id_usuario, $permisos, $id_permiso]);
            echo json_encode(['success' => true, 'message' => 'Permiso de usuario actualizado con éxito.']);
            break;

        case 'delete':
            $id_permiso = $_POST['id_permiso'];
            $stmt = $pdo->prepare("DELETE FROM permisos_usuario WHERE id_permiso = ?");
            $stmt->execute([$id_permiso]);
            echo json_encode(['success' => true, 'message' => 'Permiso de usuario eliminado con éxito.']);
            break;

        case 'fetch':
            if (isset($_POST['id_permiso'])) {
                $id_permiso = $_POST['id_permiso'];
                $stmt = $pdo->prepare("SELECT pu.*, u.nombre AS nombre_usuario FROM permisos_usuario pu JOIN usuarios u ON pu.id_usuario = u.id WHERE id_permiso = ?");
                $stmt->execute([$id_permiso]);
                $permiso = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($permiso) {
                    echo json_encode($permiso);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Permiso de usuario no encontrado.']);
                }
            } else {
                $stmt = $pdo->query("SELECT pu.*, u.nombre AS nombre_usuario FROM permisos_usuario pu JOIN usuarios u ON pu.id_usuario = u.id");
                $permisos = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($permisos);
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