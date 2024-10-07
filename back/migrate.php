<?php 
$archivoConfig = 'config.php';

// Cargar las variables de configuración
require_once $archivoConfig;

// Crear las tablas si no existen
try {
    // Crear la tabla de preguntas
    $crearTablaPreguntes = "
        CREATE TABLE IF NOT EXISTS preguntes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pregunta TEXT NOT NULL,
            resposta_correcta_id INT DEFAULT NULL,
            imatge VARCHAR(255) DEFAULT NULL
        ) ENGINE=InnoDB;
    ";
    $conexionBD->exec($crearTablaPreguntes);

    // Crear la tabla de respuestas
    $crearTablaRespostes = "
        CREATE TABLE IF NOT EXISTS respostes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pregunta_id INT NOT NULL,
            resposta TEXT NOT NULL,
            FOREIGN KEY (pregunta_id) REFERENCES preguntes(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $conexionBD->exec($crearTablaRespostes);

} catch (PDOException $errorTabla) {
    die("Error al crear las tablas: " . $errorTabla->getMessage());
}

// Ruta del archivo JSON
$rutaArchivoJSON = './data.json';


// Preparar la consulta de inserción para las preguntas
$consultaInsertarPregunta = "INSERT INTO preguntes (pregunta, resposta_correcta_id, imatge) VALUES (:textoPregunta, :indiceRespostaCorrecta, :imagen)";
$sentenciaInsertarPregunta = $conexionBD->prepare($consultaInsertarPregunta);

// Preparar la consulta de inserción para las respuestas
$consultaInsertarRespuesta = "INSERT INTO respostes (pregunta_id, resposta) VALUES (:idPregunta, :textoRespuesta)";
$sentenciaInsertarRespuesta = $conexionBD->prepare($consultaInsertarRespuesta);

// Recorrer los datos y realizar las inserciones
foreach ($arrayDatosJSON['preguntes'] as $preguntaItem) {
    // Primero, inserta la pregunta
    $sentenciaInsertarPregunta->execute([
        ':textoPregunta' => $preguntaItem['pregunta'],
        ':indiceRespostaCorrecta' => null, // Se actualizará después
        ':imagen' => $preguntaItem['imatge']
    ]);

    // Obtener el ID de la pregunta insertada
    $idPreguntaInsertada = $conexionBD->lastInsertId();
    echo "Pregunta insertada: ID $idPreguntaInsertada - " . $preguntaItem['pregunta'] . "\n"; // Debug: mostrar la pregunta insertada

    // Guardar los IDs de las respuestas
    $idRespuestas = [];
    
    // Insertar respuestas
    foreach ($preguntaItem['respostes'] as $respuestaTexto) {
        $sentenciaInsertarRespuesta->execute([
            ':idPregunta' => $idPreguntaInsertada, // relacionar respuesta con esta pregunta
            ':textoRespuesta' => $respuestaTexto
        ]);
        $idRespuestas[] = $conexionBD->lastInsertId(); // Guardar el ID de la respuesta insertada
    }

    // Encontrar el ID de la respuesta correcta
    $respuestaCorrectaTexto = $preguntaItem['resposta_correcta_id'];
    $indiceRespuestaCorrecta = array_search($respuestaCorrectaTexto, $preguntaItem['respostes']);

    if ($indiceRespuestaCorrecta !== false) {
        // Actualizar la respuesta correcta en la pregunta insertada
        $conexionBD->query("UPDATE preguntes SET resposta_correcta_id = " . $idRespuestas[$indiceRespuestaCorrecta] . " WHERE id = $idPreguntaInsertada");
    } else {
        echo "No se encontró una respuesta correcta válida para la pregunta: " . $preguntaItem['pregunta'] . "\n";
    }
}

echo "Datos insertados correctamente.";
?>
