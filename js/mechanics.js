// ==========================================
// ARCHIVO: js/mechanics.js
// ==========================================
import { gameState, setLimiteCasillas, getJugadorActual, avanzarTurno } from './state.js';
import { CONTENIDO_CASILLAS_POR_NIVEL, MAPA_COORDENADAS_POR_NIVEL } from './data.js'; // Borré ROTACIONES_FINAL, ya no se usa
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
import { guardarProgresoJugador } from './auth.js';

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
/* ======================================================= */
/* ℹ️ FUNCIÓN DE AYUDA (CON ENLACE A DRIVE)                */
/* ======================================================= */
window.mostrarInformacionJuego = function () {

    // 👇 TU ENLACE DE GOOGLE DRIVE ACTUALIZADO
    const rutaDocumento = 'https://drive.google.com/file/d/1BjembnQW9n4VYjPkccUBRvfVKhcgqf5r/view?usp=drive_link';

    const modal = document.getElementById('gameModal');

    // Elementos
    const modalTitle = modal ? (modal.querySelector('h2') || document.getElementById('modalTitle')) : null;
    const modalDesc = modal ? (modal.querySelector('p') || document.getElementById('modalDescription')) : null;
    const modalImg = modal ? (modal.querySelector('img') || document.getElementById('modalImage')) : null;
    const videoContainer = document.getElementById('videoContainer');
    const modalButtons = document.getElementById('modalButtons');
    const modalOptions = document.getElementById('modalOptionsContainer');

    if (!modal) return;

    // 1. TÍTULO
    if (modalTitle) {
        modalTitle.innerHTML = '<span class="titulo-guia">🗺️ RUTA DE JUEGO</span>';
    }

    // 2. CONTENIDO
    if (modalDesc) {
        modalDesc.innerHTML = `
            <div class="guia-contenido">
                <ul class="guia-lista-pasos">
                    <li class="guia-paso">
                        <span class="paso-icono">📝</span> <strong>1. Registro de Jugadores</strong>
                    </li>
                    <li class="guia-paso">
                        <span class="paso-icono">📊</span> <strong>2. Selección de Nivel</strong>
                    </li>
                    <li class="guia-paso">
                        <span class="paso-icono">👤</span> <strong>3. Selección de Ficha</strong>
                    </li>
                    <li class="guia-paso">
                        <span class="paso-icono">🧠</span> <strong>4. Quiz Inicial</strong>
                    </li>
                    <li class="guia-paso">
                        <span class="paso-icono">🎲</span> <strong>5. Mapa y Meta</strong>
                    </li>
                    <li class="guia-paso">
                        <span class="paso-icono">🎓</span> <strong>6. Quiz Final</strong>
                    </li>
                </ul>

                <div class="guia-footer-link">
                    <a href="${rutaDocumento}" target="_blank" class="btn-ver-reglas">
                        📄 Ver reglas completas
                    </a>
                </div>
            </div>
        `;
    }

    // 3. LIMPIEZA
    if (modalImg) modalImg.style.display = 'none';
    if (videoContainer) videoContainer.style.display = 'none';
    if (modalOptions) modalOptions.innerHTML = '';

    // 4. BOTÓN CERRAR
    if (modalButtons) {
        modalButtons.innerHTML = `
            <button class="btn-imbabura" onclick="document.getElementById('gameModal').style.display='none'">
                OK
            </button>
        `;
    }

    modal.style.display = 'flex';
}
// ======================================================
// 3. 🎲 LÓGICA DE DADOS (HUD PERMANENTE & 3D)
// ======================================================

