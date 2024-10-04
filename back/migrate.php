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
            ':idPregunta' => $idPreguntaInsertada, // Relacionar respuesta con esta pregunta
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
