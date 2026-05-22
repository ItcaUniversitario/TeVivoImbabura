// ==========================================
// ARCHIVO: js/quiz.js (GUARDADO EN TIEMPO REAL ⚡)
// ==========================================
import { gameState } from './state.js';
import { BANCO_PREGUNTAS_POR_NIVEL } from './data.js';
// 👇 Importamos la nueva función
import { registrarRespuestaIndividual } from './auth.js'; 

let preguntasSeleccionadas = [];
let indicePreguntaActual = 0;
let aciertos = 0;
let tipoQuizActual = 'inicio';
let callbackFinalizar = null;

// 1. Preparar preguntas
export function prepararQuizNivel(nivel) {
    const banco = BANCO_PREGUNTAS_POR_NIVEL[nivel];
    if (!banco) { preguntasSeleccionadas = []; return; }
    const mezcla = [...banco].sort(() => 0.5 - Math.random());
    preguntasSeleccionadas = mezcla.slice(0, 5);
}

// 2. Iniciar Quiz
export function iniciarQuiz(tipo, alTerminar) {
    tipoQuizActual = tipo; // 'quiz_inicial' o 'quiz_final'
    callbackFinalizar = alTerminar;
    indicePreguntaActual = 0;
    aciertos = 0;
    
    // Nota: Ya no necesitamos limpiar 'respuestasSesion' porque guardamos directo a la nube.

    const modal = document.getElementById('pantalla-quiz');
    if (modal) {
        modal.classList.add('mostrar');
        renderizarPregunta();
    } else {
        alTerminar();
    }
}

