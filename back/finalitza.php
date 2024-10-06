<?php

header('Content-Type: application/json');

// Cargar configuración
require_once 'config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);
$correctas = 0;
$totalPreguntes = count($data['respostes']); // Cambiar aquí para contar todas las preguntas enviadas
$respuestasContadas = 0; // Contador de respuestas válidas

foreach ($data['respostes'] as $respuesta) {
    if (isset($respuesta['idPregunta'], $respuesta['respostaSeleccionada']) && $respuesta['respostaSeleccionada'] != -1) {
        // Solo incrementamos si se ha respondido
        $respuestasContadas++;

        $preguntaId = $respuesta['idPregunta'];
        $respuestaSeleccionada = trim($respuesta['respostaSeleccionada']);

        // Obtener la respuesta correcta
        $sql = "SELECT resposta_correcta_id FROM preguntes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$preguntaId]);
        $respostaCorrectaId = $stmt->fetchColumn();

        // Compara la respuesta seleccionada con la correcta
        if ($respostaCorrectaId) {
            // Obtener el ID de la respuesta seleccionada
            $sqlRespuestaId = "SELECT id FROM respostes WHERE resposta = ? AND pregunta_id = ?";
            $stmtRespuesta = $conn->prepare($sqlRespuestaId);
            $stmtRespuesta->execute([$respuestaSeleccionada, $preguntaId]);
            $respuestaSeleccionadaId = $stmtRespuesta->fetchColumn();

            if ($respuestaSeleccionadaId == $respostaCorrectaId) {
                $correctas++; // Incrementa el contador de respuestas correctas
            }
        }
    }
}

// Aquí puedes retornar los resultados
echo json_encode([
    'puntuacio' => $correctas,
    'totalPreguntes' => $totalPreguntes // Regresa el total de preguntas seleccionadas
]);
?>