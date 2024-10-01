<?php
error_reporting(E_ALL); // Reportar todos los errores
ini_set('display_errors', 1); // Mostrar errores en la salida
header('Content-Type: application/json'); // Configurar la cabecera para devolver JSON

// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "db");

// Verificar la conexión
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Consulta para obtener las preguntas y respuestas
$sql = "
    SELECT p.id_pregunta, p.pregunta, p.imatge, 
           GROUP_CONCAT(r.resposta SEPARATOR '|') AS respostes, 
           GROUP_CONCAT(r.es_correcta SEPARATOR '|') AS correctas
    FROM preguntes p
    LEFT JOIN respostes r ON p.id_pregunta = r.pregunta_id
    GROUP BY p.id_pregunta
    ORDER BY p.id_pregunta
";

// Ejecutar la consulta
$result = $conn->query($sql);

$preguntes = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Agregar pregunta
        $preguntes[] = [
            'pregunta' => $row['pregunta'],
            'imatge' => $row['imatge'],
            'respostes' => explode('|', $row['respostes']), // Convertir cadena a array
            'correcta' => null // Se inicializa el campo para la respuesta correcta
        ];

        // Si hay respuestas correctas, asignarlas
        if ($row['correctas']) {
            $correctas = explode('|', $row['correctas']);
            foreach ($correctas as $respuesta) {
                // Asignar la respuesta correcta
                if (in_array($respuesta, $preguntes[count($preguntes) - 1]['respostes'])) {
                    $preguntes[count($preguntes) - 1]['correcta'] = $respuesta;
                }
            }
        }
    }
}

// Limitar a las primeras 10 preguntas de la lista final
$preguntes_limited = array_slice($preguntes, 0, 10);

// Devolver el JSON con las preguntas
echo json_encode(["preguntes" => $preguntes_limited]);

$conn->close();
?>
