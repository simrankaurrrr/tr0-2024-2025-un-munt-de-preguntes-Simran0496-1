<?php
header('Content-Type: application/json');

// Cargar configuración
require_once 'config.php';

// Conectar a la base de datos
$conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Recuperar las respuestas enviadas
$input = json_decode(file_get_contents("php://input"), true);

// Inicializar contadores
$correctas = 0;
$incorrectas = 0;

// Comprobar las respuestas
foreach ($input['respostes'] as $respuesta) {
    $preguntaId = $respuesta['idPregunta'];
    $respuestaSeleccionada = $respuesta['respostaSeleccionada'];

    // Realizar la consulta para obtener la respuesta correcta de la base de datos
    $sql = "SELECT resposta_correcta FROM preguntes WHERE id_pregunta = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$preguntaId]);
    $respostaCorrecta = $stmt->fetchColumn(); // Obtener solo la respuesta correcta

    // Verificar si la respuesta seleccionada es correcta
    if ($respostaCorrecta == $respuestaSeleccionada) {
        $correctas++;
    } else {
        $incorrectas++;
    }
}

// Enviar la puntuación al cliente
$response = [
    'puntuacio' => $correctas,
    'totalPreguntes' => $correctas + $incorrectas
];
echo json_encode($response);
?>