function reproducirSonidoDado() {
    if (audioManager && audioManager.playSFX) {
        const sonido = audioManager.playSFX('assets/audio/sonido_dado.mp3');

        // 🔥 SINCRONIZACIÓN DE AUDIO:
        // Si el gestor de audio devuelve el objeto (y tiene .pause), 
        // lo detenemos a los 500ms para que coincida con el frenado visual.
        if (sonido && typeof sonido.pause === 'function') {
            setTimeout(() => {
                sonido.pause();
                if (sonido.currentTime) sonido.currentTime = 0; // Resetear
            }, 500); // Mismo tiempo que el giro visual
        }
    }
}
// 🔥 FUNCIÓN PRINCIPAL: TIRAR DADO (VERSIÓN ACELERADA ⚡)
export function tirarDado() {
    const botonDado = document.getElementById('boton-dado');
    const cubo1 = document.getElementById('dado-3d-1');
    const cubo2 = document.getElementById('dado-3d-2');

    iniciarMusicaFondo();

    const jugadorActual = getJugadorActual();

    // =========================================================
    // 🚂 CANDADO DEL TREN: SI ESTÁ ATRAPADO, NO PUEDE LANZAR
    // =========================================================
    if (jugadorActual.bloqueado_tren) {

        if (typeof mostrarToast === 'function') {
            mostrarToast("¡Aún no tienes tu boleto! Responde la trivia para avanzar.", "warning");
        }

        // En lugar de lanzar el dado, abrimos la casilla de la estación de nuevo
        mostrarModalCasilla(jugadorActual.posicion);

        return; // 🔥 IMPORTANTE: Este return frena la función para que el dado NO ruede
    }
    // =========================================================

    // Si no está bloqueado, el código sigue normal:
    if (botonDado) {
        botonDado.disabled = true;
        botonDado.innerText = '...';
    }

    // Reproducimos sonido (y se auto-corta a los 500ms gracias a la función de arriba)
    reproducirSonidoDado();

    // 1. ANIMACIÓN: ¡A GIRAR!
    if (cubo1) {
        cubo1.style.transform = 'none';
        void cubo1.offsetWidth;
        cubo1.classList.add('rodando');
    }
    if (cubo2) {
        cubo2.style.transform = 'none';
        void cubo2.offsetWidth;
        cubo2.classList.add('rodando');
    }

    const contenidoNivel = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado];
    setLimiteCasillas(contenidoNivel ? contenidoNivel.length - 1 : 0);

    // 2. ⚡ TIEMPO DE GIRO: 500ms (Medio segundo exacto)
    setTimeout(() => {
        const valor1 = Math.floor(Math.random() * 6) + 1;
        const valor2 = Math.floor(Math.random() * 6) + 1;
        const total = valor1 + valor2;

        // 3. DETENER Y POSICIONAR (Visualmente se clava aquí)
        if (cubo1) {
            cubo1.classList.remove('rodando');
            posicionarCara3D(cubo1, valor1);
        }
        if (cubo2) {
            cubo2.classList.remove('rodando');
            posicionarCara3D(cubo2, valor2);
        }

        // 4. TEXTO RESULTADO
        mostrarTextoResultado(total);

        // 5. ⚡ PAUSA LECTURA: 600ms
        // (Tiempo suficiente para ver el número antes de que la ficha corra)
        setTimeout(() => {
            animarMovimiento(jugadorActual.id, total, gameState.limiteCasillasActual);
        }, 600);

    }, 500); // Fin del giro del dado (Coincide con el corte de audio)
}
// 🔥 FUNCIÓN AUXILIAR: POSICIONAR CARA (ÁNGULO SUAVE -10°)
function posicionarCara3D(elemento, valor) {
    let x = 0, y = 0;

    // Ángulos base para ver cada número de frente
    switch (valor) {
        case 1: x = 0; y = 0; break;
        case 2: x = 0; y = -90; break;
        case 3: x = 0; y = -180; break;
        case 4: x = 0; y = 90; break;
        case 5: x = -90; y = 0; break;
        case 6: x = 90; y = 0; break;
    }

    // INCLINACIÓN VISUAL: -10 grados para que se vea 3D pero legible
    const inclinacionX = -10;
    const inclinacionY = -10;

    // VUELTAS EXTRA (Para frenado suave)
    const vueltasX = (Math.floor(Math.random() * 3) + 3) * 360;
    const vueltasY = (Math.floor(Math.random() * 3) + 3) * 360;

    // Aplicar Transformación
    const rotacionFinalX = x + inclinacionX + vueltasX;
    const rotacionFinalY = y + inclinacionY + vueltasY;

    elemento.style.transform = `rotateX(${rotacionFinalX}deg) rotateY(${rotacionFinalY}deg)`;
}

// 🔤 CONVERTIR NÚMERO A TEXTO (Para el display central)
function obtenerNumeroEnLetras(num) {
    const nombres = {
        2: "DOS", 3: "TRES", 4: "CUATRO", 5: "CINCO",
        6: "SEIS", 7: "SIETE", 8: "OCHO", 9: "NUEVE",
        10: "DIEZ", 11: "ONCE", 12: "DOCE"
    };
    return nombres[num] || num.toString();
}

