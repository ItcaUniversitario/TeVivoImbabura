// ==========================================
// 1. IMPORTACIONES
// ==========================================
import { gameState, setLimiteCasillas, getJugadorActual, avanzarTurno } from './state.js';
import { CONTENIDO_CASILLAS_POR_NIVEL, MAPA_COORDENADAS_POR_NIVEL, ROTACIONES_FINAL } from './data.js';
import { mostrarToast } from './ui.js';
import { audioManager } from './audioManager.js';

// Funciones visuales y de juego
import { 
    mostrarModalCasilla, 
    ocultarModal, 
    actualizarInterfazPartida, 
    terminarPartida 
} from './game.js';

// Base de datos
import { 
    guardarProgresoJugador, 
    guardarPuntosFinales 
} from './auth.js';

// ==========================================
// 2. MÚSICA DE FONDO
// ==========================================
export function iniciarMusicaFondo() {
    audioManager.playBGM();
}

export function controlarMusicaFondo(pausar) {
    if (pausar) {
        audioManager.pauseBGM();
    } else {
        audioManager.playBGM();
    }
}

// ==========================================
// 3. DADO (LÓGICA Y ANIMACIÓN)
// ==========================================
function lanzarDado() { return Math.floor(Math.random() * 6) + 1; }

function animarRodadoDado() {
    const display = document.getElementById('resultado-dado-display');
    if (!display) return;
    display.style.display = 'block';
    display.innerHTML = `
        <div id="dado-cubo" class="rodando">
            <div class="cara cara-1"><img src="assets/dado/dado1.png" alt="Cara 1"></div>
            <div class="cara cara-2"><img src="assets/dado/dado2.png" alt="Cara 2"></div>
            <div class="cara cara-3"><img src="assets/dado/dado3.png" alt="Cara 3"></div>
            <div class="cara cara-4"><img src="assets/dado/dado4.png" alt="Cara 4"></div>
            <div class="cara cara-5"><img src="assets/dado/dado5.png" alt="Cara 5"></div>
            <div class="cara cara-6"><img src="assets/dado/dado6.png" alt="Cara 6"></div>
        </div>`;
}

function detenerAnimacionDado() {
    if (gameState.intervaloAnimacionDado) clearInterval(gameState.intervaloAnimacionDado);
}

function renderizarDado(resultado) {
    const cubo = document.getElementById('dado-cubo');
    if (cubo) {
        cubo.classList.remove('rodando');
        const rotacionBase = ROTACIONES_FINAL[resultado];
        cubo.style.transform = rotacionBase; 
    }
}

function reproducirSonidoDado() {
    if(audioManager && audioManager.playSFX) {
        audioManager.playSFX('assets/audio/sonido_dado.mp3');
    } else {
        const audio = new Audio('assets/audio/sonido_dado.mp3');
        audio.play().catch(e => { });
    }
}

export function tirarDado() {
    const botonDado = document.getElementById('boton-dado');
    const displayDado = document.getElementById('resultado-dado-display');
    iniciarMusicaFondo();

    if (botonDado) { botonDado.disabled = true; botonDado.innerText = 'Rodando...'; }

    const jugadorActual = getJugadorActual();
    reproducirSonidoDado();
    animarRodadoDado();

    // Calcular límite del nivel actual
    const contenidoNivel = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado];
    setLimiteCasillas(contenidoNivel ? contenidoNivel.length - 1 : 0);

    setTimeout(() => {
        detenerAnimacionDado();
        const resultado = lanzarDado();
        renderizarDado(resultado);
        mostrarToast(`🎲 ${jugadorActual.nombre.split(" ")[0]} tiró un ${resultado}!`);

        setTimeout(() => {
            if (displayDado) displayDado.style.display = 'none';
            // Llamamos a la animación de movimiento
            animarMovimiento(jugadorActual.id, resultado, gameState.limiteCasillasActual);
        }, 1000);
    }, 2000);
}


// ==========================================
// 4. MOVIMIENTO DE FICHAS (AQUÍ ESTÁ LA MAGIA)
// ==========================================

export function crearFichasEnMapa() {
    const contenedorFichas = document.getElementById('contenedor-fichas');
    contenedorFichas.innerHTML = '';
    const coords = MAPA_COORDENADAS_POR_NIVEL[gameState.nivelSeleccionado];
    if (!coords || coords.length === 0) return;
    const inicio = coords[0];

    gameState.jugadoresPartida.forEach((jugador) => {
        const fichaImg = document.createElement('img');
        fichaImg.id = `ficha-jugador-${jugador.id}`;
        fichaImg.className = 'ficha-juego';
        fichaImg.src = `assets/fichas/ficha_${jugador.fichaId}.png`;
        fichaImg.style.top = `${inicio.top}%`;
        fichaImg.style.left = `${inicio.left}%`;
        contenedorFichas.appendChild(fichaImg);
    });
}

