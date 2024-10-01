let preg = [];
let preguntaActual = 0; // Indica el número de la pregunta actual

// Objeto para guardar el estado de la partida
let estatDeLaPartida = {
    contadorPreguntes: 0, // Número de preguntas respondidas
    preguntes: [] // Lista de preguntas con su respuesta
};

fetch('.././back/getPreguntas.php')
    .then(respostes => {
        if (!respostes.ok) {
            throw new Error('Network response was not ok');
        }
        return respostes.json();
    })
    .then(data => {
        console.log('Respuesta recibida del servidor:', data);
        
        // Verificar si la respuesta contiene la clave 'preguntes'
        if (data.preguntes && Array.isArray(data.preguntes)) {
            preg = data.preguntes; // Acceder a la clave "preguntes"

            // Inicializar el estado de la partida con las preguntas recibidas
            for (let i = 0; i < preg.length; i++) {
                estatDeLaPartida.preguntes.push({
                    id: i, // Identificador de pregunta
                    feta: false,
                    respostaSeleccionada: null
                });
            }

            mostrarPregunta(); // Mostrar la primera pregunta
            mostrarEstatPartida(); // Mostrar el estado inicial de la partida
        } else {
            console.error('No se encontraron preguntas en la respuesta del servidor.');
            // Mostrar un mensaje adecuado al usuario
            let contenedor = document.getElementById('contenedor');
            contenedor.innerHTML = '<h3>No se encontraron preguntas disponibles.</h3>';
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        // Mostrar un mensaje adecuado al usuario
        let contenedor = document.getElementById('contenedor');
        contenedor.innerHTML = '<h3>Error al cargar las preguntas.</h3>';
    });

function mostrarPregunta() {
    let htmlString = '';

    if (preg && preg.length > 0) {
        if (preguntaActual < preg.length) {
            let pregunta = preg[preguntaActual];

            // Verificar que la pregunta tiene respuestas
            if (pregunta.respostes && Array.isArray(pregunta.respostes) && pregunta.respostes.length > 0) {
                htmlString += `<div class="question-container">`;
                htmlString += `<h3>${pregunta.pregunta}</h3>`;
                if (pregunta.imatge) { // Comprobar que existe la imagen
                    htmlString += `<img src="${pregunta.imatge}" class="img" alt="Pregunta imagen"/> <br>`;
                }
                
                // Mostrar botones de respuestas
                for (let indexR = 0; indexR < pregunta.respostes.length; indexR++) {
                    htmlString += `<button class="resposta" onclick="verificarResposta(${preguntaActual}, ${indexR})">${pregunta.respostes[indexR]}</button>`;
                }

                htmlString += `</div>`;
            } else {
                console.error('La pregunta actual no tiene respuestas disponibles.');
                htmlString += `<p>No hay respuestas disponibles para esta pregunta.</p>`;
            }
        } else {
            htmlString = `<h3>Has respondido todas las preguntas!</h3>`;
            htmlString += `<button id="enviarResultats" onclick="enviarResultats()">Enviar Resultats</button>`;
        }
    } else {
        console.error('No se encontraron preguntas o la variable preg está indefinida.');
        htmlString = '<h3>No se encontraron preguntas disponibles.</h3>';
    }

    let contenedor = document.getElementById('contenedor');
    contenedor.innerHTML = htmlString;
}

// Función para verificar la respuesta y actualizar el estado de la partida
function verificarResposta(indexP, indexR) {
    // Si la pregunta no había sido contestada antes
    if (!estatDeLaPartida.preguntes[indexP].feta) {
        // Actualizar el estado de la partida
        estatDeLaPartida.preguntes[indexP].feta = true;

        // Guardar la respuesta seleccionada
        estatDeLaPartida.preguntes[indexP].respostaSeleccionada = indexR;

        // Aumentar el contador de preguntas respondidas
        estatDeLaPartida.contadorPreguntes++;
    }

    // Mostrar estado actualizado de la partida
    mostrarEstatPartida();

    // Pasar a la siguiente pregunta
    preguntaActual++;
    mostrarPregunta(); // Mostrar la siguiente pregunta
}

// Función para mostrar el estado de la partida
function mostrarEstatPartida() {
    let estatHtml = '';

    // Mostrar cuántas preguntas se han respondido "X/10"
    estatHtml += `<p>Pregunta ${estatDeLaPartida.contadorPreguntes} / ${preg.length} </p>`;

    let estatContenedor = document.getElementById('estatPartida');
    estatContenedor.innerHTML = estatHtml;
}

// Función para enviar los resultados
function enviarResultats() {
    // Crear objeto JSON con las respuestas
    let dadesResultats = {
        respostes: [] // Guardar las respuestas
    };

    for (let i = 0; i < estatDeLaPartida.preguntes.length; i++) {
        dadesResultats.respostes.push({
            idPregunta: estatDeLaPartida.preguntes[i].id,
            respostaSeleccionada: estatDeLaPartida.preguntes[i].respostaSeleccionada
        });
    }

    // Realizar la petición fetch al servidor para enviar los resultados
    fetch('.././back/finalitza.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Definir el contenido como JSON
        },
        body: JSON.stringify(dadesResultats) // Convertir el objeto a JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();  // Recibir datos en formato JSON
    })
    .then(data => {
        // Procesar la respuesta y mostrar resultados
        let resultHtml = `<h2>Resultados del Test</h2>`;
        resultHtml += `<p>Has acertado ${data.puntuacio} de ${data.totalPreguntes} preguntas.</p>`;

        // Mostrar los resultados en el contenedor
        let contenedor = document.getElementById('contenedor');
        contenedor.innerHTML = resultHtml; 
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}
