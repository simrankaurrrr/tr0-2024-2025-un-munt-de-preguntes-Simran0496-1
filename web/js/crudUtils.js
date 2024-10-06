document.addEventListener('DOMContentLoaded', cargarPreguntas);

function cargarPreguntas() {
    fetch('.././crudBack/getPreguntasCrud.php')
        .then(response => response.json())
        .then(data => {
            const tabla = document.querySelector('#tablaPreguntas tbody');
            tabla.innerHTML = '';

            data.forEach(pregunta => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${pregunta.pregunta}</td>
                    <td><img src="${pregunta.imatge}" alt="Imagen" width="50"></td>
                    <td>${pregunta.respostes.join('<br>')}</td>
                    <td>${pregunta.respostaCorrecta}</td>
                    <td>
                        <button class="button" onclick="editarPregunta(${pregunta.id})">Editar</button>
                        <button class="button red" onclick="borrarPregunta(${pregunta.id})">Borrar</button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(error => console.error('Error al cargar las preguntas:', error));
}

function mostrarFormularioAgregar() {
    document.getElementById('formularioPregunta').classList.remove('hidden');
    document.getElementById('tituloFormulario').innerText = 'Agregar Pregunta';
    document.getElementById('formPregunta').reset();
}

function guardarPregunta(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const id = formData.get('preguntaId');

    const url = id ? '.././crudBack/updatePregunta.php' : '.././crudBack/addPregunta.php';
    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(() => {
            cargarPreguntas();
            mostrarNotificacion(id ? 'Pregunta editada correctamente.' : 'Pregunta agregada correctamente.');
            cancelarEdicion();
        })
        .catch(error => {
            console.error('Error al guardar la pregunta:', error);
            mostrarNotificacion('Error al guardar la pregunta.', true);
        });
}

function editarPregunta(id) {
    fetch(`.././crudBack/getPreguntasCrud.php?id=${id}`)
    .then(response => {
        if (!response.ok) { // Verifica si la respuesta no es 2xx
            throw new Error('Error en la red');
        }
        return response.json();
    })
    .then(data => {
            if (data.length > 0) {
                const pregunta = data[0]; // Obtener la primera pregunta
                document.getElementById('formularioPregunta').classList.remove('hidden');
                document.getElementById('tituloFormulario').innerText = 'Editar Pregunta';
                document.getElementById('preguntaId').value = pregunta.id;
                document.getElementById('pregunta').value = pregunta.pregunta;
                document.getElementById('imagen').value = pregunta.imatge;
                document.getElementById('opciones').value = pregunta.respostes.join(', ');
                document.getElementById('respuestaCorrecta').value = pregunta.respostaCorrecta;
            }
        })
        .catch(error => {
            console.error('Error al cargar la pregunta:', error);
            mostrarNotificacion('Error al cargar la pregunta.', true);
        });
}

function cancelarEdicion() {
    document.getElementById('formularioPregunta').classList.add('hidden');
    document.getElementById('formPregunta').reset();
}

function borrarPregunta(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
        fetch(`.././crudBack/deletePregunta.php?id=${id}`)
            .then(response => response.json())
            .then(() => {
                cargarPreguntas();
                mostrarNotificacion('Pregunta eliminada correctamente.');
            })
            .catch(error => {
                console.error('Error al eliminar la pregunta:', error);
                mostrarNotificacion('Error al eliminar la pregunta.', true);
            });
    }
}

function mostrarNotificacion(mensaje, error = false) {
    const notification = document.getElementById('notification');
    notification.innerText = mensaje;
    notification.classList.remove('hidden');
    if (error) {
        notification.style.backgroundColor = '#dc3545'; // Rojo para errores
    } else {
        notification.style.backgroundColor = '#28a745'; // Verde para éxito
    }

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000); // Ocultar la notificación después de 3 segundos
}
