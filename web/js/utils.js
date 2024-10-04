let preg = [];
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
    console.log(`Iniciando juego para: ${nombre} con ${cantPreg} preguntas`);

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
            console.log('Preguntas cargadas:', data);
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
    document.getElementById('temporizador').innerText = `Tiempo restante: ${tiempoRestante} segundos`;
    timer = setInterval(() => {
        tiempoRestante--;
        document.getElementById('temporizador').innerText = `Tiempo restante: ${tiempoRestante} segundos`;

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
                htmlString += `<div class="question-container">`;
                htmlString += `<h3>${pregunta.pregunta}</h3>`;
                if (pregunta.imatge) {
                    htmlString += `<img src="${pregunta.imatge}" class="img" alt="Pregunta imagen"/> <br>`;
                }

                for (let indexR = 0; indexR < pregunta.respostes.length; indexR++) {
                    const selectedClass = estatDeLaPartida.preguntes[preguntaActual].respostaSeleccionada === pregunta.respostes[indexR] ? 'selected' : '';
                    htmlString += `<button class="resposta ${selectedClass}" onclick="verificarResposta(${preguntaActual}, ${indexR})">${pregunta.respostes[indexR]}</button>`;
                }

                htmlString += `</div>`;
            } else {
                console.error('La pregunta actual no tiene respuestas disponibles.');
                htmlString += `<p>No hay respuestas disponibles para esta pregunta.</p>`;
            }

            let contenedor = document.getElementById('contenedor');
            if (contenedor) {
                contenedor.innerHTML = htmlString;
            } else {
                console.error('Contenedor de preguntas no encontrado.');
            }

            // Manejo de la navegación, usando cantidadPreguntes en lugar de preg.length
            let navigationHtml = `
                <div class="navigation">
                    <button id="anterior" onclick="navegarPregunta(-1)" ${preguntaActual === 0 ? 'style="display:none;"' : ''}>Anterior</button>
                    <button id="siguiente" onclick="navegarPregunta(1)" ${preguntaActual === cantidadPreguntes - 1 ? 'style="display:none;"' : ''}>Siguiente</button>
                </div>
            `;

            // Actualiza el contenedor con la navegación
            contenedor.innerHTML += navigationHtml;
        } else {
            const todasRespondidas = estatDeLaPartida.preguntes.every(p => p.feta);

            if (todasRespondidas) {
                document.getElementById('enviarResultats').style.display = 'block'; // Mostrar botón cuando todas las preguntas están respondidas
            }

            let contenedor = document.getElementById('contenedor');
            if (contenedor) {
                contenedor.innerHTML = `<h3>Has respondido todas las preguntas!</h3>`;
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
    estatPartida.innerHTML = `<p>Preguntas respondidas: ${estatDeLaPartida.preguntes.filter(p => p.feta).length} / ${estatDeLaPartida.preguntes.length}</p>`;
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
        puntuacionContainer.innerHTML = `
            Tu puntuación es: ${puntuacio} de ${totalPreguntes}
            <br>
            <button id="reiniciarJuego">Reiniciar Juego</button>
        `;
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
        iniciarJuego(nombre, cantidadPreguntes);
    } else {
        alert('Por favor, ingresa tu nombre y una cantidad válida de preguntas.'); // Alertar si no se ingresa un nombre o cantidad
    }
});

// Inicializar la pantalla de inicio al cargar el documento
document.addEventListener('DOMContentLoaded', mostrarPantallaInicio);
