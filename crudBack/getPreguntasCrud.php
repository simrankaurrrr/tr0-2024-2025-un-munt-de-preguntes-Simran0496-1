<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once '../back/config.php';

$id = $_GET['id'] ?? null;

$sql = "SELECT p.id, p.pregunta, p.imatge, r.resposta as respostaCorrecta, 
        GROUP_CONCAT(r2.resposta) as respostes 
        FROM preguntes p
        LEFT JOIN respostes r ON p.resposta_correcta_id = r.id
        LEFT JOIN respostes r2 ON p.id = r2.pregunta_id";

// Modifica la consulta si hay un ID
if ($id) {
    $sql .= " WHERE p.id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
} else {
    $sql .= " GROUP BY p.id";
    $stmt = $conn->prepare($sql);
}

// Ejecutar la consulta
$stmt->execute();
$result = $stmt->get_result();
$preguntas = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $preguntas[] = [
            'id' => $row['id'],
            'pregunta' => $row['pregunta'],
            'imatge' => $row['imatge'],
            'respostes' => explode(',', $row['respostes']),
            'respostaCorrecta' => $row['respostaCorrecta']
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($preguntas);
?>