// 🅰️ MOSTRAR TEXTO FLOTANTE EN EL DOM
function mostrarTextoResultado(numero) {
    // Buscamos el contenedor del mapa (o el body si prefieres)
    const contenedor = document.getElementById('contenedor-mapa') || document.body;

    const textoLetras = obtenerNumeroEnLetras(numero);

    // Crear elemento
    const divTexto = document.createElement('div');
    divTexto.className = 'resultado-texto-letras';
    divTexto.innerText = textoLetras; // Ej: "OCHO"

    contenedor.appendChild(divTexto);

    // Borrarlo automáticamente
    // ⏱️ AJUSTE DE TIEMPO:
    // La ficha se mueve a los 600ms. 
    // Ponemos 800ms para que el texto acompañe el inicio del movimiento y luego desaparezca.
    setTimeout(() => {
        if (divTexto) divTexto.remove();
    }, 800); // Antes 1200ms -> Ahora 800ms (Mucho más rápido)
}

// ==========================================
// 4. MOVIMIENTO DE FICHAS
// ==========================================

export function crearFichasEnMapa() {
    const contenedorFichas = document.getElementById('contenedor-fichas');
    contenedorFichas.innerHTML = '';

    const coords = MAPA_COORDENADAS_POR_NIVEL[gameState.nivelSeleccionado];
    if (!coords || coords.length === 0) return;

    // Posición inicial por defecto (Casilla 0)
    const inicio = coords[0];

    gameState.jugadoresPartida.forEach((jugador) => {
        const contenedor = document.createElement('div');
        contenedor.id = `ficha-jugador-${jugador.id}`;
        contenedor.className = 'ficha-contenedor';

        // Si el jugador ya tiene una posición guardada, la usamos. Si no, va a la 0.
        const posicionJugador = coords[jugador.posicion] || inicio;

        contenedor.style.top = `${posicionJugador.top}%`;
        contenedor.style.left = `${posicionJugador.left}%`;

        const etiqueta = document.createElement('span');
        etiqueta.className = 'etiqueta-nombre';
        etiqueta.innerText = jugador.nombre.split(" ")[0];

        const img = document.createElement('img');
        img.className = 'ficha-imagen-dentro';
        img.src = `assets/imagenes/fichas/ficha_${jugador.fichaId}.png`;
        img.alt = `Ficha de ${jugador.nombre}`;

        contenedor.appendChild(etiqueta);
        contenedor.appendChild(img);

        contenedorFichas.appendChild(contenedor);
    });

    // 🔥 RESTRICCIÓN APLICADA: LA CÁMARA SOLO SE MUEVE EN NIVEL 3 Y 4
    if (gameState.nivelSeleccionado === 3 || gameState.nivelSeleccionado === 4) {
        setTimeout(() => {
            const tablero = document.getElementById('tablero-visual-juego');

            if (tablero) {
                // Buscamos al jugador que tiene el turno para enfocar la cámara en él
                const jugadorActual = getJugadorActual();
                const posCamara = coords[jugadorActual ? jugadorActual.posicion : 0] || inicio;

                const pixelX = (posCamara.left / 100) * tablero.offsetWidth;
                actualizarCamaraHorizontal(pixelX);
            }
        }, 100);
    }
}

