<?php

$host = 'localhost';
$db = 'a23gurkaukau_db';
$user = 'a23gurkaukau_simran'; 
$pass = 'Simran1234'; 

/*
$host = 'localhost';
$db = 'db';
$user = 'root'; 
$pass = ''; 
*/

// Crear conexión
$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
