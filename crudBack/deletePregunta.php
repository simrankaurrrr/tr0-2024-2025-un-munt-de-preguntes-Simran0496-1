<?php
require_once '../back/config.php';

$id = $_GET['id'];

// Eliminar las respuestas
$sql = "DELETE FROM respostes WHERE pregunta_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();

// Eliminar la pregunta
$sql = "DELETE FROM preguntes WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();

echo json_encode(['success' => true]);
?>