export function moverFicha(jugadorId, nuevaCasillaIndex) {
    return new Promise(async (resolve) => { // <--- Nota: añadí 'async' aquí para poder esperar al túnel
        const ficha = document.getElementById(`ficha-jugador-${jugadorId}`);

        // Obtenemos las coordenadas del nivel actual
        const coords = MAPA_COORDENADAS_POR_NIVEL[gameState.nivelSeleccionado];

        if (!ficha || !coords || nuevaCasillaIndex >= coords.length) {
            console.error("❌ Error moviendo ficha");
            resolve();
            return;
        }

        const c = coords[nuevaCasillaIndex];

        // -------------------------------------------------------------
        // 🚇 LÓGICA TÚNEL (SOLO NIVEL 3)
        // -------------------------------------------------------------
        if (gameState.nivelSeleccionado === 3 && (nuevaCasillaIndex === 9 || nuevaCasillaIndex === 24)) {

            // 1. Calculamos posición de cámara
            const tablero = document.getElementById('tablero-visual-juego');
            let pixelCamara = 0;
            if (tablero) pixelCamara = (c.left / 100) * tablero.offsetWidth;


            let mensajeTunel = "";

            if (nuevaCasillaIndex === 9) {
                // TÚNEL 1: Hacia Cascada Conrayaro
                // Usamos la ESPIRAL (🌀) que representa un portal o atajo rápido
                mensajeTunel = `
                    🌀 ATAJO SUBTERRÁNEO
                    <span class="mensaje-tunel-subtitulo">
                        Viajando bajo la tierra hacia la Cascada...
                    </span>
                `;
            } else if (nuevaCasillaIndex === 24) {
                // TÚNEL 2: Hacia Molino de Piedra
                // Usamos la LINTERNA (🔦) o PICO (⛏️) para el túnel de roca
                mensajeTunel = `
                    🔦 TÚNEL DE ROCA
                    <span class="mensaje-tunel-subtitulo">
                        Cruzando un pasaje oculto bajo el suelo...
                    </span>
                `;
            }

            // 3. Ejecutamos el efecto
            await ejecutarEfectoTunel(ficha, c, pixelCamara, actualizarCamaraHorizontal, mensajeTunel);

            resolve(true);
            return;
        }
        // -------------------------------------------------------------
        // 🌉 PUENTE SIMPLE (Nivel 3: De Casilla 31 a 32)
        // -------------------------------------------------------------
        if (gameState.nivelSeleccionado === 3 && nuevaCasillaIndex === 34) {

            const indiceDestino = 34;
            const coordsDestino = coords[indiceDestino]; // <--- TUS COORDENADAS EXACTAS

            // Calculamos posición de cámara
            const tablero = document.getElementById('tablero-visual-juego');
            let pixelCamara = 0;
            if (tablero) pixelCamara = (coordsDestino.left / 100) * tablero.offsetWidth;

            // Ejecutamos el movimiento lento (2 segundos)
            await moverPorPuenteLento(ficha, coordsDestino, pixelCamara, actualizarCamaraHorizontal);

            // Actualizamos el índice lógico
            nuevaCasillaIndex = 34;

            resolve(true);
            return;
        }
        // -------------------------------------------------------------

        // --- ESTO ES LO QUE YA FUNCIONA PARA TODOS LOS NIVELES (1, 2 y resto del 3) ---
        ficha.style.top = `${c.top}%`;
        ficha.style.left = `${c.left}%`;

        // --- ZONA SEGURA: SOLO SE ACTIVA EN NIVEL 3 Y 4 ---
        if (gameState.nivelSeleccionado === 3 || gameState.nivelSeleccionado === 4) {
            const tablero = document.getElementById('tablero-visual-juego');
            if (tablero) {
                const pixelX = (c.left / 100) * tablero.offsetWidth;
                actualizarCamaraHorizontal(pixelX);
            }
        }

        // Tu velocidad rápida (250ms) para movimientos normales
        setTimeout(() => {
            resolve(true);
        }, 250);
    });
}
// =========================================================
// 🚂 ANIMACIÓN: ABORDAR EL TREN DE LA LIBERTAD (NIVEL 4)
// =========================================================

// 🔥 PASO 1: Declarar el audio AFUERA de la función (para que se cargue una sola vez)
const audioTrenAnimacion = new Audio('assets/audio/sonido_tren.mp3'); // <-- ¡Ajusta esta ruta a tu archivo real!
audioTrenAnimacion.loop = true;  // Que se repita
audioTrenAnimacion.volume = 0.5; // Volumen a la mitad para que no tape otros sonidos