// 3. Renderizar Pregunta (Con Título Educativo 🎓)
function renderizarPregunta() {
    const preguntaData = preguntasSeleccionadas[indicePreguntaActual];
    const contenedor = document.getElementById('contenido-quiz');
    
    const tituloViejo = document.getElementById('titulo-quiz');
    if(tituloViejo) tituloViejo.style.display = 'none';

    // Textos dinámicos
    const textoFase = (tipoQuizActual === 'inicio') ? "PRE-QUIZ" : "POST-QUIZ";
    
    // 🔥 EL NUEVO SUBTÍTULO EDUCATIVO
    const textoSubtitulo = (tipoQuizActual === 'inicio') 
        ? "Responde este breve cuestionario con fines educativos para conocer tu nivel inicial." 
        : "¡Veamos qué tanto aprendiste en tu aventura! Cuestionario educativo final.";

    const total = preguntasSeleccionadas.length;
    const porcentajeProgreso = ((indicePreguntaActual) / total) * 100; 

    let html = `
        <div class="quiz-progreso-bg">
            <div class="quiz-progreso-fill" style="width: ${porcentajeProgreso}%"></div>
        </div>

        <div class="quiz-cabecera" style="text-align: center; margin-bottom: 20px;">
            <h2 class="quiz-titulo">${textoFase}</h2>
            <p class="quiz-subtitulo">${textoSubtitulo}</p>
        </div>

        <div class="quiz-hud">
            <div class="badge-fase">
                <span class="icon-fase">🏔️</span> 
                <span class="texto-fase">Pregunta <strong>${indicePreguntaActual + 1}/${total}</strong></span>
            </div>
            <div class="badge-score">
                <span class="icon-estrella">Correctas⭐</span> 
                <strong>${aciertos}</strong>
            </div>
        </div>

        <div class="pregunta-card-3d">
            <h3 class="texto-pregunta">${preguntaData.pregunta}</h3>
        </div>
        
        <div class="opciones-grid">
    `;
// --- NUEVA LÓGICA PARA MEZCLAR OPCIONES ---
// 1. Creamos un array de objetos vinculando el texto con su índice original
let opcionesMezcladas = preguntaData.opciones.map((texto, indiceOriginal) => {
    return { texto: texto, indiceOriginal: indiceOriginal };
});

// 2. Mezclamos las opciones aleatoriamente
opcionesMezcladas.sort(() => 0.5 - Math.random());

// 3. Generamos los botones con la nueva distribución
opcionesMezcladas.forEach((opcionObj, indexRenderizado) => {
    const letra = String.fromCharCode(65 + indexRenderizado); // Genera A, B, C, D
    
    // 🔥 ATENCIÓN AQUÍ: Pasamos DOS parámetros a responderQuiz:
    // El indexRenderizado (para colorear el botón correcto en la interfaz)
    // El indiceOriginal (para saber si acertó según la base de datos)
    html += `
        <button class="btn-quiz-opcion" onclick="window.responderQuiz(${indexRenderizado}, ${opcionObj.indiceOriginal})">
            <span class="letra-opcion">${letra})&nbsp;&nbsp;</span>
            <span class="texto-opcion">${opcionObj.texto}</span>
        </button>
    `;
});

html += `</div></div></div>`; // Cierre de los divs estructurales
contenedor.innerHTML = html;
}
// 4. Responder (VERSIÓN ULTRA RÁPIDA ⚡, ALEATORIA 🔀 Y CON SONIDO 🎵)
window.responderQuiz = function(indiceBotonClickeado, indiceRealBD) {
    const preguntaData = preguntasSeleccionadas[indicePreguntaActual];
    const botones = document.querySelectorAll('.btn-quiz-opcion');
    const scoreDisplay = document.querySelector('.hud-score strong');

    // Bloquear botones para evitar doble click
    botones.forEach(b => b.disabled = true);

    // Determinar si acertó usando el índice original de la Base de Datos
    const esCorrecta = (indiceRealBD === preguntaData.correcta);
    const textoRespuestaUsuario = preguntaData.opciones[indiceRealBD];

    // --- GUARDADO EN SEGUNDO PLANO ---
    const datoParaGuardar = {
        pregunta: preguntaData.pregunta,
        respuesta_usuario: textoRespuestaUsuario,
        es_correcta: esCorrecta,
        indice_elegido: indiceRealBD, // Guardamos el real para estadísticas precisas
        timestamp: Date.now() 
    };
    const nombreCampoBD = (tipoQuizActual === 'inicio') ? 'quiz_inicial' : 'quiz_final';
    
    // Guardamos sin esperar (async)
    gameState.jugadoresPartida.forEach(jugador => {
        registrarRespuestaIndividual(nombreCampoBD, jugador.cedula, datoParaGuardar);
    });

    // --- FEEDBACK VISUAL Y SONORO ---
    if (esCorrecta) {
        botones[indiceBotonClickeado].classList.add('correcta');
        aciertos++;
        if(scoreDisplay) {
            scoreDisplay.innerText = aciertos;
            scoreDisplay.parentElement.classList.add('anim-score');
        }
        
        // 🎵 NUEVO: Reproducir sonido de éxito
        if (typeof window.playSound === 'function') {
            window.playSound('success');
        }
        
    } else {
        botones[indiceBotonClickeado].classList.add('incorrecta');
        
        // Mostrar la correcta SOLO en el POST-QUIZ (quiz final)
        if (tipoQuizActual !== 'inicio') {
            const botonCorrecto = Array.from(botones).find(btn => btn.getAttribute('onclick').includes(`, ${preguntaData.correcta})`));
            if(botonCorrecto) botonCorrecto.classList.add('correcta');
        }
        
        // 🎵 NUEVO: Reproducir sonido de error
        if (typeof window.playSound === 'function') {
            window.playSound('error');
        }
    }

    // 🔥 TIEMPO DINÁMICO: Si se equivocó en el quiz final, le damos 2 segundos para leer la correcta.
    // Si no (quiz inicial o si respondió bien), mantenemos tus 400ms ultra rápidos.
    const tiempoEspera = (!esCorrecta && tipoQuizActual !== 'inicio') ? 2000 : 400;

    setTimeout(() => {
        indicePreguntaActual++;
        if (indicePreguntaActual < preguntasSeleccionadas.length) {
            renderizarPregunta();
        } else {
            finalizarYSalir();
        }
    }, tiempoEspera); 
};
// 5. Finalizar (Ya no guarda en lote, solo cierra)
function finalizarYSalir() {
    if (tipoQuizActual === 'inicio') gameState.scorePreTest = aciertos;
    else gameState.scorePostTest = aciertos;

    console.log("✅ Quiz completado. Cerrando...");
    window.cerrarQuiz();
}

// 6. Cerrar Modal
window.cerrarQuiz = function() {
    const modal = document.getElementById('pantalla-quiz');
    if (modal) modal.classList.remove('mostrar');
    if (callbackFinalizar) callbackFinalizar();
};