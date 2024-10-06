<?php
require_once '../back/config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (empty($_POST['preguntaId']) || empty($_POST['pregunta']) || empty($_POST['imagen']) || empty($_POST['opciones']) || empty($_POST['respuestaCorrecta'])) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit();
    }

    $id = $_POST['preguntaId'];
    $pregunta = $_POST['pregunta'];
    $imagen = $_POST['imagen'];
    $opciones = explode(',', $_POST['opciones']);
    $respuestaCorrecta = $_POST['respuestaCorrecta'];

    // Actualizar la pregunta
    $sql = "UPDATE preguntes SET pregunta = ?, imatge = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $pregunta, $imagen, $id);
    $stmt->execute();

    // Eliminar respuestas antiguas
    $sql = "DELETE FROM respostes WHERE pregunta_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();

    // Insertar nuevas respuestas
    $respuestaId = null; // Inicializa la variable para almacenar la respuesta correcta
    foreach ($opciones as $opcion) {
        $opcion = trim($opcion);
        $sql = "INSERT INTO respostes (pregunta_id, resposta) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('is', $id, $opcion);
        $stmt->execute();

        if ($opcion === $respuestaCorrecta) {
            $respuestaId = $stmt->insert_id;
        }
    }

    // Actualizar la respuesta correcta
    if ($respuestaId) {
        $sql = "UPDATE preguntes SET resposta_correcta_id = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $respuestaId, $id);
        $stmt->execute();
    }

    echo json_encode(['success' => true]);
}
?>
