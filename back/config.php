<?php
$host = 'localhost';
$db = 'db';
$user = 'root'; // Cambia esto si es necesario
$pass = ''; // Cambia esto si es necesario

// Crear conexión
$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
