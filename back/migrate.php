<?php 
$archivoConfig = 'config.php';

// Cargar las variables de configuración
require_once $archivoConfig;

try {
    // Conexión a la base de datos
    $conexionBD = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $conexionBD->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $errorConexion) {
    die("Error de conexión: " . $errorConexion->getMessage());
}

// Ruta del archivo JSON
$rutaArchivoJSON = './data.json';

// Leer el archivo JSON
$contenidoJSON = file_get_contents($rutaArchivoJSON);
if ($contenidoJSON === false) {
    die("Error al leer el archivo JSON.");
}

// Decodificar el JSON a un array asociativo
$arrayDatosJSON = json_decode($contenidoJSON, true);
if ($arrayDatosJSON === null) {
    die("Error al decodificar el JSON: " . json_last_error_msg());
}

// Preparar la consulta de inserción para las preguntas
$consultaInsertarPregunta = "INSERT INTO preguntes (pregunta, resposta_correcta, imatge) VALUES (:textoPregunta, :indiceRespuestaCorrecta, :imagen)";
$sentenciaInsertarPregunta = $conexionBD->prepare($consultaInsertarPregunta);

// Preparar la consulta de inserción para las respuestas
$consultaInsertarRespuesta = "INSERT INTO respostes (pregunta_id, resposta) VALUES (:idPregunta, :textoRespuesta)";
$sentenciaInsertarRespuesta = $conexionBD->prepare($consultaInsertarRespuesta);

// Recorrer los datos y realizar las inserciones
foreach ($arrayDatosJSON['preguntes'] as $preguntaItem) {
    // Insertar la pregunta
    $sentenciaInsertarPregunta->execute([
        ':textoPregunta' => $preguntaItem['pregunta'],
        ':indiceRespuestaCorrecta' => $preguntaItem['resposta_correcta'],
        ':imagen' => $preguntaItem['imatge']
    ]);

    // Obtener el ID de la pregunta insertada
    $idPreguntaInsertada = $conexionBD->lastInsertId();
    
    echo "Pregunta insertada: ID $idPreguntaInsertada - " . $preguntaItem['pregunta'] . "\n"; // Debug: mostrar la pregunta insertada

    // Insertar las respuestas
    foreach ($preguntaItem['respostes'] as $respuestaTexto) {
        try {
            $sentenciaInsertarRespuesta->execute([
                ':idPregunta' => $idPreguntaInsertada,
                ':textoRespuesta' => $respuestaTexto
            ]);
            echo "Respuesta insertada: $respuestaTexto para pregunta ID $idPreguntaInsertada\n"; // Debug: mostrar la respuesta insertada
        } catch (PDOException $errorInsercionRespuesta) {
            echo "Error al insertar respuesta: " . $errorInsercionRespuesta->getMessage() . "\n"; // Manejo de errores
        }
    }
}

echo "Datos insertados correctamente.";
?>
