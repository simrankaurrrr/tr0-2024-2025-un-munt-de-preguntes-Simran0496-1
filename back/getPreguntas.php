<?php
header('Content-Type: application/json');

// Número de preguntas a devolver
$numPreguntas = isset($_GET['numPreguntas']) ? (int)$_GET['numPreguntas'] : 10;

// Leer el archivo data.json
$dataFile = './data.json';
if (!file_exists($dataFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
    exit;
}

$data = json_decode(file_get_contents($dataFile), true);

if ($data === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Error reading JSON']);
    exit;
}

// Seleccionar preguntas aleatorias
$preguntas = $data['preguntes'];
$selectedPreguntas = array_rand($preguntas, min($numPreguntas, count($preguntas)));
$result = [];
foreach ($selectedPreguntas as $index) {
    $result[] = $preguntas[$index];
}

// Devolver las preguntas como JSON
echo json_encode($result);
?>