export async function cruzarTrenVisual(posAMover, jugadorId) {
    if (gameState.nivelSeleccionado !== 4) return false;

    let ruta = [];
    let gifUsar = '';
    let idTrenEstacionado = '';

    // 1. Definir Rutas (Rieles exclusivas para el tren)
    if (posAMover === 7) {
        gifUsar = 'tren_derecha.gif';
        idTrenEstacionado = 'tren-espera-tren_inicio';
        ruta = [
            { left: '73.45%', top: '24.03%', transform: 'translate(-50%, -85%)' },
            { left: '74.96%', top: '26.57%', transform: 'translate(-50%, -85%)' },
            { left: '76.47%', top: '28.60%', transform: 'translate(-50%, -85%)' },
            { left: '78.50%', top: '30.63%', transform: 'translate(-50%, -85%)' },
            { left: '80.86%', top: '32.15%', transform: 'translate(-50%, -85%)' }
        ];
    }
    else if (posAMover === 17) {
        // ... (Tu código de ruta 17 se mantiene igual) ...
        gifUsar = 'tren_izquierda.gif';
        idTrenEstacionado = 'tren-espera-tren_medio';
        ruta = [
            { left: '84.10%', top: '58.47%', transform: 'translate(-50%, -85%)' },
            { left: '81.34%', top: '57.87%', transform: 'translate(-50%, -85%)' },
            { left: '78.69%', top: '60.25%', transform: 'translate(-50%, -85%)' },
            { left: '76.27%', top: '60.84%', transform: 'translate(-50%, -85%)' }
        ];
    }
    else if (posAMover === 29) {
        // ... (Tu código de ruta 27 se mantiene igual) ...
        gifUsar = 'tren_izquierda.gif';
        idTrenEstacionado = 'tren-espera-tren_fin';
        ruta = [
            { left: '53.69%', top: '55.20%', transform: 'translate(-50%, -85%)' },
            { left: '51.04%', top: '54.31%', transform: 'translate(-50%, -85%)' },
            { left: '47.70%', top: '54.60%', transform: 'translate(-50%, -85%)' },
            { left: '44.59%', top: '54.01%', transform: 'translate(-50%, -85%)' },
            { left: '41.47%', top: '54.01%', transform: 'translate(-50%, -85%)' },
            { left: '38.48%', top: '50.45%', transform: 'translate(-50%, -85%)' },
            { left: '35.71%', top: '48.07%', transform: 'translate(-50%, -85%)' },
            { left: '32.60%', top: '47.77%', transform: 'translate(-50%, -85%)' },
            { left: '29.72%', top: '47.77%', transform: 'translate(-50%, -85%)' },
            { left: '27.07%', top: '48.96%', transform: 'translate(-50%, -85%)' },
            { left: '23.96%', top: '49.26%', transform: 'translate(-50%, -85%)' }
        ];
    } else {
        return false;
    }

    const tablero = document.getElementById('tablero-visual-juego');
    if (!tablero) return false;

    // Obtenemos las coordenadas EXACTAS de la casilla (Ej: La número 7)
    const coordDestinoFicha = MAPA_COORDENADAS_POR_NIVEL[4][posAMover];
    if (!coordDestinoFicha) return false;

    // 3. Identificar a la ficha y al jugador
    const fichaJugador = document.getElementById(`ficha-jugador-${jugadorId}`);

    let nombreViajero = "Un viajero";
    const elementoNombre = document.getElementById('nombre-jugador-turno');
    if (elementoNombre && elementoNombre.innerText.trim() !== '') {
        nombreViajero = elementoNombre.innerText.trim();
    } else {
        nombreViajero = `Jugador ${jugadorId + 1}`;
    }

    // ==============================================================
    // LA SECUENCIA EXACTA
    // ==============================================================
    return new Promise((resolve) => {
        if (!fichaJugador) { resolve(true); return; }

        const transicionOriginal = fichaJugador.style.transition;

        // PASO 1: LA FICHA DESAPARECE (En la casilla 6)
        fichaJugador.style.transition = "opacity 0.5s ease";
        fichaJugador.style.opacity = "0";

        // Esperamos medio segundo a que se vuelva fantasma
        setTimeout(() => {

            // PASO 2: TELETRANSPORTAR LA FICHA EN MODO INVISIBLE
            fichaJugador.style.transition = "none";
            fichaJugador.style.top = `${coordDestinoFicha.top}%`;
            fichaJugador.style.left = `${coordDestinoFicha.left}%`;
            fichaJugador.style.transform = "translate(-50%, -85%) scale(1)"; // Mantenerla centrada
            void fichaJugador.offsetWidth;

            // PASO 3: APAGAR TREN DECORATIVO Y CREAR TREN ANIMADO AL MISMO TIEMPO
            const trenDecoracion = document.getElementById(idTrenEstacionado);
            if (trenDecoracion) trenDecoracion.style.opacity = '0'; // Apagamos el viejo sin delay

            const contenedorTren = document.createElement('div');
            // ... (Tu código de estilos del contenedorTren se mantiene igual) ...
            contenedorTren.style.position = 'absolute';
            contenedorTren.style.zIndex = '100';
            contenedorTren.style.pointerEvents = 'none';
            contenedorTren.style.left = ruta[0].left;
            contenedorTren.style.top = ruta[0].top;
            contenedorTren.style.transform = 'translate(-50%, -50%)';
            contenedorTren.style.display = 'flex';
            contenedorTren.style.flexDirection = 'column';
            contenedorTren.style.alignItems = 'center';

            const textoFlotante = document.createElement('div');
            textoFlotante.innerHTML = `🚂 <strong>${nombreViajero}</strong> en el Tren de la Libertad`;
            // ... (Tu código de estilos del textoFlotante se mantiene igual) ...
            textoFlotante.style.color = '#E65100';
            textoFlotante.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            textoFlotante.style.padding = '6px 12px';
            textoFlotante.style.borderRadius = '8px';
            textoFlotante.style.fontSize = '0.9rem';
            textoFlotante.style.marginBottom = '5px';
            textoFlotante.style.whiteSpace = 'nowrap';
            textoFlotante.style.boxShadow = '0 3px 6px rgba(0,0,0,0.3)';
            textoFlotante.style.border = '2px solid #FFB300';

            const trenImg = document.createElement('img');
            trenImg.src = `assets/imagenes/gif/nivel4/${gifUsar}`;
            trenImg.style.width = '60px';
            trenImg.style.height = '60px';
            trenImg.style.objectFit = 'contain';

            contenedorTren.appendChild(textoFlotante);
            contenedorTren.appendChild(trenImg);
            tablero.appendChild(contenedorTren);

            // PASO 4: EL TREN VIAJA POR LAS RIELES
            // PASO 4: EL TREN VIAJA POR LAS RIELES

            // 🔥 Ajusta este número: Menor número = Tren más rápido (Ej: 800, 500, 300)
            const tiempoPorTramo = 800;

            const tiempoCalculado = ruta.length * tiempoPorTramo;
            const opcionesAnim = { duration: tiempoCalculado, easing: 'linear', fill: 'forwards' };
            // 🔥 PASO 2: ¡INICIAR EL SONIDO JUSTO ANTES DE QUE ARRANQUE LA ANIMACIÓN!
            // El catch evita errores si el navegador bloquea el audio por falta de interacción previa
            audioTrenAnimacion.play().catch(error => console.log("Audio de tren en espera de interacción", error));

            const animTren = contenedorTren.animate(ruta, opcionesAnim);

            animTren.onfinish = () => {

                // 🔥 PASO 3: ¡DETENER EL SONIDO JUSTO CUANDO EL TREN LLEGA A SU DESTINO!
                audioTrenAnimacion.pause();
                audioTrenAnimacion.currentTime = 0; // Lo regresamos a 0 para el próximo turno

                // PASO 5: EL TREN LLEGA Y SE QUEDA ESTÁTICO DE GOLPE
                contenedorTren.remove();

                if (trenDecoracion) {
                    trenDecoracion.style.transition = 'none';
                    trenDecoracion.style.opacity = '1';
                }

                // PASO 6: LA FICHA REAPARECE MAGÍCAMENTE EN EL DESTINO EXACTO (Casilla 7)
                fichaJugador.style.transition = "opacity 0.8s ease";
                fichaJugador.style.opacity = "1";

                // Finalizamos la animación y restauramos la transición
                setTimeout(() => {
                    fichaJugador.style.transition = transicionOriginal || "top 0.8s, left 0.8s, opacity 0.5s";
                    resolve(true);
                }, 800);

            };

        }, 500); // Fin de espera de desaparición de la ficha
    });
}
// --- FUNCIÓN AUXILIAR (Pégala al final de mechanics.js) ---
// Esta función no molesta a nadie, solo trabaja cuando la llaman
function actualizarCamaraHorizontal(posXJugador) {
    const contenedor = document.getElementById('contenedor-mapa');
    const tablero = document.getElementById('tablero-visual-juego');

    if (!contenedor || !tablero) return;

    const centroPantalla = contenedor.offsetWidth / 2;
    let desplazamiento = centroPantalla - posXJugador;

    // Límites para que no se vea feo
    const anchoTablero = tablero.offsetWidth;
    const maximo = -(anchoTablero - contenedor.offsetWidth);

    if (desplazamiento > 0) desplazamiento = 0;
    if (desplazamiento < maximo) desplazamiento = maximo;

    // Aplicamos el movimiento
    tablero.style.transform = `translateX(${desplazamiento}px)`;
}

