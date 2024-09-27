<?php
session_start();

// Leer el JSON con las respuestas correctas
$info = file_get_contents("./data.json");
$datos = json_decode($info, true);

// Obtener respuestas del POST
$respuestas = json_decode(file_get_contents('php://input'), true);

// Inicializar contadores
$totalRespuestas = count($respuestas);
$respuestasCorrectas = 0;

// Verificar respuestas
foreach ($respuestas as $index => $respuesta) {
    if (isset($datos['preguntes'][$index])) {
        if ($respuesta == $datos['preguntes'][$index]['resposta_correcta']) {
            $respuestasCorrectas++;
        }
    }
}

// Retornar el resultado
$resultado = [
    'total' => $totalRespuestas,
    'correctes' => $respuestasCorrectas
];

echo json_encode($resultado);
