Esquema mínim de carpetes pels projectes transversals
a
És obligatori seguir aquesta estructura tot i que la podeu ampliar.

## Atenció
Un cop comenceu heu de canviar aquesta explicació amb la corresponent al vostre projecte (utilitzant markdown)

## Docker & Docker compose
El projecte s'ha de poder desplegar en mode desenvolupament simplement fent docker compose up

# Aquest fitxer ha de contenir com a mínim:
 * Nom dels integrants
 * Nom del projecte
 * Petita descripció
 * Adreça del gestor de tasques (taiga, jira, trello...)
 * Adreça del prototip gràfic del projecte (Penpot, figma, moqups...)
 * URL de producció (quan la tingueu)
 * Estat: (explicació d'en quin punt està)
















Tú dijiste:
tengo un codigo de quiz. todo funciona bien en quiz. quiero a;adri opcion de crud para editar el base de datos. cuando me slaga lo de  escribir nombre y cantidad preguntas quiero que me slaga un boton de ir al crud, y me quitara los divs de quiz y me ense;ara divs de crud. como mi web es spa no puedes poner links para ir al otro lado. juega con los divs para que todo funcione bien. copdigo- config.php-<?php
$host = 'localhost';
$dbname = 'db'; 
$user = 'root'; 
$pass = ''; 
?>   finalitza.php-<?php

header('Content-Type: application/json');
// Cargar configuración
require_once 'config.php';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
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
?>    getPregunta.php-<?php
session_start(); // Iniciar la sesión

// Configuración de la conexión
require_once 'config.php';

try {
    // Conectar a la base de datos
    $conexionBD = new mysqli($host, $user, $pass, $dbname);
    
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
?>    migrate.php-<?php 
$archivoConfig = 'config.php';

// Cargar las variables de configuración
require_once $archivoConfig;

try {
    // Conexión a MySQL sin especificar la base de datos para crearla si no existe
    $conexionBD = new PDO("mysql:host=$host", $user, $pass);
    $conexionBD->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Crear la base de datos si no existe
    $conexionBD->exec("CREATE DATABASE IF NOT EXISTS $dbname CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    // Seleccionar la base de datos recién creada
    $conexionBD->exec("USE $dbname");
} catch (PDOException $errorConexion) {
    die("Error de conexión: " . $errorConexion->getMessage());
}

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
?>             utils.js-let preg = [];
let preguntaActual = 0;
let timer;
const tiempoLimite = 30;
let tiempoRestante = tiempoLimite;
let cantidadPreguntes = 0;

let estatDeLaPartida = {
    contadorPreguntes: 0,
    preguntes: []
};
function iniciarJuego(nombre, cantPreg) {
    console.log(Iniciando juego para: ${nombre} con ${cantPreg} preguntas);

    cantidadPreguntes = cantPreg; //uso global

    // nombre
    localStorage.setItem("nombreUsuario", nombre);

    document.getElementById('pantallaInicio').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';

    fetch('.././back/getPreguntas.php')
        .then(respostes => {
            if (!respostes.ok) {
                throw new Error('Network response was not ok');
            }
            return respostes.json();
        })
        .then(data => {
           // console.log('Preguntas cargadas:', data);
            preg = data;
            const preguntasSeleccionadas = preg.slice(0, cantidadPreguntes);
            for (let i = 0; i < preguntasSeleccionadas.length; i++) {
                estatDeLaPartida.preguntes.push({
                    id: preguntasSeleccionadas[i].id,
                    feta: false,
                    respostaSeleccionada: -1,
                    respostaCorrecta: preguntasSeleccionadas[i].respostaCorrecta,
                    respostes: preguntasSeleccionadas[i].respostes
                });
            }
            mostrarPregunta();
            mostrarEstatPartida();
            iniciarTemporizador();
        })
        .catch(error => {
            console.error('Fetch error:', error);
            let contenedor = document.getElementById('contenedor');
            contenedor.innerHTML = '<h3>Error al cargar las preguntas.</h3>';
        });
}
//iniciar el tiempo
function iniciarTemporizador() {
    document.getElementById('temporizador').innerText = Tiempo restante: ${tiempoRestante} segundos;
    timer = setInterval(() => {
        tiempoRestante--;
        document.getElementById('temporizador').innerText = Tiempo restante: ${tiempoRestante} segundos;
        if (tiempoRestante <= 0) {
            clearInterval(timer);
            alert('Se acabó el tiempo!');
            enviarResultatsFuncion();
        }
    }, 1000);
}
function mostrarPregunta() {
    let htmlString = '';
    // Comprobar si hay preguntas cargadas
    if (preg && preg.length > 0) {
        // Asegúrate de que preguntaActual no exceda la cantidad de preguntas seleccionadas
        if (preguntaActual < cantidadPreguntes) {
            let pregunta = preg[preguntaActual];
            if (pregunta.respostes && Array.isArray(pregunta.respostes) && pregunta.respostes.length > 0) {
                htmlString += <div class="question-container">;
                htmlString += <h3>${pregunta.pregunta}</h3>;
                if (pregunta.imatge) {
                    htmlString += <img src="${pregunta.imatge}" class="img" alt="Pregunta imagen"/> <br>;
                }
                for (let indexR = 0; indexR < pregunta.respostes.length; indexR++) {
                    const selectedClass = estatDeLaPartida.preguntes[preguntaActual].respostaSeleccionada === pregunta.respostes[indexR] ? 'selected' : '';
                    htmlString += <button class="resposta ${selectedClass}" onclick="verificarResposta(${preguntaActual}, ${indexR})">${pregunta.respostes[indexR]}</button>;
                }
                htmlString += </div>;
            } else {
                console.error('La pregunta actual no tiene respuestas disponibles.');
                htmlString += <p>No hay respuestas disponibles para esta pregunta.</p>;
            }
            let contenedor = document.getElementById('contenedor');
            if (contenedor) {
                contenedor.innerHTML = htmlString;
            } else {
                console.error('Contenedor de preguntas no encontrado.');
            }
            // Manejo de la navegación, usando cantidadPreguntes en lugar de preg.length
            let navigationHtml = 
                <div class="navigation">
                    <button id="anterior" onclick="navegarPregunta(-1)" ${preguntaActual === 0 ? 'style="display:none;"' : ''}>Anterior</button>
                    <button id="siguiente" onclick="navegarPregunta(1)" ${preguntaActual === cantidadPreguntes - 1 ? 'style="display:none;"' : ''}>Siguiente</button>
                </div>
            ;
            // Actualiza el contenedor con la navegación
            contenedor.innerHTML += navigationHtml;
        } else {
            const todasRespondidas = estatDeLaPartida.preguntes.every(p => p.feta);

            if (todasRespondidas) {
                document.getElementById('enviarResultats').style.display = 'block'; // Mostrar botón cuando todas las preguntas están respondidas
            }
            let contenedor = document.getElementById('contenedor');
            if (contenedor) {
                contenedor.innerHTML = <h3>Has respondido todas las preguntas!</h3>;
            }
        }
    } else {
        console.error('No se encontraron preguntas o la variable preg está indefinida.');
        htmlString = '<h3>No se encontraron preguntas disponibles.</h3>';
    }
    mostrarEstatPartida();
}
function navegarPregunta(direccion) {
    preguntaActual += direccion;
    // Asegúrate de que no se salga de los límites, usando cantidadPreguntes
    if (preguntaActual < 0) {
        preguntaActual = 0;
    } else if (preguntaActual >= cantidadPreguntes) {
        preguntaActual = cantidadPreguntes - 1;
    }
    mostrarPregunta();
}
function verificarResposta(preguntaIndex, respuestaIndex) {
    const pregunta = estatDeLaPartida.preguntes[preguntaIndex];
    // Solo marcar como respondida si no lo ha sido
    if (!pregunta.feta) {
        pregunta.feta = true;
    }
    pregunta.respostaSeleccionada = pregunta.respostes[respuestaIndex];
    // Verificar si todas las preguntas están respondidas
    const todasRespondidas = estatDeLaPartida.preguntes.every(p => p.feta);
    if (todasRespondidas) {
        document.getElementById('enviarResultats').style.display = 'block'; // Mostrar botón cuando todas las preguntas están respondidas
    }
    mostrarEstatPartida();
    mostrarPregunta();
}
function navegarPregunta(direccion) {
    preguntaActual += direccion;

    // Asegurarse de que no se salga de los límites
    if (preguntaActual < 0) {
        preguntaActual = 0;
    } else if (preguntaActual >= preg.length) {
        preguntaActual = preg.length - 1;
    }
    mostrarPregunta();
}
function calcularPuntuacion() {
    let puntuacion = 0;
    estatDeLaPartida.preguntes.forEach(p => {
        // Si no hay respuesta seleccionada, se considera 0 puntos.
        if (p.respostaSeleccionada === null) {
            // Puedes decidir si quieres sumar 0 explícitamente o simplemente no incrementar la puntuación.
            return; // No incrementamos puntuación si no hay respuesta
        }
        if (p.respostaSeleccionada === p.respostaCorrecta) {
            puntuacion++;
        }
    });
    return puntuacion;
}
// boton enviar resultados
document.getElementById('enviarResultats').addEventListener('click', () => {
    enviarResultatsFuncion();
});


function enviarResultatsFuncion() {
    clearInterval(timer);

    // Calcular puntuación antes de enviar
    const puntuacion = calcularPuntuacion(); // función de puntuación

    let dadesResultats = {
        puntuacio: puntuacion, // Asegúrate de que la puntuación esté calculada correctamente
        totalPreguntes: cantidadPreguntes, // Asegúrate de usar la cantidad total de preguntas seleccionadas
        respostes: estatDeLaPartida.preguntes.map(p => ({
            idPregunta: p.id,
            respostaSeleccionada: p.respostaSeleccionada // Este será -1 si no ha sido seleccionada
        }))
    };
    
    // Enviar las respuestas a finalitzar.php
    fetch('../back/finalitza.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadesResultats)
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log('Datos recibidos:', data);
        if (data.puntuacio !== undefined && data.totalPreguntes !== undefined) {
            mostrarPuntuacio(data.puntuacio, data.totalPreguntes); // Mostrar la puntuación

            // Ocultar el contenedor del cuestionario
            document.getElementById('quizContainer').style.display = 'none';
            // Mostrar el contenedor de puntuación
            document.getElementById('puntuacionContainer').style.display = 'block';
        } else {
            console.error('Error en la respuesta del servidor', data);
        }
    })
    .catch(error => {
        console.error('Error al enviar los resultados:', error);
    });
}


function mostrarEstatPartida() {
    let estatPartida = document.getElementById('estatPartida');
    estatPartida.innerHTML = <p>Preguntas respondidas: ${estatDeLaPartida.preguntes.filter(p => p.feta).length} / ${estatDeLaPartida.preguntes.length}</p>;
}

// Función para mostrar la pantalla de inicio
function mostrarPantallaInicio() {
    document.getElementById('pantallaInicio').style.display = 'block';
    document.getElementById('quizContainer').style.display = 'none';

    // Recuperar el nombre del usuario de localStorage
    const nombreGuardado = localStorage.getItem("nombreUsuario");
    if (nombreGuardado) {
        document.getElementById('nombre').value = nombreGuardado; // Rellenar el campo de entrada con el nombre guardado
    }
}

function mostrarPuntuacio(puntuacio, totalPreguntes) {
    const puntuacionContainer = document.getElementById('puntuacionContainer');
    if (puntuacionContainer) {
        puntuacionContainer.innerHTML = 
            Tu puntuación es: ${puntuacio} de ${totalPreguntes}
            <br>
            <button id="reiniciarJuego">Reiniciar Juego</button>
        ;
        puntuacionContainer.style.display = 'block'; // Mostrar el contenedor de puntuación

        // Añadir evento al botón de reiniciar
        document.getElementById('reiniciarJuego').addEventListener('click', () => {
            reiniciarJuego(); // Llama a la función para reiniciar el juego
        });
    } else {
        console.error('Contenedor para mostrar la puntuación no encontrado.');
    }
}

// reiniciar el juego
function reiniciarJuego() {
    preguntaActual = 0; // índice pregunta
    estatDeLaPartida = { // estado partida
        contadorPreguntes: 0,
        preguntes: []
    };

    // Ocultar el botón de enviar resultados
    document.getElementById('enviarResultats').style.display = 'none';

    // Detener el temporizador si está en curso
    clearInterval(timer);
    tiempoRestante = tiempoLimite; // Reiniciar el tiempo restante

    // Ocultar contenedor de puntuación
    document.getElementById('puntuacionContainer').style.display = 'none';
    mostrarPantallaInicio(); // Mostrar la pantalla de inicio
}

// Agregar evento al botón de iniciar juego
document.getElementById('iniciarJuego').addEventListener('click', () => {
    const nombre = document.getElementById('nombre').value.trim();
    const cantidadPreguntes = parseInt(document.getElementById('cantidadPreguntas').value.trim());

    if (nombre && cantidadPreguntes > 0) {
        if (cantidadPreguntes > 20) {
            alert('Solo puedes responder un máximo de 20 preguntas. Por favor, selecciona 20 o menos.');
        } else {
            iniciarJuego(nombre, cantidadPreguntes); 
        }
    } else {
        alert('Por favor, ingresa tu nombre.'); 
    }
});


document.addEventListener('DOMContentLoaded', mostrarPantallaInicio);     