export async function animarMovimiento(jugadorId, pasosPendientes, limiteFinal) {
    const jugadorActual = gameState.jugadoresPartida.find(j => j.id === jugadorId);

    // --- CONDICIÓN DE PARADA ---
    if (pasosPendientes <= 0 || jugadorActual.posicion >= limiteFinal) {

        // A. SI LLEGÓ A LA META (VICTORIA)
        if (jugadorActual.posicion >= limiteFinal) {
            jugadorActual.posicion = limiteFinal;
            await moverFicha(jugadorId, limiteFinal);

            console.log("🏁 Meta alcanzada.");

            // 🔥 CAMBIO 1: Esperar 500ms antes de celebrar
            setTimeout(() => {
                mostrarModalCasilla(limiteFinal);
            }, 500);

            return;
        }

        // B. SI SE ACABARON LOS PASOS (Parada normal)
        const casillaFinal = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][jugadorActual.posicion];

        // Si hay contenido (Pregunta, Evento, Lugar), mostramos el modal CON RETRASO
        if (casillaFinal && casillaFinal.tipo !== 'camino') {

            // 🔥 CAMBIO 2: La ficha llega, respira 0.5s y LUEGO sale el modal
            setTimeout(() => {
                mostrarModalCasilla(jugadorActual.posicion);
            }, 500);

        }
        // Si es CAMINO VACÍO
        else {
            console.log("⏹️ Fin de movimiento en camino. Cambio de turno.");
            setTimeout(() => {
                reanudarMovimiento(jugadorId);
            }, 500);
        }
        return;
    }

    // --- DAR UN PASO (Recursividad) ---
    const nuevaPosicion = jugadorActual.posicion + 1;
    const posAMover = Math.min(nuevaPosicion, limiteFinal);

    // 🚂 VERIFICACIÓN DE TREN:
    // Primero intentamos el viaje animado. 
    // Si cruzarTrenVisual devuelve 'true', significa que la ficha ya viajó despacio con el tren.
    const movidoPorTren = await cruzarTrenVisual(posAMover, jugadorId);

    if (!movidoPorTren) {
        // 🚶 CAMINATA NORMAL:
        // Si no hay rieles en esta posición, la ficha camina un paso normalmente.
        await moverFicha(jugadorId, posAMover);
    }

    // Actualizamos la posición lógica
    jugadorActual.posicion = posAMover;

    // Detectar paradas obligatorias (Lugares Emblemáticos)
    const casillaActual = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][posAMover];
    if (casillaActual && casillaActual.tipo === 'lugar_emblematico') {
        jugadorActual.pasosPendientes = pasosPendientes - 1;

        // 🔥 CAMBIO 3: Parada obligatoria también espera 0.5s
        setTimeout(() => {
            mostrarModalCasilla(posAMover);
        }, 500);

        return;
    }
    // =========================================================
    // 🚂 NUEVO: CÓDIGO EXCLUSIVO PARA LA ESTACIÓN DE TREN
    // =========================================================
    // 🔥 Asegúrate de que aquí diga ".tipo" para que coincida con tu casilla
    if (casillaActual && casillaActual.tipo === 'boleto_pregunta') {

        jugadorActual.pasosPendientes = pasosPendientes - 1;

        setTimeout(() => {
            mostrarModalCasilla(posAMover);
        }, 500);

        return;
    }
    // =========================================================

    // Siguiente paso
    await animarMovimiento(jugadorId, pasosPendientes - 1, limiteFinal);
}
// ==========================================
// 5. REANUDAR (Cerrar Modales y Pasar Turno)
// Reemplaza esta función completa en js/mechanics.js
// ==========================================
export function reanudarMovimiento(jugadorId) {
    const jugadorActual = gameState.jugadoresPartida.find(j => j.id === jugadorId);

    // 1. Limpieza visual
    const modal = document.getElementById('gameModal');
    if (modal) modal.style.display = 'none';

    controlarMusicaFondo(false);

    // 🔥 CORRECCIÓN 1: Llamada directa (Sin window.)
    // Esto asegura que la UI se actualice si cerraste un modal sin moverte
    actualizarInterfazPartida();

    // 2. Lógica de Pasos Pendientes
    if (jugadorActual && jugadorActual.pasosPendientes > 0) {
        const pasos = jugadorActual.pasosPendientes;
        jugadorActual.pasosPendientes = 0;

        setTimeout(() => {
            animarMovimiento(jugadorId, pasos, gameState.limiteCasillasActual);
        }, 300);

    } else {
        // 3. FIN DEL TURNO REAL
        const btnDado = document.getElementById('boton-dado');
        if (btnDado) {
            btnDado.disabled = false;
            btnDado.innerText = 'TIRAR DADOS';
            btnDado.classList.remove('animacion-latido'); // Limpiar animación
        }

        if (jugadorActual) {
            guardarProgresoJugador(jugadorActual);
        }

        // A. Cambiar Turno (Matemática)
        avanzarTurno();

        // 🔥 CORRECCIÓN 2: Llamada directa (Sin window. y sin if)
        // Esto es lo que actualiza el nombre en el control del dado
        actualizarInterfazPartida();

        console.log("🔄 Turno cambiado y UI actualizada.");
    }
}
// --- FUNCIÓN AUXILIAR: EFECTO TÚNEL (SINCRONIZACIÓN PERFECTA) ---
function ejecutarEfectoTunel(ficha, coordsDestino, pixelCamaraDestino, funcionCamara, mensajeHTML) {
    return new Promise((resolve) => {

        const transicionOriginal = ficha.style.transition;

        // PASO 1: DESVANECER LA FICHA
        ficha.style.transition = "opacity 0.5s ease";
        ficha.style.opacity = "0";

        // Esperamos 500ms a que la ficha se vaya por completo
        setTimeout(() => {

            // --- 📢 AHORA SÍ: APARECE EL MENSAJE (Ficha ya es invisible) ---
            const mensajeDiv = document.createElement('div');
            mensajeDiv.className = 'mensaje-tunel-centro';
            mensajeDiv.innerHTML = mensajeHTML || "🚇 ¡ATAJO SECRETO!";
            document.body.appendChild(mensajeDiv);
            // -------------------------------------------------------------

            // PASO 2: MOVER TODO EN LO OSCURO (Detrás del mensaje)
            ficha.style.transition = "none";
            ficha.style.top = `${coordsDestino.top}%`;
            ficha.style.left = `${coordsDestino.left}%`;
            ficha.style.transform = ""; // Limpieza CSS

            // Movemos la cámara
            if (typeof funcionCamara === 'function' && pixelCamaraDestino !== undefined) {
                funcionCamara(pixelCamaraDestino);
            }

            void ficha.offsetWidth;

            // PASO 3: TIEMPO DE VIAJE (2 segundos leyendo el mensaje)
            setTimeout(() => {

                // --- 🗑️ PRIMERO: BORRAMOS EL MENSAJE ---
                mensajeDiv.style.transition = "opacity 0.5s";
                mensajeDiv.style.opacity = "0";

                // Esperamos 500ms a que el mensaje desaparezca totalmente
                setTimeout(() => {
                    mensajeDiv.remove(); // Lo quitamos del HTML

                    // PASO 4: AHORA SÍ, REAPARECE LA FICHA (Escenario limpio)
                    ficha.style.transition = "opacity 0.8s ease";
                    ficha.style.opacity = "1";

                    // PASO 5: FINALIZAR Y DEVOLVER CONTROL
                    setTimeout(() => {
                        ficha.style.transition = transicionOriginal || "top 0.8s, left 0.8s, opacity 0.5s";
                        resolve();
                    }, 800);

                }, 500); // Tiempo que tarda el mensaje en irse

            }, 2000); // Duración del mensaje en pantalla

        }, 500); // Tiempo que tarda la ficha en irse al inicio
    });
}


