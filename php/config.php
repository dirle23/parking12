<?php
// Configuración de cabeceras para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    // Configuración de la base de datos
    $dsn = 'mysql:host=localhost;dbname=parqueadero;charset=utf8';
    $username = 'root';
    $password = '';

    // Creación de la conexión PDO
    $pdo = new PDO($dsn, $username, $password);

    // Configurar el modo de error a excepción
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    // Manejar errores de conexión
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
}
?>
