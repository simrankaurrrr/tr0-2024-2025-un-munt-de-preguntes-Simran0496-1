let preguntas = [];
let estatDeLaPartida = {
  contadorPreguntes: 0,
  preguntes: []
};
let puntuacion = 0;

// Cargar preguntas desde el servidor
fetch('../back/getPreguntas.php')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    preguntas = data; 
    inicializarEstadoPartida();
    mostrarDatos(preguntas);
  });

// Inicializar el estado de la partida
function inicializarEstadoPartida() {
  preguntas.forEach((pregunta, index) => {
    estatDeLaPartida.preguntes.push({
      id: index,
      feta: false,
      resposta: null
    });
  });
  actualizarEstadoPartida(); // Mostrar el estado inicial de la partida
}

// Mostrar las preguntas
function mostrarDatos(preguntas) {
  let htmlString = '';

  preguntas.forEach((pregunta, indexPreg) => {
    htmlString += `<div class="question-container" data-question-id="${indexPreg}">`;
    htmlString += `<h3>${pregunta.pregunta}</h3>`;

    if (pregunta.imatge) {
      htmlString += `<img src="${pregunta.imatge}" class="img-quiz" /><br>`;
    }

    pregunta.respostes.forEach((resposta, indexRes) => {
      htmlString += `<button class="respuesta" data-response-id="${indexRes}">${resposta}</button>`;
    });

    htmlString += `</div>`;
  });

  // El botón "Enviar" se oculta inicialmente con la clase "hidden"
  htmlString += `<div><button id="enviar" class="hidden">Enviar resultats</button></div>`;
  document.getElementById('partida').innerHTML = htmlString;

  // Delegación de eventos para gestionar los clics en las respuestas
  let partidaContainer = document.getElementById('partida');
  partidaContainer.addEventListener('click', e => {
    if (e.target.classList.contains('respuesta')) {
      let questionId = e.target.closest('.question-container').getAttribute('data-question-id');
      let responseId = e.target.getAttribute('data-response-id');
      toggleReaccio(parseInt(questionId), parseInt(responseId));
    }
  });

  // Evento para el botón "Enviar"
  document.getElementById("enviar").addEventListener("click", () => {
    alert("enviado");
    // Aquí puedes hacer el fetch para enviar los resultados al servidor
  });

  actualizarEstadoPartida();
}

// Función para alternar la selección/deselección de una respuesta
function toggleReaccio(indexPreg, indexRes) {
  let pregunta = estatDeLaPartida.preguntes[indexPreg];
  
  // Si ya estaba respondida y se selecciona la misma opción, desmarcar la respuesta
  if (pregunta.feta && pregunta.resposta === indexRes) {
    pregunta.feta = false;  // Desmarcar como respondida
    pregunta.resposta = null;  // Eliminar la respuesta seleccionada
    estatDeLaPartida.contadorPreguntes--;
  } else {
    // Si no estaba respondida o es otra respuesta, marcar como respondida
    if (!pregunta.feta) estatDeLaPartida.contadorPreguntes++;  // Incrementar si es la primera vez que se responde
    pregunta.feta = true;  // Marcar como respondida
    pregunta.resposta = indexRes;  // Guardar la respuesta seleccionada
  }

  // Si se han respondido todas las preguntas, mostrar el botón "Enviar resultats"
  if (estatDeLaPartida.contadorPreguntes === preguntas.length) {
    document.getElementById("enviar").classList.remove("hidden");
  } else {
    document.getElementById("enviar").classList.add("hidden");  // Ocultar si aún no se han respondido todas
  }

  actualizarEstadoPartida(); // Actualizar el estado visual de la partida
}

// Actualizar el estado de la partida
function actualizarEstadoPartida() {
  let estadoHtml = `<p>Has respost ${estatDeLaPartida.contadorPreguntes} de ${preguntas.length} preguntes</p>`;
  estadoHtml += `<ul>`;
  
  estatDeLaPartida.preguntes.forEach((pregunta, index) => {
    let estadoPregunta = pregunta.feta ? `Respondida` : `No Respondida`;
    estadoHtml += `<li>Pregunta ${index + 1}: ${estadoPregunta}</li>`;
  });

  estadoHtml += `</ul>`;
  
  document.getElementById('estadoPartida').innerHTML = estadoHtml;
}

// Actualizar el estado del marcador (Opcional, si aún quieres tener un marcador separado)
function actualizarMarcador(estadoPartida) {
  let marcadorHtml = '<table border="1"><tr><th>Pregunta</th><th>Estado</th></tr>';

  estadoPartida.forEach((estado, index) => {
    marcadorHtml += `<tr><td>${index + 1}</td><td>${estado.estado}</td></tr>`;
  });

  marcadorHtml += '</table>';
  document.getElementById('estado').innerHTML = marcadorHtml;
}
