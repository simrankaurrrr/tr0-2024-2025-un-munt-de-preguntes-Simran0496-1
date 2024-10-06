<?php
session_start(); // Iniciar la sesión

// Configuración de la conexión
require_once 'config.php';

try {
    // Conectar a la base de datos
    $conexionBD = new mysqli($host, $user, $pass, $db);
    
    // Comprobar la conexión
    if ($conexionBD->connect_error) {
        die("Error de conexión: " . $conexionBD->connect_error);
    }

    // Consulta para obtener todas las preguntas y sus respuestas
    $consultaPreguntas = "SELECT * FROM preguntes";
    $resultadoPreguntas = $conexionBD->query($consultaPreguntas);

    if ($resultadoPreguntas->num_rows > 0) {
        // Obtener todas las preguntas en un array
        $totesPreguntes = [];
        while ($row = $resultadoPreguntas->fetch_assoc()) {
            $idPregunta = $row['id'];
            
            // Obtener las respuestas para cada pregunta
            $consultaRespostes = "SELECT * FROM respostes WHERE pregunta_id = ?";
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
        }

        // Guardar las preguntas en la sesión
        $_SESSION['preguntesSeleccionades'] = $totesPreguntes;

        // Devolver todas las preguntas como JSON
        header('Content-Type: application/json');
        echo json_encode($totesPreguntes);
    } else {
        echo json_encode([]);
    }
} catch (mysqli_sql_exception $e) {
    echo "Error: " . $e->getMessage();
} finally {
    $conexionBD->close();
}
?>
