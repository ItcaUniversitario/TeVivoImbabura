// ==========================================
// ARCHIVO: js/mechanics.js
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
    guardarProgresoJugador 
    // ❌ BORRADO: guardarPuntosFinales (No lo necesitamos aquí, lo usa game.js)
} from './auth.js';

// ==========================================
// 2. MÚSICA DE FONDO
// ==========================================
export function iniciarMusicaFondo() {
    if (audioManager && audioManager.playBGM) {
        audioManager.playBGM();
    }
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
    }
}

export function tirarDado() {
    const botonDado = document.getElementById('boton-dado');
    const displayDado = document.getElementById('resultado-dado-display');
    
    // ✅ ESTO ES CORRECTO: Inicia el audio con el clic del usuario
    iniciarMusicaFondo();

    if (botonDado) { botonDado.disabled = true; botonDado.innerText = 'Rodando...'; }

    const jugadorActual = getJugadorActual();
    reproducirSonidoDado();
    animarRodadoDado();

    const contenidoNivel = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado];
    setLimiteCasillas(contenidoNivel ? contenidoNivel.length - 1 : 0);

    setTimeout(() => {
        detenerAnimacionDado();
        const resultado = lanzarDado();
        renderizarDado(resultado);
        mostrarToast(`🎲 ${jugadorActual.nombre.split(" ")[0]} tiró un ${resultado}!`);

        setTimeout(() => {
            if (displayDado) displayDado.style.display = 'none';
            animarMovimiento(jugadorActual.id, resultado, gameState.limiteCasillasActual);
        }, 1000);
    }, 2000);
}


// ==========================================
// 4. MOVIMIENTO DE FICHAS
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
        ficha.style.top = `${c.top}%`;
        ficha.style.left = `${c.left}%`;

        setTimeout(() => {
            resolve(true); 
        }, 600); 
    });
}

// 👇 ANIMACIÓN CORREGIDA 👇
export async function animarMovimiento(jugadorId, pasosPendientes, limiteFinal) {
    const jugadorActual = gameState.jugadoresPartida.find(j => j.id === jugadorId);

    // --- CONDICIÓN DE PARADA ---
    if (pasosPendientes <= 0 || jugadorActual.posicion >= limiteFinal) {
        
        // A. SI LLEGÓ A LA META (VICTORIA)
        if (jugadorActual.posicion >= limiteFinal) {
            jugadorActual.posicion = limiteFinal;
            await moverFicha(jugadorId, limiteFinal); 
            
            // 🔥 CORRECCIÓN CRÍTICA AQUÍ 🔥
            // Eliminamos guardarPuntosFinales() de aquí.
            // Solo llamamos a terminarPartida(), que se encargará del flujo:
            // Premios -> Click -> Guardar -> Video
            terminarPartida(); 
            return;
        }

        // B. SI SE ACABARON LOS PASOS
        const casillaFinal = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][jugadorActual.posicion];
        
        if (casillaFinal && casillaFinal.tipo !== 'camino') {
            mostrarModalCasilla(jugadorActual.posicion);
        } else {
            ocultarModal(); 
        }
        return;
    }

    // --- DAR UN PASO ---
    const nuevaPosicion = jugadorActual.posicion + 1;
    const posAMover = Math.min(nuevaPosicion, limiteFinal);

    await moverFicha(jugadorId, posAMover);
    jugadorActual.posicion = posAMover;

    const casillaActual = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][posAMover];
    
    if (casillaActual && casillaActual.tipo === 'lugar_emblematico') {
        jugadorActual.pasosPendientes = pasosPendientes - 1;
        mostrarModalCasilla(posAMover);
        return;
    }

    await animarMovimiento(jugadorId, pasosPendientes - 1, limiteFinal);
}

// ==========================================
// 5. REANUDAR (Cerrar Modales)
// ==========================================
export function reanudarMovimiento(jugadorId) {
    const jugadorActual = gameState.jugadoresPartida.find(j => j.id === jugadorId);
    
    const modal = document.getElementById('gameModal');
    if(modal) modal.style.display = 'none'; 
    
    controlarMusicaFondo(false);
    
    if (window.actualizarInterfazPartida) window.actualizarInterfazPartida(); 

    if (jugadorActual && jugadorActual.pasosPendientes > 0) {
        const pasos = jugadorActual.pasosPendientes;
        jugadorActual.pasosPendientes = 0;
        
        setTimeout(() => {
            animarMovimiento(jugadorId, pasos, gameState.limiteCasillasActual);
        }, 300);

    } else {
        const btnDado = document.getElementById('boton-dado');
        if (btnDado) { 
            btnDado.disabled = false; 
            btnDado.innerText = 'TIRAR DADO'; 
        }
        
        if (jugadorActual) {
            guardarProgresoJugador(jugadorActual);
        }
        
        avanzarTurno();
        
        if (window.actualizarInterfazPartida) window.actualizarInterfazPartida();
    }
}