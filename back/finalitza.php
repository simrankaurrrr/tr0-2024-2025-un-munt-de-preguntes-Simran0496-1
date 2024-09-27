<?php
header('Content-Type: application/json');

// Recibir las respuestas como JSON
$data = json_decode(file_get_contents('php://input'), true);

// Verificar si se recibieron las respuestas
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

// Leer el archivo data.json para verificar respuestas
$dataFile = './data.json';
if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
    exit;
}

$questions = json_decode(file_get_contents($dataFile), true)['preguntes'];
$totalPreguntas = count($questions);
$respuestasCorrectas = 0;

// Verificar respuestas
foreach ($data as $index => $respuesta) {
    if (isset($questions[$index]) && $questions[$index]['resposta_correcta'] === $respuesta) {
        $respuestasCorrectas++;
    }
}

// Devolver el resultado como JSON
echo json_encode([
    'total' => $totalPreguntas,
    'correctas' => $respuestasCorrectas,
]);
?>