// --- FUNCIÓN AUXILIAR: CRUCE DE PUENTE (Con Mensaje Divertido) ---
function moverPorPuenteLento(ficha, coordsDestino, pixelCamaraDestino, funcionCamara) {
    return new Promise((resolve) => {

        // 1. Guardamos la transición original
        const transicionOriginal = ficha.style.transition;

        // 2. MOSTRAR MENSAJE (Estilo Túnel pero para Puente)
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'mensaje-tunel-centro'; // Usamos la misma clase CSS
        mensajeDiv.innerHTML = `
            🌉 ¡NO MIRES ABAJO!
            <span class="mensaje-tunel-subtitulo">
                Cruzando el puente colgante con mucho cuidado...
            </span>
        `;
        document.body.appendChild(mensajeDiv);

        // 3. APLICAMOS MOVIMIENTO LENTO (2 segundos)
        ficha.style.transition = "top 2s linear, left 2s linear";

        // 4. Mover Cámara
        if (typeof funcionCamara === 'function' && pixelCamaraDestino !== undefined) {
            funcionCamara(pixelCamaraDestino);
        }

        // 5. Mover la Ficha
        ficha.style.top = `${coordsDestino.top}%`;
        ficha.style.left = `${coordsDestino.left}%`;

        // 6. ESPERAR A QUE CRUCE (2 Segundos)
        setTimeout(() => {

            // BORRAR EL MENSAJE SUAVEMENTE
            mensajeDiv.style.transition = "opacity 0.5s";
            mensajeDiv.style.opacity = "0";

            setTimeout(() => mensajeDiv.remove(), 500);

            // RESTAURAR LA VELOCIDAD DE LA FICHA
            ficha.style.transition = transicionOriginal || "top 0.8s, left 0.8s";

            resolve(); // Fin del cruce

        }, 2000);
    });
}