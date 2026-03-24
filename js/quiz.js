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
                <span class="icon-estrella">⭐</span> 
                <strong>${aciertos}</strong>
            </div>
        </div>

        <div class="pregunta-card-3d">
            <h3 class="texto-pregunta">${preguntaData.pregunta}</h3>
        </div>
        
        <div class="opciones-grid">
    `;
// Generador de Botones con espacio después del paréntesis
    preguntaData.opciones.forEach((opcion, index) => {
        const letra = String.fromCharCode(65 + index); // Genera A, B, C, D
        html += `
            <button class="btn-quiz-opcion" onclick="window.responderQuiz(${index})">
                <span class="letra-opcion">${letra})&nbsp;&nbsp;</span>
                <span class="texto-opcion">${opcion}</span>
            </button>
        `;
    });

    html += `</div></div></div>`; // Cierre de los divs estructurales
    contenedor.innerHTML = html;
}

// 4. Responder (VERSIÓN ULTRA RÁPIDA ⚡)
window.responderQuiz = function(indiceElegido) {
    const preguntaData = preguntasSeleccionadas[indicePreguntaActual];
    const botones = document.querySelectorAll('.btn-quiz-opcion');
    const scoreDisplay = document.querySelector('.hud-score strong');

    // Bloquear botones para evitar doble click
    botones.forEach(b => b.disabled = true);

    // Determinar si acertó
    const esCorrecta = (indiceElegido === preguntaData.correcta);
    const textoRespuestaUsuario = preguntaData.opciones[indiceElegido];

    // --- GUARDADO EN SEGUNDO PLANO ---
    const datoParaGuardar = {
        pregunta: preguntaData.pregunta,
        respuesta_usuario: textoRespuestaUsuario,
        es_correcta: esCorrecta,
        indice_elegido: indiceElegido,
        timestamp: Date.now() 
    };
    const nombreCampoBD = (tipoQuizActual === 'inicio') ? 'quiz_inicial' : 'quiz_final';
    
    // Guardamos sin esperar (async)
    gameState.jugadoresPartida.forEach(jugador => {
        registrarRespuestaIndividual(nombreCampoBD, jugador.cedula, datoParaGuardar);
    });

    // --- FEEDBACK VISUAL ---
    if (esCorrecta) {
        botones[indiceElegido].classList.add('correcta');
        aciertos++;
        if(scoreDisplay) {
            scoreDisplay.innerText = aciertos;
            // Pequeña animación visual si tienes CSS para 'anim-score'
            scoreDisplay.parentElement.classList.add('anim-score');
        }
    } else {
        botones[indiceElegido].classList.add('incorrecta');
        
        // OPCIONAL: Si quieres que aprendan rápido, descomenta la siguiente línea para mostrar cuál era la correcta:
        // botones[preguntaData.correcta].classList.add('correcta'); 
    }

    // 🔥 VELOCIDAD MODIFICADA AQUÍ
    // 400 milisegundos = 0.4 segundos (Casi instantáneo)
    setTimeout(() => {
        indicePreguntaActual++;
        if (indicePreguntaActual < preguntasSeleccionadas.length) {
            renderizarPregunta();
        } else {
            finalizarYSalir();
        }
    }, 400); 
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