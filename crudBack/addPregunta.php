<?php
require_once '../back/config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verifica si los datos existen
    if (empty($_POST['pregunta']) || empty($_POST['imagen']) || empty($_POST['opciones']) || empty($_POST['respuestaCorrecta'])) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit();
    }

    $pregunta = $_POST['pregunta'];
    $imagen = $_POST['imagen'];
    $opciones = explode(',', $_POST['opciones']);
    $respuestaCorrecta = $_POST['respuestaCorrecta'];

    // Insertar pregunta
    $sql = "INSERT INTO preguntes (pregunta, imatge) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $pregunta, $imagen);
    $stmt->execute();
    $preguntaId = $stmt->insert_id;

    // Insertar respuestas
    $respuestaId = null; // Inicializa la variable para almacenar la respuesta correcta
    foreach ($opciones as $opcion) {
        $opcion = trim($opcion);
        $sql = "INSERT INTO respostes (pregunta_id, resposta) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('is', $preguntaId, $opcion);
        $stmt->execute();

        if ($opcion === $respuestaCorrecta) {
            $respuestaId = $stmt->insert_id;
        }
    }

    // Actualizar la respuesta correcta en la tabla pregunta
    if ($respuestaId) {
        $sql = "UPDATE preguntes SET resposta_correcta_id = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $respuestaId, $preguntaId);
        $stmt->execute();
    }

    echo json_encode(['success' => true]);
}
?>
