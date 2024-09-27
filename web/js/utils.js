document.addEventListener('DOMContentLoaded', () => {
  let preguntas = [];
  let estatDeLaPartida = {
    contadorPreguntes: 0,
    preguntes: []
  };

fetch('.././back/getPreguntas.php')    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);
      preguntas = data; 
      if (!Array.isArray(preguntas) || preguntas.length === 0) {
        throw new Error('No se encontraron preguntas en la respuesta.');
      }
      inicializarEstadoPartida();
      mostrarDatos(preguntas);
    })
    .catch(error => console.error('Error fetching questions:', error));

  function inicializarEstadoPartida() {
    if (preguntas.length === 0) {
      console.error('No hay preguntas disponibles para inicializar la partida.');
      return; // Sale si no hay preguntas
    }

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
    document.getElementById("enviar").addEventListener("click", async () => {
      // Generar el array de respuestas a partir del estado de la partida
      const respuestas = estatDeLaPartida.preguntes.map(p => p.resposta);
      const resultats = await enviarResultados(respuestas);
      if (resultats) {
        mostrarResultados(resultats);
      }
    });

    actualizarEstadoPartida();
  }

  // Función para enviar los resultados al servidor
  async function enviarResultados(respuestas) {
    try {
      const response = await fetch('.././back/finalitza.php', {
        method: 'POST', // Asegúrate de que sea POST
        headers: {
          'Content-Type': 'application/json' // Asegúrate de establecer el tipo de contenido
        },
        body: JSON.stringify(respuestas) // Envía las respuestas como JSON
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }

      return await response.json(); // Deberías recibir el resultado en JSON
    } catch (error) {
      console.error('Error sending results:', error);
    }
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
    const estadoPartidaElement = document.getElementById('estadoPartida'); // Verifica que este elemento existe en tu HTML
    if (estadoPartidaElement) {
      let estadoHtml = `<p>Has respost ${estatDeLaPartida.contadorPreguntes} de ${preguntas.length} preguntes</p>`;
      estadoHtml += `<ul>`;
      
      estatDeLaPartida.preguntes.forEach((pregunta, index) => {
        let estadoPregunta = pregunta.feta ? `Respondida` : `No Respondida`;
        estadoHtml += `<li>Pregunta ${index + 1}: ${estadoPregunta}</li>`;
      });

      estadoHtml += `</ul>`;
      
      estadoPartidaElement.innerHTML = estadoHtml; // Ahora solo intenta modificar el innerHTML si el elemento existe
    } else {
      console.error('El elemento estadoPartida no se encontró en el DOM.');
    }
  }

// Función para mostrar resultados
function mostrarResultados(resultats) {
  const contenedorResultados = document.getElementById('contenedor-resultados'); // Asegúrate de que este ID exista en tu HTML
  if (contenedorResultados) {
    contenedorResultados.innerHTML = `
      Total de preguntas: ${resultats.total} <br>
      Respuestas correctas: ${resultats.correctas} <br>
      Respuestas incorrectas: ${resultats.incorrectas}
    `;
  } else {
    console.error('El contenedor de resultados no se encontró en el DOM.');
  }
}

});
