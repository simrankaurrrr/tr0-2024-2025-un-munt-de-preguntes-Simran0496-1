<?php
session_start(); // Iniciar la sesión

// Configuración de la conexión
include 'config.php';
require_once 'migrate.php';
try {
    // Configurar MySQLi para que lance excepciones en caso de error
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    // Conectar a la base de datos
    $conexionBD = new mysqli($host, $user, $pass, $db);
    $conexionBD->set_charset("utf8"); // Asegurar que los caracteres especiales se manejen correctamente

    // Consulta para obtener todas las preguntas
    $consultaPreguntas = "SELECT * FROM preguntes";
    $resultadoPreguntas = $conexionBD->query($consultaPreguntas);

    if ($resultadoPreguntas->num_rows > 0) {
        // Obtener todas las preguntas en un array
        $totesPreguntes = [];
        while ($row = $resultadoPreguntas->fetch_assoc()) {
            $idPregunta = $row['id'];
            
            // Obtener las respuestas para cada pregunta
            $consultaRespostes = "SELECT resposta FROM respostes WHERE pregunta_id = ?";
            $stmt = $conexionBD->prepare($consultaRespostes);
            $stmt->bind_param("i", $idPregunta);
            $stmt->execute();
            $resultadoRespostes = $stmt->get_result();

            $respostes = [];
            while ($resposta = $resultadoRespostes->fetch_assoc()) {
                $respostes[] = $resposta['resposta'];
            }

            // Agregar la pregunta con sus respuestas al array final
            $row['respostes'] = $respostes;
            $totesPreguntes[] = $row;

            // Cerrar el statement para evitar consumo innecesario de recursos
            $stmt->close();
        }

        // Guardar las preguntas en la sesión si es necesario
        $_SESSION['preguntesSeleccionades'] = $totesPreguntes;

        // Devolver todas las preguntas como JSON
        header('Content-Type: application/json');
        echo json_encode($totesPreguntes);
    } else {
        // Devolver un array vacío si no hay preguntas
        echo json_encode([]);
    }
} catch (mysqli_sql_exception $e) {
    // Capturar cualquier error de SQL
    http_response_code(500); // Devolver código 500 si hay un error
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if ($conexionBD) {
        $conexionBD->close(); // Asegurarse de cerrar la conexión
    }
}
?>