export function moverFicha(jugadorId, nuevaCasillaIndex) {
    return new Promise((resolve) => {
        const ficha = document.getElementById(`ficha-jugador-${jugadorId}`);
        const coords = MAPA_COORDENADAS_POR_NIVEL[gameState.nivelSeleccionado];

        if (!ficha || !coords || nuevaCasillaIndex >= coords.length) {
            console.error("❌ Error moviendo ficha: Ficha o coordenadas no encontradas.");
            resolve(); 
            return;
        }

        const c = coords[nuevaCasillaIndex];

        // 1. Aplicamos el movimiento visual
        ficha.style.top = `${c.top}%`;
        ficha.style.left = `${c.left}%`;

        // 2. ⏳ ESPERAMOS que termine la transición CSS (0.5s en CSS -> esperamos 600ms)
        setTimeout(() => {
            resolve(true); // ¡Listo! La ficha llegó visualmente.
        }, 600); 
    });
}

// 👇 FUNCIÓN CONVERTIDA A ASYNC PARA ESPERAR PASOS 👇
export async function animarMovimiento(jugadorId, pasosPendientes, limiteFinal) {
    const jugadorActual = gameState.jugadoresPartida.find(j => j.id === jugadorId);

    // --- CONDICIÓN DE PARADA (Se acabaron los pasos o llegó al final) ---
    if (pasosPendientes <= 0 || jugadorActual.posicion >= limiteFinal) {
        
        // A. SI LLEGÓ A LA META (VICTORIA)
        if (jugadorActual.posicion >= limiteFinal) {
            // Aseguramos que visualmente esté en la meta
            jugadorActual.posicion = limiteFinal;
            await moverFicha(jugadorId, limiteFinal); 
            
            guardarPuntosFinales(); 
            terminarPartida();
            return;
        }

        // B. SI SE ACABARON LOS PASOS (FIN DEL TURNO NORMAL)
        const casillaFinal = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][jugadorActual.posicion];
        
        // Solo abrimos modal si NO es un camino vacío
        if (casillaFinal && casillaFinal.tipo !== 'camino') {
            mostrarModalCasilla(jugadorActual.posicion);
        } else {
            // Si cayó en camino vacío, terminamos turno directo
            ocultarModal(); // Esto dispara avanzarTurno internamente en tu game.js
        }
        return;
    }

    // --- LOGICA DE DAR UN PASO ---
    const nuevaPosicion = jugadorActual.posicion + 1;
    const posAMover = Math.min(nuevaPosicion, limiteFinal);

    // 🛑 AWAIT IMPORTANTE: El código se detiene aquí hasta que la ficha llegue (600ms)
    await moverFicha(jugadorId, posAMover);
    
    // Actualizamos posición lógica una vez que llegó visualmente
    jugadorActual.posicion = posAMover;

    // --- VERIFICAR PARADA OBLIGATORIA (Lugares Emblemáticos) ---
    // Si pasamos por un lugar emblemático, nos detenemos AUNQUE queden pasos.
    const casillaActual = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][posAMover];
    
    if (casillaActual && casillaActual.tipo === 'lugar_emblematico') {
        // Guardamos los pasos que nos sobraron para después
        jugadorActual.pasosPendientes = pasosPendientes - 1;
        
        // Mostramos el modal (la ficha YA llegó gracias al await de arriba)
        mostrarModalCasilla(posAMover);
        return; // Cortamos la recursión aquí
    }

    // --- SIGUIENTE PASO (Recursividad) ---
    // Llamamos al siguiente paso. Como ya esperamos en moverFicha, no hace falta otro setTimeout largo.
    await animarMovimiento(jugadorId, pasosPendientes - 1, limiteFinal);
}

// En js/mechanics.js

// En js/mechanics.js

export function reanudarMovimiento(jugadorId) {
    const jugadorActual = gameState.jugadoresPartida.find(j => j.id === jugadorId);
    
    // 1. Ocultar el modal visualmente
    const modal = document.getElementById('gameModal');
    if(modal) modal.style.display = 'none'; 
    
    controlarMusicaFondo(false);

    // 🔥 CAMBIO CLAVE: ACTUALIZAR EL SCORE AHORA MISMO
    // No importa si el turno terminó o si sigue caminando.
    // Al cerrar la ventana, el usuario debe ver lo que ganó en ese lugar.
    actualizarInterfazPartida(); 

    // 2. Decidir si sigue caminando o termina el turno
    if (jugadorActual && jugadorActual.pasosPendientes > 0) {
        
        // --- SIGUE CAMINANDO ---
        const pasos = jugadorActual.pasosPendientes;
        jugadorActual.pasosPendientes = 0;
        
        // Pequeño delay para que no sea tan brusco el arranque
        setTimeout(() => {
            animarMovimiento(jugadorId, pasos, gameState.limiteCasillasActual);
        }, 300);

    } else {
        
        // --- FIN DEL TURNO ---
        const btnDado = document.getElementById('boton-dado');
        if (btnDado) { 
            btnDado.disabled = false; 
            btnDado.innerText = 'TIRAR DADO'; 
        }
        
        if (jugadorActual) {
            guardarProgresoJugador(jugadorActual);
        }
        
        avanzarTurno();
        
        // Volvemos a actualizar por si cambió el turno visualmente
        actualizarInterfazPartida();
    }
}