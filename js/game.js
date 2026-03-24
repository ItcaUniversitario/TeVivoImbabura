// ==========================================
// 1. IMPORTACIONES
// ==========================================

import {
    prepararPantallaRegistro,
    verificarCedula,
    iniciarTablero,
    volverSeleccion,
    accesoAdmin,
    aceptarTerminosYContinuar,
    guardarPuntosFinales,
    cargarRankingGlobal,
    actualizarMapaVisual,
    guardarInventario,
    guardarProgresoJugador,
    // 👇 NUEVAS IMPORTACIONES:
    guardarFichaEnHistorial,  // Para guardar qué ficha eligieron
    guardarCierrePartida      // Para guardar en qué lugar quedaron
} from './auth.js';
import { prepararQuizNivel, iniciarQuiz } from './quiz.js';
import { tirarDado, reanudarMovimiento, controlarMusicaFondo, crearFichasEnMapa, moverFicha, animarMovimiento } from './mechanics.js';
import { gameState, getJugadorActual, avanzarTurno } from './state.js';
import { CONTENIDO_CASILLAS_POR_NIVEL, RECOMPENSAS_DATA, VIDEOS_POR_NIVEL, BANCO_FOTOS_TURISTICAS, BANCO_PAREJAS_GENERAL, BANCO_PREGUNTAS_POR_NIVEL, IMAGENES_ROMPECABEZAS_POR_NIVEL } from './data.js';
import { mostrarToast } from './ui.js';
import { precargarImagenes } from './utils.js';
import { audioManager } from './audioManager.js';



import { doc, getDoc, collection, query, where, getCountFromServer, deleteDoc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Importa 'db' desde tu archivo local
import { db } from "./firebase.js";
// ==========================================
// 🎵 FUNCIÓN PARA EL BOTÓN DE MÚSICA
// ==========================================
window.controlarMusica = function () {
    const estaEnSilencio = audioManager.toggleMute();
    const btn = document.getElementById('btn-musica');

    if (btn) {
        if (estaEnSilencio) {

            btn.innerHTML = "🔇";

        } else {

            btn.innerHTML = "🔊";

        }
    }
};
// ==========================================
// 2. EXPONER FUNCIONES GLOBALES (Fallback)
// ==========================================
// Mantenemos esto por seguridad, pero usaremos EventListeners principalmente.
window.prepararPantallaRegistro = prepararPantallaRegistro;
window.verificarCedula = verificarCedula;
window.iniciarTablero = iniciarTablero;
window.volverSeleccion = volverSeleccion;
window.accesoAdmin = accesoAdmin;
window.aceptarTerminosYContinuar = aceptarTerminosYContinuar;
window.tirarDado = tirarDado;
window.reanudarMovimiento = reanudarMovimiento;
window.ocultarModal = ocultarModal;
window.reiniciarJuego = () => window.location.reload();
window.seleccionarFicha = seleccionarFicha;
window.verVideoTerminado = verVideoTerminado;
window.cargarNivel = cargarNivel;
window.mostrarPestana = mostrarPestana;

// ==========================================
// 3. NAVEGACIÓN Y MAPA
// ==========================================

export function verVideoTerminado() {
    console.log("🎬 Video terminado/saltado.");

    const pantallaVideo = document.getElementById('pantalla-video');
    const video = document.getElementById('video-intro');
    const pantallaNiveles = document.getElementById('pantalla-niveles');

    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    if (pantallaVideo) pantallaVideo.style.display = 'none';

    if (pantallaNiveles) {
        pantallaNiveles.style.display = 'flex';


        if (gameState.jugadoresPartida.length > 0) {
            const cedulaMain = gameState.jugadoresPartida[0].cedula;
            actualizarMapaVisual(cedulaMain);
        }
    }
}

// ==========================================
// MODIFICADO: CARGAR NIVEL (Sin Video Fullscreen)
// ==========================================
export async function cargarNivel(nivel) {
    console.log(`🎬 Iniciando Nivel ${nivel}...`);
    gameState.nivelSeleccionado = nivel;

    // 1. Mostrar Pantalla de Carga
    document.getElementById('pantalla-niveles').style.display = 'none';
    const pantallaCarga = document.getElementById('pantalla-interstitial');

    // Configurar imagen de carga dinámica
    const imgCarga = document.getElementById('imagen-interstitial');
    if (imgCarga) {
        imgCarga.src = `assets/imagenes/mapas/mapanivel${nivel}.png`;
        imgCarga.onerror = () => { imgCarga.src = 'assets/imagenes/logo_juego.png'; };
    }

    if (pantallaCarga) pantallaCarga.style.display = 'flex';

    // 2. CARGA PARALELA (Esperamos a que bajen las imágenes)
    await Promise.all([
        precargarImagenes(nivel),
        new Promise(r => setTimeout(r, 2000)) // Bajamos un poco el tiempo a 2s para que sea ágil
    ]);

    // 3. Ocultar carga
    if (pantallaCarga) pantallaCarga.style.display = 'none';

    prepararQuizNivel(nivel);
    mostrarPantallaSeleccionFichas(nivel);
}

export function mostrarSeleccionNiveles() {
    console.log("🗺️ Mostrando selección de niveles...");

    // 1. Ocultar pantallas anteriores
    // Aseguramos que 'pantalla-video' se oculte por si acaso
    const idsOcultar = ['pantalla-inicio', 'pantalla-registro', 'pantalla-video', 'pantalla-fin-partida', 'pantalla-personaje'];

    idsOcultar.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 2. Mostrar pantalla de niveles
    const pantallaNiveles = document.getElementById('pantalla-niveles');
    if (pantallaNiveles) {
        pantallaNiveles.style.display = 'flex';

        // Actualizar candados si hay jugador
        if (gameState.jugadoresPartida.length > 0) {
            actualizarMapaVisual(gameState.jugadoresPartida[0].cedula);
        }
    }
}
// ==========================================
// PASO 3: AGREGAR DEBAJO DE 'cargarNivel'
// ==========================================
function mostrarPantallaSeleccionFichas(nivel) {
    console.log(`👤 Eligiendo ficha para Nivel ${nivel}`);

    gameState.turnoActual = 1;
    gameState.fichasSeleccionadas = {};

    // --- 1. CONFIGURACIÓN DE MAPA Y CÁMARA ---
    const imgMapa = document.getElementById('mapa-juego-visual');
    const contenedor = document.getElementById('contenedor-mapa');
    const tablero = document.getElementById('tablero-visual-juego');

    // Carga la imagen correspondiente al nivel (ej: mapa_imbabura3.png, mapa_imbabura4.png)
    if (imgMapa) imgMapa.src = `assets/imagenes/mapas/mapa_imbabura${nivel}.png`;

    // AQUI ESTÁ EL CAMBIO CLAVE:
    // Si es Nivel 3 o Nivel 4, activamos el modo "Cámara Horizontal"
    if (nivel === 3 || nivel === 4) {
        console.log("🎥 Modo Cámara Activado (Scroll Horizontal)");

        // Activamos la clase CSS que hace que el mapa sea ancho y tenga scroll oculto
        if (contenedor) contenedor.classList.add('modo-scroll-horizontal');

        // Reseteamos la posición al inicio (izquierda) para asegurar que empiece en la casilla 0
        if (tablero) tablero.style.transform = 'translateX(0px)';

    } else {
        // Para Nivel 1 y 2, desactivamos todo para que se vea normal (ajustado a pantalla)
        console.log("📱 Modo Normal (Ajustado a Pantalla)");

        if (contenedor) contenedor.classList.remove('modo-scroll-horizontal');
        if (tablero) tablero.style.transform = 'none';
    }

    // --- 2. Resetear botones de fichas (Tu código original) ---
    const botonesFicha = document.querySelectorAll('.btn-ficha');
    botonesFicha.forEach((btn, index) => {
        const id = index + 1;
        btn.id = `ficha-${id}`;
        btn.onclick = () => seleccionarFicha(id);

        const img = btn.querySelector('img');
        if (img) img.src = `assets/imagenes/fichas/ficha_${id}.png`;

        btn.disabled = false;
        btn.style.border = "2px solid var(--color-tierra-clara)";
        btn.classList.remove('seleccionada');
    });

    // --- 3. Mostrar Pantalla ---
    document.getElementById('pantalla-personaje').style.display = 'flex';

    // Actualizar título
    const titulo = document.getElementById('titulo-seleccion');
    const nombre = gameState.jugadoresPartida[0] ? gameState.jugadoresPartida[0].nombre.split(" ")[0] : "Jugador";
    if (titulo) titulo.innerText = `👤 ${nombre}, elige tu ficha`;
}
// ==========================================
// 4. SELECCIÓN DE PERSONAJE
// ==========================================

function actualizarTituloFicha() {
    const jugador = getJugadorActual();
    if (!jugador) return;
    const titulo = document.getElementById('titulo-seleccion');
    if (titulo) titulo.innerText = `👤 ${jugador.nombre.split(" ")[0]}, elige tu ficha`;
}



// ==========================================
//   FUNCIÓN 'seleccionarFicha'
// ==========================================
export function seleccionarFicha(numeroFicha) {
    // 1. Bloquear visualmente el botón seleccionado
    const btn = document.getElementById(`ficha-${numeroFicha}`);
    if (btn) {
        btn.disabled = true;
        btn.style.border = "3px solid #2E7D32";
        btn.innerHTML += " ✅";
    }

    // 2. Guardar selección en el estado global
    gameState.fichasSeleccionadas[`jugador_${gameState.turnoActual}`] = numeroFicha;

    // 3. Asignar ficha al objeto del jugador actual
    const jugador = getJugadorActual();
    if (jugador) {
        jugador.fichaId = numeroFicha;
        jugador.posicion = 0; // Asegurar que empieza en la salida

        if (typeof guardarFichaEnHistorial === 'function') {
            guardarFichaEnHistorial(jugador.cedula, numeroFicha);
        }
    }

    // 4. CONTROL DE FLUJO
    if (gameState.turnoActual < gameState.jugadoresPartida.length) {
        // --- AÚN FALTAN JUGADORES ---
        console.log(`➡️ Jugador ${gameState.turnoActual} listo. Siguiente...`);
        avanzarTurno();
        actualizarTituloFicha();

    } else {
        // --- ¡TODOS LISTOS! ---
        console.log("✅ Todos tienen ficha. Iniciando Quiz...");
        document.getElementById('pantalla-personaje').style.display = 'none';

        // Iniciar el Quiz previo (Pre-Test)
        // NOTA: Hacemos el callback 'async' para poder consultar Firebase
        iniciarQuiz('inicio', async () => {
            console.log("✅ Pre-Test completado. Revisando configuración de tiempo...");

            // ============================================================
            // 🔥 NUEVO: CONSULTAR SI EL MODO FERIA ESTÁ ACTIVO EN FIREBASE
            // ============================================================
            try {
                const docRef = doc(db, "configuracion_tiempodejuego", "ajustes_globales");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const config = docSnap.data();

                    // Verificamos si modo_feria es true
                    if (config.modo_feria === true) {
                        const minutos = config.tiempo_limite || 5;
                        console.log(`🚨 MODO FERIA ACTIVO: ${minutos} minutos`);

                        // 1. Activamos la variable global (la que creamos en el paso anterior)
                        if (typeof prepararModoFeria === 'function') {
                            // Esta función (que hicimos antes) se encarga de mostrar la cajita del reloj
                            // Le pasamos los datos directamente para no volver a consultar
                            prepararModoFeria(minutos);
                        }
                    } else {
                        console.log("Modo Feria desactivado. Juego normal.");
                        // Aseguramos que el reloj esté oculto
                        const relojDiv = document.getElementById('contenedor-reloj-feria');
                        if (relojDiv) relojDiv.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error("Error consultando tiempo de juego:", error);
                // Si falla internet, seguimos con el juego normal
            }

            // ============================================================
            // 🏁 CONFIGURACIÓN DEL MAPA (FLUJO NORMAL)
            // ============================================================
            gameState.turnoActual = 1;
            const primerJugador = gameState.jugadoresPartida[0].nombre;

            crearFichasEnMapa();

            // Mostrar interfaz del juego
            document.getElementById('contenedor-mapa').style.display = 'flex';
            document.getElementById('panel-derecho').style.display = 'block';

            renderizarScorePartida();
            actualizarInterfazPartida();
            colocarTrenesEnEspera();
            mostrarToast(`🏁 ¡Arranca la partida! Turno de: ${primerJugador}`);

            // Mostrar el video/mensaje de bienvenida
            setTimeout(() => { mostrarModalCasilla(0); }, 1000);
        });
    }
}
// ==========================================
// 5. LÓGICA DE JUEGO (MODALES Y EVENTOS)
// ==========================================


export function ocultarModal() {
    document.getElementById('gameModal').style.display = 'none';
    controlarMusicaFondo(false);
    const btnDado = document.getElementById('boton-dado');
    if (btnDado) {
        btnDado.disabled = false;
        btnDado.innerText = 'TIRAR DADOS';
    }
    avanzarTurno();
    actualizarInterfazPartida();
}

// ==========================================
// 🎥 GESTOR DE VIDEO (CON MODO CINE)
// ==========================================

// Nota: Agregamos el parámetro 'tipoVideo' que por defecto es 'intro'
function manejarVideoIntro(alTerminarCallback, tipoVideo = 'intro') {
    console.log(`🎥 Iniciando gestor de video: ${tipoVideo}`);

    const nivel = gameState.nivelSeleccionado;
    // Protección: Si no hay datos de videos para este nivel, evitar crash
    const dataVideos = VIDEOS_POR_NIVEL ? VIDEOS_POR_NIVEL[nivel] : null;

    // 🔥 AQUÍ ESTÁ LA CLAVE: Usamos [tipoVideo] para elegir 'intro' o 'fin'
    const videoUrl = dataVideos ? dataVideos[tipoVideo] : null;

    // Si no existe video para 'fin' o 'intro', terminamos y seguimos
    if (!videoUrl) {
        console.warn(`⚠️ No se encontró video tipo '${tipoVideo}' para nivel ${nivel}`);
        alTerminarCallback();
        return;
    }

    // --- ELEMENTOS DEL DOM ---
    const modal = document.getElementById('gameModal'); // Referencia al modal padre
    const modalImg = document.getElementById('modalImage');
    const modalDesc = document.getElementById('modalDescription');
    const optsContainer = document.getElementById('modalOptionsContainer');

    // Limpieza visual del modal
    if (modalImg) modalImg.style.display = 'none';
    if (optsContainer) {
        optsContainer.style.display = 'flex';
        optsContainer.innerHTML = '';
    }

    // 🔥 ACTIVAR MODO CINE (CSS)
    if (modal) modal.classList.add('modo-video');

    // --- 1. CREAR VIDEO ---
    let videoElement = document.getElementById('contenedor-video-dinamico');
    if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.id = 'contenedor-video-dinamico';
        videoElement.controls = true;
        // Estilos base (el CSS .modo-video se encargará del tamaño grande)
        videoElement.style.width = '100%';
        videoElement.style.borderRadius = '12px';
        videoElement.style.marginBottom = '15px';
        videoElement.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';

        // Insertamos el video antes de la descripción
        if (modalDesc && modalDesc.parentNode) {
            modalDesc.parentNode.insertBefore(videoElement, modalDesc);
        }
    }
    videoElement.src = videoUrl;
    videoElement.style.display = 'block';

    // Semáforo para que no se ejecute doble
    let yaFinalizado = false;

    // --- 2. LÓGICA DE CIERRE ---
    const finalizarVideo = () => {
        if (yaFinalizado) return;
        yaFinalizado = true;

        console.log("🎬 Video terminado/saltado. Ejecutando callback...");

        // Detener video
        videoElement.onended = null;
        videoElement.onerror = null;
        videoElement.pause();
        videoElement.style.display = 'none';
        videoElement.src = ""; // Liberar memoria

        if (optsContainer) optsContainer.innerHTML = '';

        // 🔥 DESACTIVAR MODO CINE (CSS)
        if (modal) modal.classList.remove('modo-video');

        // Ejecutar la acción siguiente (Cerrar modal o ir a Ranking)
        alTerminarCallback();
    };

    // --- 3. BOTÓN SALTAR (Tu estilo Naranja) ---
    if (optsContainer) {
        const btnSaltar = document.createElement('button');
        btnSaltar.className = 'btn-saltar-video'; // Asegúrate de tener estilo para esto o usa 'btn-imbabura'
        // Si no tienes estilo 'btn-saltar-video', usa: btnSaltar.className = 'btn-imbabura';

        btnSaltar.innerHTML = '<span class="icono-saltar">⏩</span> SALTAR VIDEO';
        btnSaltar.style.width = '100%'; // Que ocupe todo el ancho
        btnSaltar.style.marginTop = '10px';

        btnSaltar.onclick = finalizarVideo;
        optsContainer.appendChild(btnSaltar);
    }

    // --- 4. PLAY ---
    videoElement.onended = finalizarVideo;
    videoElement.onerror = finalizarVideo;

    // Intentar reproducir (manejar promesa por si el navegador bloquea autoplay)
    videoElement.play().catch(e => {
        console.log("Autoplay bloqueado (esperando interacción usuario)", e);
        // Si se bloquea, no pasa nada, el usuario tiene los controles nativos y el botón saltar
    });
}

// ==========================================
// PEGAR AL PRINCIPIO DE game.js (Después de los imports)
// ==========================================

// Definimos la función globalmente para que siempre esté disponible
window.cerrarModalInicio = function () {
    console.log("🚪 Ejecutando cierre de modal de inicio...");

    const modal = document.getElementById('gameModal');
    const btnDado = document.getElementById('boton-dado');
    const pantallaVideo = document.getElementById('contenedor-video-dinamico'); // Asegurarnos de limpiar el video

    // 1. Ocultar Modal
    if (modal) {
        modal.style.display = 'none';
        // Importante: Quitar la clase o estilo que lo hace visible si usas flex
        modal.classList.remove('mostrar');
    }

    // 2. Detener y limpiar video si quedó corriendo (doble seguridad)
    if (pantallaVideo) {
        pantallaVideo.pause();
        pantallaVideo.src = ""; // Vaciar fuente para detener carga
    }

    // 3. Reactivar música de fondo (si existe la función)
    if (typeof controlarMusicaFondo === 'function') {
        controlarMusicaFondo(false);
    }

    // 4. DESBLOQUEAR EL DADO (Para que empiece el juego)
    if (btnDado) {
        btnDado.disabled = false;
        btnDado.innerText = 'TIRAR DADOS';
        btnDado.style.backgroundColor = "";
        btnDado.classList.add('animacion-latido'); // Efecto visual

        // Quitar el efecto después de unos segundos
        setTimeout(() => btnDado.classList.remove('animacion-latido'), 2000);
    }
};



export function mostrarModalCasilla(casillaIndex) {
    const casillaData = CONTENIDO_CASILLAS_POR_NIVEL[gameState.nivelSeleccionado][casillaIndex];
    if (!casillaData) return;

    const modal = document.getElementById('gameModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDescription');
    const modalImg = document.getElementById('modalImage');
    const optsContainer = document.getElementById('modalOptionsContainer');
    const btnContainer = document.getElementById('modalButtons');
    const arContainer = document.getElementById('arMessageContainer');

    // Resetear modal
    optsContainer.innerHTML = ''; btnContainer.innerHTML = '';
    modalImg.style.display = 'none'; if (arContainer) arContainer.innerHTML = '';
    optsContainer.style.display = 'none';

    switch (casillaData.tipo) {
        // CASO 0: INICIO DEL JUEGO
        case 'inicio':
            modalTitle.textContent = casillaData.titulo;
            modalDesc.innerHTML = casillaData.descripcion;

            // Asegurarnos de que el dado esté bloqueado al abrir el inicio
            const btnDado = document.getElementById('boton-dado');
            if (btnDado) btnDado.disabled = true;

            // Ejecutar la intro
            manejarVideoIntro(() => {
                window.cerrarModalInicio();

                // 🔥 ACTIVAR EL DADO AL TERMINAR
                if (btnDado) {
                    btnDado.disabled = false;
                    // Opcional: añadir una clase de brillo para avisar que ya puede jugar
                    btnDado.classList.add('animacion-brillo');
                }
            });
            break;
        case 'lugar_emblematico':
            // ⚙️ CONFIGURACIÓN DE PUNTOS FIJOS
            const PUNTOS_LUGAR = 100;

            // 1. 🔥 TÍTULO
            modalTitle.innerHTML = `
                <div style="
                    color: #ef6c00; 
                    font-size: 0.65em; 
                    font-weight: 800; 
                    letter-spacing: 1px; 
                    text-transform: uppercase;
                    margin-bottom: 2px;
                ">
                   📸 HAZ UNA PARADA OBLIGATORIA EN:
                </div>
                ${casillaData.titulo}
            `;

            // 2. 🎒 LÓGICA DE RECOMPENSA (PUNTOS + ÍCONO)

            const itemNombre = casillaData.item || (casillaData.recompensa ? casillaData.recompensa.item : null);

            // 🆕 DICCIONARIO VISUAL (Mapeo de tus recompensas)
            const nombresVisuales = {
                'helado': 'Helado de Paila',
                'arbol': 'Árbol Arupo',
                'poncho': 'Poncho Otavaleño',
                'canoa': 'Canoa',
                'algodon': 'Algodón',
                //NIVEL 2
                'cascada': 'Cascada de Peguche', // O simplemente "Cascada Natural"
                'piscina': 'Piscina de Chachimbiro', // O "Piscinas Recreativas"
                'silla': 'Silla de Montar',
                'sendero': 'Sendero de Artezón',
                'volcan': 'Volcán Cubilche',
                'petroglifo': 'Petroglifo de Shanshipamba',
                //NIVEL 3
                'caraintag': 'Cara del Dios de Intag',
                'cascadaconrayaro': 'Cascada Conrayaro',
                'cuychaltura': 'Cuy de Chaltura',
                'cascadataxopamba': 'Cascada Taxopamba',
                'molinodepiedra': 'Molino de Piedra',
                'canadeazucar': 'Caña de Azúcar',

                //nivel 4
                'terrazacahuasqui': 'Terraza de Cahuasquí',
                'frutastrueque': 'Frutas',
                'columpiovertigo': 'Columpio',
                'complejovolcanico': 'Volcán Imbabura',
                'lagosanpablo': 'Lago de San Pablo',
                'ollabarrogualiman': 'Olla de barro de Gualimán',





            };

            // Si existe en la lista usa el nombre bonito, si no, usa el ID en mayúsculas
            const nombreMostrar = itemNombre ? (nombresVisuales[itemNombre] || itemNombre.toUpperCase()) : '';

            let htmlContenido = '';

            if (itemNombre) {
                htmlContenido = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px;">
                        <span style="font-size: 1rem; font-weight: 800; color: #D84315;">✨ +${PUNTOS_LUGAR} Pts</span>
                        
                        <span style="font-size: 0.9em; color: #E65100; font-weight: bold;">+ 1 ${nombreMostrar}</span>
                        
                        <img id="icono-recompensa-modal" 
                             src="assets/imagenes/recompensas/${itemNombre}.png" 
                             style="width: 30px; height: 30px; object-fit: contain;" 
                             onerror="this.style.display='none'">
                    </div>
                `;
            } else {
                // Opción B: Solo Puntos
                htmlContenido = `
                    <div style="font-size: 1rem; font-weight: 800; margin-top: 4px; color: #D84315;">
                        ✨ +${PUNTOS_LUGAR} Pts
                    </div>
                `;
            }

            // 3. 🎁 TARJETA VISUAL (Estructura original centrada)
            const feedbackVisual = `
                <div style="
                    background: #FFF3E0; 
                    border: 1px solid #FFCC80;
                    border-left: 4px solid #FF9800; 
                    color: #E65100;
                    padding: 8px 10px; 
                    margin-top: 0px; 
                    border-radius: 6px;
                    text-align: center;
                    font-size: 0.85rem; 
                    line-height: 1.2;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                    animation: fadeInUp 0.5s ease-out;
                ">
                    Por tu visita recibes:
                    ${htmlContenido}
                </div>
            `;

            // ✅ INYECCIÓN
            modalDesc.innerHTML = feedbackVisual;

            // Lógica de Imagen y RA
            if (casillaData.imagen) {
                modalImg.src = casillaData.imagen;
                modalImg.style.display = 'block';
                if (arContainer) arContainer.innerHTML = '<p class="mensaje-ar" style="color: #0c0c0c;">📱 ¡Escanea para descubrir secretos con Cati!</p>';
            }

            // 🧠 LÓGICA INTERNA
            aplicarRecompensa({
                puntos: PUNTOS_LUGAR,
                item: itemNombre
            });

            const jugador = getJugadorActual();

            // 4. 🔘 BOTÓN (Abajo, como estaba originalmente)
            btnContainer.innerHTML = `<button class="btn-imbabura" onclick="window.reanudarMovimiento(${jugador.id})">🎁 ¡Reclamar Obsequios!</button>`;

            controlarMusicaFondo(true);
            break;
        case 'boleto_pregunta':
            // ⚙️ 1. PREPARACIÓN DEL JUGADOR
            const jugadorActual = getJugadorActual();
            let respondido = false; // Candado para evitar doble clic y saltos de turno

            // 🧠 2. OBTENER PREGUNTA ALEATORIA
            const nivelActual = gameState.nivelSeleccionado || 1;
            let preguntasDisponibles = [];

            if (typeof BANCO_PREGUNTAS_POR_NIVEL !== 'undefined' && BANCO_PREGUNTAS_POR_NIVEL[nivelActual]) {
                preguntasDisponibles = BANCO_PREGUNTAS_POR_NIVEL[nivelActual];
            } else {
                preguntasDisponibles = [{ pregunta: "¿Urcuquí es parte de Imbabura?", opciones: ["No", "Sí"], correcta: 1 }];
            }

            const preguntaActual = preguntasDisponibles[Math.floor(Math.random() * preguntasDisponibles.length)];

            // 🚂 3. DISEÑO VISUAL ÚNICO (Estilo Taquilla)
            modalTitle.innerHTML = `
                <div style="color: #2c3e50; font-size: 0.7em; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">
                    🚂 TAQUILLA DE TREN
                </div>
                ${casillaData.titulo || 'Estación Principal'}
            `;

            modalDesc.innerHTML = `
                <div style="background-color: #ecf0f1; border: 2px dashed #7f8c8d; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px;">
                    <p style="margin: 0; color: #2c3e50; font-size: 0.95rem; font-weight: bold;">🎟️ ¡Parada Obligatoria!</p>
                    <p style="margin: 5px 0 0 0; color: #34495e; font-size: 0.85rem;">Obtén tu boleto respondiendo correctamente:</p>
                </div>
                <p style="text-align: center; font-size: 1.2rem; color: #2c3e50; font-weight: 800; margin-bottom: 20px;">
                    ${preguntaActual.pregunta}
                </p>
            `;

            optsContainer.style.display = 'block';
            optsContainer.innerHTML = '';
            btnContainer.innerHTML = '';

            // 🔘 4. CREAR BOTONES DE OPCIONES
            preguntaActual.opciones.forEach((opcion, index) => {
                const btnOpt = document.createElement('button');
                btnOpt.innerText = opcion;
                btnOpt.style.cssText = `
                    display: block; width: 100%; margin: 10px 0; padding: 14px;
                    background-color: #ffffff; border: 2px solid #bdc3c7;
                    border-radius: 10px; cursor: pointer; font-size: 1.05rem;
                    font-weight: bold; color: #2c3e50; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    transition: all 0.2s ease;
                `;

                btnOpt.onclick = () => {
                    if (respondido) return; // Si ya hizo clic, no hace nada
                    respondido = true;

                    // Bloquear visualmente todos los botones
                    Array.from(optsContainer.children).forEach(b => b.style.pointerEvents = 'none');

                    // ✅ VALIDACIÓN POR ÍNDICE (0, 1, 2...)
                    if (index === preguntaActual.correcta) {
                        // ==========================================
                        // 🎉 ÉXITO: RESPUESTA CORRECTA
                        // ==========================================
                        btnOpt.style.backgroundColor = '#27ae60';
                        btnOpt.style.color = '#fff';
                        btnOpt.style.borderColor = '#2ecc71';

                        if (typeof audioManager !== 'undefined' && audioManager.playSFX) audioManager.playSFX('assets/audio/success.mp3');

                        jugadorActual.bloqueado_tren = false;
                        
                        // Lógica de pasos: si llegó exacto (0), le damos 1 para que no se quede quieto
                        jugadorActual.pasosPendientes = (jugadorActual.pasosPendientes && jugadorActual.pasosPendientes > 0) 
                            ? jugadorActual.pasosPendientes 
                            : 1;

                        // 🔥 LÓGICA DEL MENSAJE DINÁMICO
                        let mensajeTren = "";
                        if (jugadorActual.pasosPendientes > 1) {
                            mensajeTren = `¡Cruza las rieles y avanza tus ${jugadorActual.pasosPendientes} casillas pendientes!`;
                        } else {
                            mensajeTren = `¡Cruza el camino del tren y avanza 1 casilla!`;
                        }

                        const destino = casillaData.destino || "Siguiente Estación";
                        const overlayBoleto = document.createElement('div');
                        overlayBoleto.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 20; border-radius: 10px; animation: fadeInUp 0.4s ease;';

                        // DISEÑO TIPO "TE VIVO IMBABURA" CON MARCA DE AGUA DEL TREN
                        overlayBoleto.innerHTML = `
                            <div style="
                                position: relative; 
                                background: linear-gradient(135deg, #D84315, #E65100); 
                                padding: 25px; 
                                border-radius: 12px; 
                                border: 3px dashed #FFCC80; 
                                box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
                                text-align: center; 
                                color: white; 
                                width: 85%;
                                overflow: hidden;
                            ">
                                <div style="
                                    position: absolute; 
                                    top: 50%; 
                                    left: 50%; 
                                    transform: translate(-50%, -50%); 
                                    font-size: 8rem; 
                                    opacity: 0.15; 
                                    z-index: 1; 
                                    pointer-events: none; 
                                    filter: grayscale(100%) brightness(200%);
                                ">
                                    🚂
                                </div>

                                <div style="position: relative; z-index: 2;">
                                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 900; text-transform: uppercase; color: #FFF; text-shadow: 1px 1px 3px rgba(0,0,0,0.4);">
                                        🚂 TREN DE LA LIBERTAD
                                    </h3>
                                    <p style="margin: 0; font-size: 0.9rem; color: #FFCC80; font-weight: bold; letter-spacing: 2px;">PASE VIP</p>
                                    <hr style="border: 1px dashed rgba(255, 204, 128, 0.5); margin: 15px 0;">
                                    
                                    <p style="margin: 0; font-size: 1.3rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                                        ${jugadorActual.nombre}
                                    </p>
                                    
                                    <p style="margin: 12px 0 2px 0; font-size: 0.85rem; text-transform: uppercase; color: #FFCC80; font-weight: 800; letter-spacing: 1px;">
                                        Destino:
                                    </p>
                                    <p style="margin: 0; font-size: 1.3rem; font-weight: bold; color: #FFF;">
                                        ${destino}
                                    </p>
                                    
                                    <div style="margin-top: 18px; background: rgba(0,0,0,0.25); padding: 12px 8px; border-radius: 6px; border: 1px solid rgba(255, 204, 128, 0.3);">
                                        <p style="margin: 0; font-weight: bold; color: #FFCC80; font-size: 0.95rem; line-height: 1.3;">
                                            ${mensajeTren}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `;
                        optsContainer.parentElement.appendChild(overlayBoleto);

                        setTimeout(() => {
                            if (typeof mostrarToast === 'function') mostrarToast("¡Buen viaje!", "success");
                            
                            // 🔥 Eliminamos el boleto visualmente para que no se quede pegado
                            if (overlayBoleto) overlayBoleto.remove();
                            
                            optsContainer.innerHTML = '';
                            modalDesc.innerHTML = '';

                            window.reanudarMovimiento(jugadorActual.id);
                        }, 3000);

                    } else {
                        // --- ❌ ERROR ---
                        btnOpt.style.backgroundColor = '#c0392b';
                        btnOpt.style.color = '#fff';
                        btnOpt.style.borderColor = '#e74c3c';

                        if (typeof audioManager !== 'undefined' && audioManager.playSFX) audioManager.playSFX('assets/audio/error.mp3');

                        jugadorActual.bloqueado_tren = true;
                        jugadorActual.pasosPendientes = 0;

                        setTimeout(() => {
                            if (typeof mostrarToast === 'function') mostrarToast("❌ Perdiste el tren. Intenta el próximo turno.", "error");
                            window.reanudarMovimiento(jugadorActual.id);
                        }, 2000);
                    }
                };
                optsContainer.appendChild(btnOpt);
            });

            if (typeof controlarMusicaFondo === 'function') controlarMusicaFondo(true);
            break;

        case 'dato_curioso':
            // 🔒 PUNTOS FIJOS PARA TODOS LOS DATOS CURIOSOS
            const PUNTOS_DATO = 10;

            modalTitle.textContent = '💡 DATO CURIOSO';

            // 1. Inyectamos Texto + Pequeño aviso de recompensa visual
            modalDesc.innerHTML = `
                <div style="margin-bottom: 15px; font-size: 1.1rem; line-height: 1.6; color: #444;">
                    ${casillaData.descripcion}
                </div>
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="
                        background: #E8F5E9; 
                        color: #2E7D32; 
                        font-weight: 800; 
                        padding: 5px 12px; 
                        border-radius: 15px; 
                        border: 1px solid #A5D6A7;
                        font-size: 0.9rem;
                    ">
                        ✨ Encontraste ${PUNTOS_DATO} Puntos
                    </span>
                </div>

                <div id="contenedor-btn-dato" style="text-align: center;"></div>
            `;

            // 2. Creamos el botón
            const btnDato = document.createElement('button');
            btnDato.className = 'btn-modal-accion'; // O usa 'btn-imbabura' si prefieres el verde
            btnDato.textContent = "¡Recolectar Puntos!";
            btnDato.style.cursor = "pointer";
            btnDato.style.padding = "10px 20px"; // Aseguramos que se vea bien

            // 3. Lógica al hacer Clic
            btnDato.onclick = function () {
                // A. Forzamos SIEMPRE 20 puntos y NINGÚN item
                aplicarRecompensa({ puntos: PUNTOS_DATO, item: null });

                // B. Reanudamos el juego (IMPORTANTE: Usar reanudar para que pase al siguiente turno)
                const jugador = getJugadorActual();

                // Si tienes la función reanudarMovimiento disponible globalmente:
                if (typeof window.reanudarMovimiento === 'function') {
                    window.reanudarMovimiento(jugador.id);
                } else {
                    ocultarModal(); // Fallback si no usas movimiento automático
                }
            };

            // 4. Insertar el botón
            document.getElementById('contenedor-btn-dato').appendChild(btnDato);

            // Limpiezas visuales (por si veníamos de un lugar con imagen)
            modalImg.style.display = 'none';
            if (arContainer) arContainer.innerHTML = '';
            break;
        case 'pregunta':
            modalTitle.textContent = casillaData.titulo;
            modalDesc.innerHTML = `<p style="text-align:center; font-weight:bold;">${casillaData.pregunta}</p>`;

            optsContainer.innerHTML = '';
            optsContainer.style.display = 'block'; // Cambiamos a block para lista vertical

            casillaData.opciones.forEach((op, idx) => {
                const b = document.createElement('button');
                b.textContent = op;
                b.className = 'opcion-boton'; // Aplica el nuevo estilo

                b.onclick = () => manejarRespuesta(casillaData, idx);
                optsContainer.appendChild(b);
            });
            break;
        case 'pregunta_aleatoria':
            // 1. CREAMOS LA MEMORIA: Si no existe, creamos un arreglo vacío en el estado del juego
            gameState.preguntasUsadas = gameState.preguntasUsadas || [];

            const bancoNivelActual = BANCO_PREGUNTAS_POR_NIVEL[gameState.nivelSeleccionado] || [];

            // 2. EL FILTRO MÁGICO: Buscamos la categoría, pero EXCLUIMOS las preguntas que ya están en la memoria
            let preguntasFiltradas = bancoNivelActual.filter(p =>
                p.categoria === casillaData.categoria &&
                !gameState.preguntasUsadas.includes(p.pregunta) // Evita las repetidas
            );

            // 3. EL REINICIO: Si ya se hicieron todas las preguntas de esa categoría, vaciamos la memoria para volver a empezar
            if (preguntasFiltradas.length === 0) {
                // Volvemos a cargar las preguntas originales de esa categoría
                preguntasFiltradas = bancoNivelActual.filter(p => p.categoria === casillaData.categoria);
                // Vaciamos la memoria para que el juego pueda volver a usarlas
                gameState.preguntasUsadas = [];
            }

            if (preguntasFiltradas.length > 0) {
                const preguntaAzar = preguntasFiltradas[Math.floor(Math.random() * preguntasFiltradas.length)];

                // 4. GUARDAMOS EN MEMORIA: Anotamos la pregunta elegida para que no vuelva a salir pronto
                gameState.preguntasUsadas.push(preguntaAzar.pregunta);

                modalTitle.textContent = "DESAFÍO DE CONOCIMIENTO";

                // 1. SOLO LA PREGUNTA (Limpiamos el resto)
                modalDesc.innerHTML = `
                <div style="text-align: center;">
                    <h3 style="
                        color: #333;
                        font-size: 1.1rem;
                        font-weight: 600;
                        margin: 10px 0;
                    ">
                        ${preguntaAzar.pregunta}
                    </h3>
                    <div style="width: 40px; height: 3px; background: #FF9800; margin: 5px auto; border-radius: 2px;"></div>
                </div>
            `;

                // 2. Limpiar botones anteriores (IMPORTANTE)
                btnContainer.innerHTML = '';

                // 3. Configurar opciones
                optsContainer.innerHTML = '';
                optsContainer.style.display = 'flex';
                optsContainer.style.flexDirection = 'column';
                optsContainer.style.gap = '8px';

                preguntaAzar.opciones.forEach((op, idx) => {
                    const b = document.createElement('button');
                    b.textContent = op;
                    b.className = 'opcion-boton';
                    b.id = `btn-opcion-${idx}`; // ID vital para pintar colores después

                    b.onclick = () => {
                        verificarRespuestaAleatoria(idx, preguntaAzar.correcta, casillaData.recompensa);
                    };
                    optsContainer.appendChild(b);
                });

            } else {
                // Fallback
                modalTitle.textContent = "Camino Libre";
                modalDesc.innerHTML = "Sigue adelante.";
                btnContainer.innerHTML = `<button class="btn-imbabura" onclick="ocultarModal()">Continuar</button>`;
            }
            break;
        case 'casilla_vacia':
            modalTitle.textContent = '🚶 SENDERO LIBRE';

            // 1. Inyectamos solo el texto de la casilla o uno por defecto
            const msgVacio = casillaData.descripcion || "No hay obstáculos en este tramo. ¡Aprovecha para avanzar!";

            modalDesc.innerHTML = `
        <div style="margin-bottom: 20px; font-size: 1.1rem; line-height: 1.6; color: #666; text-align: center;">
            ${msgVacio}
        </div>
        <div id="contenedor-btn-vacia" style="text-align: center;"></div>
    `;

            // 2. Creamos el botón "Continuar"
            const btnVacia = document.createElement('button');
            btnVacia.className = 'btn-modal-accion';
            btnVacia.textContent = "Continuar viaje";
            btnVacia.style.cursor = "pointer";

            // 3. Lógica al hacer Clic: Solo cerrar y pasar turno
            btnVacia.onclick = function () {
                const jugador = getJugadorActual();

                if (typeof window.reanudarMovimiento === 'function') {
                    window.reanudarMovimiento(jugador.id);
                } else {
                    ocultarModal();
                }
            };

            // 4. Insertar y limpiar
            document.getElementById('contenedor-btn-vacia').appendChild(btnVacia);
            modalImg.style.display = 'none';
            if (arContainer) arContainer.innerHTML = '';
            break;

        case 'evento':
            manejarEvento(casillaData);
            break;

        // ======================================================
        // CASO: MINIJUEGOS (Independiente del Nivel)
        // ======================================================
        case 'minijuego':
            modalTitle.textContent = casillaData.titulo;

            // 1. MOSTRAR PREGUNTA O DESCRIPCIÓN
            // Priorizamos la pregunta específica del minijuego
            if (casillaData.pregunta) {
                modalDesc.innerHTML = `<p style="text-align:center; font-weight:500; font-size:1.1rem;">${casillaData.pregunta}</p>`;
            } else {
                modalDesc.innerHTML = casillaData.descripcion || '';
            }

            // Limpiamos y preparamos el contenedor
            optsContainer.innerHTML = '';

            // -----------------------------------------------------------
            // SUBTIPO A: CUATRO IMÁGENES (Identificar Lugar)
            // -----------------------------------------------------------
            if (casillaData.subtipo === 'cuatro_imagenes' || casillaData.subtipo === 'galeria_imagenes') {

                optsContainer.className = 'contenedor-mini-galeria';
                optsContainer.style.display = 'grid';

                // Si es aleatorio, generamos los distractores desde un banco general
                if (casillaData.modo === 'aleatorio' && !casillaData.opcionesImagenes) {
                    // Usamos el banco general de fotos (sin importar el nivel)
                    // Si BANCO_FOTOS_TURISTICAS no existe, usamos un array vacío para evitar errores
                    const bancoGlobalFotos = (typeof BANCO_FOTOS_TURISTICAS !== 'undefined') ? BANCO_FOTOS_TURISTICAS : [];

                    const distractores = bancoGlobalFotos
                        .filter(img => img !== casillaData.imagenCorrecta)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3);

                    const opcionesMezcladas = [...distractores, casillaData.imagenCorrecta].sort(() => 0.5 - Math.random());

                    casillaData.opcionesImagenes = opcionesMezcladas;
                    casillaData.indiceCorrecto = opcionesMezcladas.indexOf(casillaData.imagenCorrecta);
                }

                const imagenesAUsar = casillaData.opcionesImagenes || casillaData.opciones || [];

                imagenesAUsar.forEach((imgSrc, index) => {
                    const card = document.createElement('div');
                    card.className = 'card-minijuego';
                    card.onclick = () => {
                        if (typeof resolverMinijuegoImagenes === 'function') {
                            resolverMinijuegoImagenes(index, casillaData);
                        }
                    };

                    card.innerHTML = `
                        <div class="card-img-wrapper">
                            <img src="${imgSrc}" alt="Opción" onerror="this.src='assets/imagenes/placeholder.png'">
                        </div>
                        <div class="indicador-tap">👆</div>
                    `;
                    optsContainer.appendChild(card);
                });
            }

            // -----------------------------------------------------------
            // SUBTIPO B: UNIR PAREJAS (Mochila Revuelta)
            // -----------------------------------------------------------
            else if (casillaData.subtipo === 'unir_parejas') {

                optsContainer.className = 'contenedor-unir-parejas';
                optsContainer.style.display = 'flex';

                // Si es aleatorio, buscamos parejas en el banco general
                if (casillaData.modo === 'aleatorio' && !casillaData.paresJuegoActual) {
                    const bancoGlobalParejas = (typeof BANCO_PAREJAS_GENERAL !== 'undefined') ? BANCO_PAREJAS_GENERAL : [];

                    if (bancoGlobalParejas.length > 0) {
                        const mezcla = [...bancoGlobalParejas].sort(() => 0.5 - Math.random());
                        casillaData.paresJuegoActual = mezcla.slice(0, 3);
                    } else {
                        // Si no hay banco general, intentamos usar los que vengan en la casilla
                        casillaData.paresJuegoActual = casillaData.pares ? casillaData.pares.slice(0, 3) : [];
                    }
                }

                const paresAUsar = casillaData.paresJuegoActual || casillaData.pares || [];

                // Inicializar estado del minijuego
                window.estadoMinijuego = {
                    seleccionIzq: null,
                    seleccionDer: null,
                    paresEncontrados: 0,
                    totalPares: paresAUsar.length,
                    recompensa: casillaData.recompensa
                };

                // Crear Columnas
                const colIz = document.createElement('div');
                colIz.className = 'col-unir';
                const colDer = document.createElement('div');
                colDer.className = 'col-unir';

                // Columna Izquierda (Orden original)
                paresAUsar.forEach((par, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-unir';
                    btn.innerHTML = par.izquierda;
                    btn.onclick = function () { manejarClickUnion('izq', idx, this); };
                    colIz.appendChild(btn);
                });

                // Columna Derecha (Mezclada visualmente)
                const indicesMezclados = paresAUsar.map((_, i) => i).sort(() => Math.random() - 0.5);
                indicesMezclados.forEach((idxReal) => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-unir';
                    btn.innerHTML = paresAUsar[idxReal].derecha;
                    btn.onclick = function () { manejarClickUnion('der', idxReal, this); };
                    colDer.appendChild(btn);
                });

                optsContainer.appendChild(colIz);
                optsContainer.appendChild(colDer);
            }


            // -----------------------------------------------------------
            // SUBTIPO: ROMPECABEZAS DESLIZABLE 
            // -----------------------------------------------------------
            else if (casillaData.subtipo === 'rompecabezas') {

                // 🔥 1. EL ESTÁNDAR AUTOMÁTICO (TEXTOS POR DEFECTO)
                const tituloEstandar = '🧩 Reconstruye el Lugar';
                const instruccionEstandar = 'Toca dos piezas para intercambiarlas y armar la fotografía.';

                // Usamos los mismos selectores que funcionan en el resto de tu ventana modal
                const modalTitle = document.getElementById('modalTitle') || document.querySelector('#gameModal h2');
                const modalDesc = document.getElementById('modalDescription') || document.querySelector('#gameModal p');

                if (modalTitle) {
                    modalTitle.innerHTML = casillaData.titulo || tituloEstandar;
                }
                if (modalDesc) {
                    modalDesc.innerHTML = `<p style="text-align:center; font-weight:500; font-size:1.1rem; color: #4E342E; margin-bottom: 15px;">
                        ${casillaData.pregunta || instruccionEstandar}
                    </p>`;
                }
                optsContainer.style.display = 'block';
                optsContainer.innerHTML = '';

                // Extraemos imágenes si existen para el nivel
                const fotosDelNivel = (typeof IMAGENES_ROMPECABEZAS_POR_NIVEL !== 'undefined')
                    ? IMAGENES_ROMPECABEZAS_POR_NIVEL[gameState.nivelSeleccionado]
                    : [];

                let imagenPuzzle = 'assets/imagenes/placeholder.png';
                if (fotosDelNivel && fotosDelNivel.length > 0) {
                    imagenPuzzle = fotosDelNivel[Math.floor(Math.random() * fotosDelNivel.length)];
                } else if (casillaData.imagen) {
                    imagenPuzzle = casillaData.imagen;
                }

                // ==========================================
                // 1. CONTENEDOR PRINCIPAL
                // ==========================================
                const puzzleWrapper = document.createElement('div');
                puzzleWrapper.style.width = '100%';
                puzzleWrapper.style.maxWidth = '340px';
                puzzleWrapper.style.margin = '0 auto';
                puzzleWrapper.style.display = 'flex';
                puzzleWrapper.style.flexDirection = 'column';
                puzzleWrapper.style.alignItems = 'center';
                puzzleWrapper.style.position = 'relative';

                optsContainer.appendChild(puzzleWrapper);

                // Variables de control del juego
                let movimientosRestantes = 4;
                let tiempoRestante = 25; // 🔥 25 segundos iniciales
                let temporizadorInterval;

                // ==========================================
                // 2. DASHBOARD COMPACTO (Meta | Movimientos | Tiempo)
                // ==========================================
                const dashboardInfo = document.createElement('div');
                dashboardInfo.style.width = '100%';
                dashboardInfo.style.display = 'flex';
                dashboardInfo.style.justifyContent = 'space-between';
                dashboardInfo.style.alignItems = 'center';
                dashboardInfo.style.backgroundColor = '#f8f5f2';
                dashboardInfo.style.padding = '10px 15px';
                dashboardInfo.style.borderRadius = '12px';
                dashboardInfo.style.border = '2px dashed #d7ccc8';
                dashboardInfo.style.marginBottom = '15px';
                dashboardInfo.style.boxSizing = 'border-box';

                // --- COLUMNA 1: Foto Guía ---
                const colMeta = document.createElement('div');
                colMeta.style.display = 'flex'; colMeta.style.flexDirection = 'column'; colMeta.style.alignItems = 'center';
                colMeta.innerHTML = `
                    <span style="font-size: 0.65rem; color: #8D6E63; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">📸 Meta</span>
                    <img src="${imagenPuzzle}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 8px; border: 2px solid #fff; box-shadow: 0 3px 5px rgba(0,0,0,0.15);">
                `;

                // --- COLUMNA 2: Contador de Movimientos ---
                const colMovs = document.createElement('div');
                colMovs.style.display = 'flex'; colMovs.style.flexDirection = 'column'; colMovs.style.alignItems = 'center';
                colMovs.innerHTML = `
                    <span style="font-size: 0.65rem; color: #8D6E63; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">⚡ Jugadas</span>
                    <div id="caja-movimientos" style="background: #fff; padding: 4px 12px; border-radius: 15px; border: 2px solid #f1c40f; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s;">
                        <span id="num-movs" style="font-family: 'Luckiest Guy', cursive; font-size: 1.3rem; color: #d32f2f;">${movimientosRestantes}</span>
                        <span style="font-family: 'Luckiest Guy', cursive; font-size: 0.9rem; color: #bcaaa4;">/4</span>
                    </div>
                `;

                // --- COLUMNA 3: Reloj de Tiempo (Con 's' minúscula y separada) ---
                const colTiempo = document.createElement('div');
                colTiempo.style.display = 'flex'; colTiempo.style.flexDirection = 'column'; colTiempo.style.alignItems = 'center';
                colTiempo.innerHTML = `
                    <span style="font-size: 0.65rem; color: #8D6E63; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">⏳ Tiempo</span>
                    <div id="caja-tiempo" style="background: #fff; padding: 4px 12px; border-radius: 15px; border: 2px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s; min-width: 45px; display: flex; align-items: baseline; justify-content: center;">
                        <span id="num-tiempo" style="font-family: 'Luckiest Guy', cursive; font-size: 1.3rem; color: #2980b9;">${tiempoRestante}</span>
                        <span style="font-family: 'Montserrat', sans-serif; font-size: 0.8rem; color: #2980b9; font-weight: bold; margin-left: 2px;">s</span>
                    </div>
                `;

                dashboardInfo.appendChild(colMeta);
                dashboardInfo.appendChild(colMovs);
                dashboardInfo.appendChild(colTiempo);
                puzzleWrapper.appendChild(dashboardInfo);

                // ==========================================
                // 3. EL TABLERO 2x2 
                // ==========================================
                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.width = '100%';
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                grid.style.gap = '3px';
                grid.style.aspectRatio = '1 / 1';
                grid.style.backgroundColor = '#5D4037';
                grid.style.padding = '5px';
                grid.style.border = '4px solid #4E342E';
                grid.style.borderRadius = '10px';
                grid.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
                grid.style.boxSizing = 'border-box';

                puzzleWrapper.appendChild(grid);

                const totalPiezas = 4;
                let piezas = [0, 1, 2, 3];
                let piezaSeleccionada = null;

                // Forzar que inicie desordenado
                do {
                    piezas.sort(() => Math.random() - 0.5);
                } while (piezas.every((valor, indice) => valor === indice));

                const renderizarPuzzle = () => {
                    grid.innerHTML = '';
                    piezas.forEach((indiceReal, indiceGrid) => {
                        const pieza = document.createElement('div');
                        pieza.style.width = '100%';
                        pieza.style.height = '100%';
                        pieza.style.backgroundImage = `url('${imagenPuzzle}')`;
                        pieza.style.backgroundRepeat = 'no-repeat';
                        pieza.style.backgroundSize = '200% 200%';
                        pieza.style.cursor = 'pointer';
                        pieza.style.borderRadius = '4px';
                        pieza.style.transition = 'transform 0.1s ease, filter 0.2s';

                        const fila = Math.floor(indiceReal / 2);
                        const col = indiceReal % 2;
                        pieza.style.backgroundPosition = `${col * 100}% ${fila * 100}%`;

                        // Estilo si está seleccionada
                        if (piezaSeleccionada === indiceGrid) {
                            pieza.style.outline = '4px solid #f1c40f';
                            pieza.style.outlineOffset = '-4px';
                            pieza.style.transform = 'scale(0.92)';
                            pieza.style.zIndex = '2';
                            pieza.style.filter = 'brightness(1.2)';
                        }

                        pieza.onclick = () => {
                            if (tiempoRestante <= 0 || movimientosRestantes <= 0) return; // Bloqueo si ya perdió

                            if (piezaSeleccionada === null) {
                                piezaSeleccionada = indiceGrid;
                                renderizarPuzzle();
                            } else if (piezaSeleccionada === indiceGrid) {
                                piezaSeleccionada = null;
                                renderizarPuzzle();
                            } else {
                                // Intercambio
                                const temp = piezas[piezaSeleccionada];
                                piezas[piezaSeleccionada] = piezas[indiceGrid];
                                piezas[indiceGrid] = temp;

                                movimientosRestantes--;

                                const textoMovs = document.getElementById('num-movs');
                                if (textoMovs) textoMovs.innerText = movimientosRestantes;

                                const cajaMovs = document.getElementById('caja-movimientos');
                                if (movimientosRestantes === 1 && cajaMovs) {
                                    cajaMovs.style.borderColor = '#c0392b';
                                    cajaMovs.style.animation = 'saltito 0.4s ease infinite alternate';
                                }

                                if (typeof audioManager !== 'undefined' && audioManager.playSFX) {
                                    audioManager.playSFX('assets/audio/click.mp3');
                                }

                                piezaSeleccionada = null;
                                renderizarPuzzle();

                                const gano = verificarVictoria();

                                if (!gano && movimientosRestantes <= 0) {
                                    setTimeout(() => {
                                        ejecutarDerrota("❌ Sin movimientos. Pierdes tu turno.");
                                    }, 400);
                                }
                            }
                        };
                        grid.appendChild(pieza);
                    });
                };

                // ==========================================
                // 💀 4. FUNCIÓN DE DERROTA
                // ==========================================
                const ejecutarDerrota = (mensaje) => {
                    clearInterval(temporizadorInterval);
                    grid.style.pointerEvents = 'none';
                    grid.style.filter = 'grayscale(100%)';

                    if (typeof audioManager !== 'undefined' && audioManager.playSFX) {
                        audioManager.playSFX('assets/audio/error.mp3');
                    }

                    mostrarToast(mensaje, "error");
                    setTimeout(() => {
                        ocultarModal();

                    }, 1800);
                };

                // ==========================================
                // ⏳ 5. EL BUCLE DEL TEMPORIZADOR
                // ==========================================
                temporizadorInterval = setInterval(() => {
                    tiempoRestante--;
                    const textoTiempo = document.getElementById('num-tiempo');
                    const cajaTiempo = document.getElementById('caja-tiempo');

                    // Actualizamos SOLAMENTE el número (la 's' está a salvo)
                    if (textoTiempo) textoTiempo.innerText = tiempoRestante;

                    // Alarma visual a los 5 segundos
                    if (tiempoRestante <= 5 && cajaTiempo && textoTiempo) {
                        cajaTiempo.style.borderColor = '#e74c3c';
                        textoTiempo.style.color = '#c0392b';
                        cajaTiempo.style.animation = 'saltito 0.3s ease infinite alternate';
                    }

                    if (tiempoRestante <= 0) {
                        clearInterval(temporizadorInterval);
                        ejecutarDerrota("⏳ ¡Se acabó el tiempo! Pierdes tu turno.");
                    }
                }, 1000);

                // ==========================================
                // 🏆 6. VICTORIA (AGREGAR AL INVENTARIO Y MOSTRAR IMAGEN)
                // ==========================================
                const verificarVictoria = () => {
                    const estaArmado = piezas.every((valor, indice) => valor === indice);

                    if (estaArmado) {
                        clearInterval(temporizadorInterval); // Detenemos el reloj
                        grid.style.pointerEvents = 'none';
                        grid.style.gap = '0px';
                        grid.style.border = '4px solid #27ae60';

                        if (typeof audioManager !== 'undefined' && audioManager.playSFX) {
                            audioManager.playSFX('assets/audio/success.mp3');
                        }

                        // 1. ELEGIR EL PREMIO (FIJO O ALEATORIO)
                        let premio = null;

                        if (typeof RECOMPENSAS_DATA !== 'undefined' && RECOMPENSAS_DATA.length > 0) {

                            // 🔥 Búsqueda 1 BLINDADA: Ignora espacios y mayúsculas
                            if (casillaData.recompensa_fija) {
                                const llaveBuscada = casillaData.recompensa_fija.toLowerCase().trim();
                                premio = RECOMPENSAS_DATA.find(r => r.key && r.key.toLowerCase().trim() === llaveBuscada);
                            }

                            // Búsqueda 2: Si no le pusiste premio fijo, le damos uno al azar como antes
                            if (!premio) {
                                const recompensasDelNivel = RECOMPENSAS_DATA.filter(r => r.nivel === 4);
                                const arrayPremios = recompensasDelNivel.length > 0 ? recompensasDelNivel : RECOMPENSAS_DATA;
                                premio = arrayPremios[Math.floor(Math.random() * arrayPremios.length)];
                            }
                        } else {
                            // Plan de emergencia si no hay datos
                            premio = { key: 'premio', src: '', nombre: 'Objeto Encontrado' };
                        }

                        // 2. SUMAR AL INVENTARIO DEL JUGADOR
                        const jugadorActual = getJugadorActual();
                        if (!gameState.inventarioPartida[jugadorActual.cedula]) {
                            gameState.inventarioPartida[jugadorActual.cedula] = {};
                        }

                        // Si no tenía este objeto antes, lo iniciamos en 0
                        if (!gameState.inventarioPartida[jugadorActual.cedula][premio.key]) {
                            gameState.inventarioPartida[jugadorActual.cedula][premio.key] = 0;
                        }

                        // Le sumamos 1 a la mochila y guardamos
                        gameState.inventarioPartida[jugadorActual.cedula][premio.key] += 1;
                        if (typeof guardarInventario === 'function') {
                            guardarInventario(jugadorActual.cedula);
                        }

                        // 3. PREPARAR LOS DATOS VISUALES
                        // Como en tu data.js usas "src", buscamos eso en lugar de "icono"
                        const visualPremio = premio.src
                            ? `<img src="${premio.src}" style="width: 80px; height: 80px; object-fit: contain;">`
                            : `<span style="font-size: 3.5rem;">🎁</span>`; // Regalo solo como plan B

                        const nombrePremio = premio.nombre || premio.key.toUpperCase();
                        const descripcionPremio = premio.accion || "¡Armaste el paisaje y encontraste esto!";

                        // 4. MOSTRAR EL MENSAJE DE VICTORIA
                        const overlayVictoria = document.createElement('div');
                        overlayVictoria.style.position = 'absolute';
                        overlayVictoria.style.top = '0'; overlayVictoria.style.left = '0';
                        overlayVictoria.style.width = '100%'; overlayVictoria.style.height = '100%';
                        overlayVictoria.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                        overlayVictoria.style.display = 'flex'; overlayVictoria.style.flexDirection = 'column';
                        overlayVictoria.style.justifyContent = 'center'; overlayVictoria.style.alignItems = 'center';
                        overlayVictoria.style.zIndex = '10'; overlayVictoria.style.opacity = '0';
                        overlayVictoria.style.transition = 'opacity 0.4s ease';
                        overlayVictoria.style.borderRadius = '10px';

                        overlayVictoria.innerHTML = `
                            <div style="animation: saltito 0.5s ease infinite alternate; margin-bottom: 10px;">${visualPremio}</div>
                            <h3 style="color: #27ae60; margin: 5px 0; font-family: 'Luckiest Guy', cursive; font-size: 1.5rem;">¡COMPLETADO!</h3>
                            <p style="color: #4E342E; font-weight: bold; font-size: 1.1rem; margin: 0; text-align: center;">+1 ${nombrePremio}</p>
                            <p style="color: #8D6E63; font-size: 0.9rem; margin: 5px 0 0 0; text-align: center; padding: 0 10px;">${descripcionPremio}</p>
                        `;

                        puzzleWrapper.appendChild(overlayVictoria);
                        setTimeout(() => { overlayVictoria.style.opacity = '1'; }, 50);

                        // 5. CERRAR Y REANUDAR TURNO (Sin alterar los movimientos de la partida)
                        setTimeout(() => {
                            mostrarToast(`¡Conseguiste: ${nombrePremio}!`, "success");
                            ocultarModal();

                        }, 2500);

                        return true;
                    }
                    return false;
                };

                renderizarPuzzle();
            }
            break;
        // ==============================================================
        //  CASE: LEYENDA (Solo Texto + Juego + Cierre Automático)
        // ==============================================================
        case 'leyenda':
            const PUNTOS_GANAR = 20;
            const PUNTOS_PERDER = 15;
            const TIEMPO_ESPERA_CIERRE = 3000; // 3 segundos

            modalTitle.textContent = casillaData.titulo;

            // 1. OCULTAR IMAGEN SIEMPRE (Petición del usuario)
            modalImg.style.display = 'none';
            modalImg.src = ''; // Limpiar source por seguridad

            // 2. Detectar Modo
            const esBusqueda = casillaData.icono_oculto ? true : false;

            // 3. Descripción e Instrucciones
            const instruccion = esBusqueda
                ? `<span style="color:#d84315;">${casillaData.instruccion || "Toca la vegetación (🌿) para descubrirlo."}</span>`
                : (casillaData.pregunta || "¿Qué decides hacer?");

            // Usamos un padding-top extra porque ya no hay imagen que ocupe espacio
            modalDesc.innerHTML = `
                <div style="text-align:center; color:#3e2723; font-family:'Georgia', serif; padding-top: 10px;">
                    <p style="font-style:italic; font-size:1.1rem; margin-bottom:15px; line-height:1.5;">
                        "${casillaData.historia}"
                    </p>
                    <hr style="border:0; border-top:1px dashed #8d6e63; opacity:0.5; margin:15px 0;">
                    <p style="font-weight:bold; font-size:1.15rem; margin-top:5px;">
                        ${instruccion}
                    </p>
                    <div id="resultado-leyenda" style="height: 30px; font-weight: bold; margin-top: 15px; font-family:sans-serif; transition: all 0.3s;"></div>
                </div>
            `;

            // Limpiamos contenedores
            optsContainer.innerHTML = '';
            optsContainer.className = '';
            optsContainer.style = '';
            btnContainer.innerHTML = '';

            // ============================================================
            // A) MODO BÚSQUEDA (Cartas horizontales)
            // ============================================================
            if (esBusqueda) {
                optsContainer.className = 'contenedor-leyenda-busqueda';

                let juegoTerminado = false;
                const posicionGanadora = Math.floor(Math.random() * 3);

                for (let i = 0; i < 3; i++) {
                    const carta = document.createElement('div');
                    carta.className = 'item-leyenda-busqueda';
                    carta.innerText = casillaData.icono_oculto || '🌿';

                    carta.onclick = () => {
                        if (juegoTerminado) return;
                        juegoTerminado = true;

                        const feedbackDiv = document.getElementById('resultado-leyenda');

                        if (i === posicionGanadora) {
                            // --- GANÓ ---
                            carta.classList.add('ganador');
                            carta.innerText = casillaData.icono_ganador || '🗿';
                            feedbackDiv.innerHTML = `<span style="color:#2e7d32; animation: popIn 0.3s; font-size:1.2rem;">✨ ¡LO ENCONTRASTE! (+${PUNTOS_GANAR})</span>`;
                            aplicarRecompensa({ puntos: PUNTOS_GANAR });
                        } else {
                            // --- PERDIÓ ---
                            carta.classList.add('perdedor');
                            carta.innerText = casillaData.icono_perdedor || '🐸';
                            feedbackDiv.innerHTML = `<span style="color:#c62828; animation: shake 0.3s; font-size:1.2rem;">😢 ¡Aquí no estaba! (-${PUNTOS_PERDER})</span>`;
                            aplicarRecompensa({ puntos: -PUNTOS_PERDER });

                            // Mostrar al verdadero semitransparente
                            const todas = document.querySelectorAll('.item-leyenda-busqueda');
                            if (todas[posicionGanadora]) {
                                todas[posicionGanadora].innerText = casillaData.icono_ganador || '🗿';
                                todas[posicionGanadora].style.opacity = '0.5';
                            }
                        }

                        // 🔥 CIERRE AUTOMÁTICO
                        cerrarModalAutomaticamente();
                    };
                    optsContainer.appendChild(carta);
                }
            }
            // ============================================================
            // B) MODO DECISIÓN (Botones verticales)
            // ============================================================
            else if (casillaData.opciones) {
                optsContainer.style.display = 'flex';
                optsContainer.style.flexDirection = 'column';
                optsContainer.style.gap = '10px';
                optsContainer.style.marginTop = '15px';

                let decisionTomada = false;

                casillaData.opciones.forEach((opcion) => {
                    const btn = document.createElement('button');
                    // Estilos manuales para botones
                    btn.style.background = '#5d4037';
                    btn.style.color = 'white';
                    btn.style.padding = '12px';
                    btn.style.border = 'none';
                    btn.style.borderRadius = '8px';
                    btn.style.fontSize = '1rem';
                    btn.style.fontWeight = 'bold';
                    btn.style.cursor = 'pointer';
                    btn.style.boxShadow = '0 4px 0 #3e2723';
                    btn.innerText = opcion.texto;

                    btn.onclick = () => {
                        if (decisionTomada) return;
                        decisionTomada = true;

                        const esCorrecto = opcion.correcto;
                        const puntos = esCorrecto ? PUNTOS_GANAR : -PUNTOS_PERDER;
                        const colorRes = esCorrecto ? '#2e7d32' : '#c62828';
                        const textoRes = esCorrecto ? '✨ ¡BIEN HECHO!' : '💀 ¡OH NO...';

                        aplicarRecompensa({ puntos: puntos });

                        // Feedback visual inmediato en el texto inferior
                        const feedbackDiv = document.getElementById('resultado-leyenda');
                        feedbackDiv.innerHTML = `<span style="color:${colorRes}; animation: popIn 0.3s; font-size:1.1rem;">${textoRes} ${esCorrecto ? '+' + PUNTOS_GANAR : '-' + PUNTOS_PERDER} Pts</span>`;

                        // Deshabilitar botones visualmente
                        const todosBotones = optsContainer.querySelectorAll('button');
                        todosBotones.forEach(b => {
                            b.style.opacity = '0.5';
                            b.style.cursor = 'not-allowed';
                        });
                        // Resaltar el elegido
                        btn.style.opacity = '1';
                        btn.style.background = colorRes;

                        // 🔥 CIERRE AUTOMÁTICO
                        cerrarModalAutomaticamente();
                    };
                    optsContainer.appendChild(btn);
                });
            }

            // --- FUNCIÓN AUXILIAR PARA CERRAR ---
            function cerrarModalAutomaticamente() {
                setTimeout(() => {
                    const jugador = getJugadorActual();
                    if (typeof window.reanudarMovimiento === 'function') {
                        window.reanudarMovimiento(jugador.id);
                    } else {
                        ocultarModal();
                    }
                }, TIEMPO_ESPERA_CIERRE);
            }
            break;

        case 'fin':
            console.log("🏁 Meta alcanzada. Reproduciendo video final obligatoriamente.");

            modalTitle.textContent = casillaData.titulo;

            // 1. Limpiamos la descripción para que solo se vea el video
            modalDesc.innerHTML = "";

            // 🔥 NUEVO: COBRAR EL "BONO DE VICTORIA" (Los 1000 puntos)
            // Esta línea asegura que el que llega, suma los puntos antes de que el juego termine.
            aplicarRecompensa(casillaData.recompensa);

            // 2. LLAMAMOS AL VIDEO FINAL
            manejarVideoIntro(() => {

                console.log("✅ Video final visto. Pasando a Resultados.");

                // A. Cerramos el modal del video
                ocultarModal();

                // B. Iniciamos la pantalla de puntuaciones
                terminarPartida();

            }, 'fin');
            break;

        default:
            modalTitle.textContent = casillaData.titulo;
            modalDesc.innerHTML = casillaData.descripcion;
            setTimeout(ocultarModal, 3000);
            break;
    }
    modal.style.display = 'flex';
}
// =========================================================
// 🚂 FUNCIÓN: COLOCAR TRENES COMO DECORACIÓN LIBRE (NIVEL 4)
// =========================================================
export function colocarTrenesEnEspera() {
    // 1. Validamos que estemos en el Nivel 4
    if (gameState.nivelSeleccionado !== 4) return;

    // 2. Buscamos el lienzo principal del mapa
    const tablero = document.getElementById('tablero-visual-juego');
    if (!tablero) return;

    // 3. 📍 COORDENADAS VISUALES EXACTAS (Sincronizadas con mechanics.js)
    // Tienen que ser idénticas al "Punto 0" de cada ruta animada
    const posicionesTrenes = [
        // 🔥 TRAMO 1: Exactamente el Punto 0 de tu primera ruta
        { id: 'tren_inicio', left: '73.45%', top: '24.03%', gif: 'tren_derecha.gif' }, 
        
        // 🔥 TRAMO 2: Exactamente el Punto 0 de tu segunda ruta
        { id: 'tren_medio',  left: '84.10%', top: '58.47%', gif: 'tren_izquierda.gif' },   
        
        // 🔥 TRAMO 3: Exactamente el Punto 0 de tu tercera ruta
        { id: 'tren_fin',    left: '53.69%', top: '55.20%', gif: 'tren_izquierda.gif' }  
    ];

    posicionesTrenes.forEach(tren => {
        // Evitamos duplicar
        if (document.getElementById(`tren-espera-${tren.id}`)) return;

        // 4. Creamos la imagen
        const trenImg = document.createElement('img');
        trenImg.id = `tren-espera-${tren.id}`;
        trenImg.className = 'tren-estacionado';
        
        // 🔥 Ojo a la ruta (usamos tu ruta con /nivel4/)
        trenImg.src = `assets/imagenes/gif/nivel4/${tren.gif}`; 
        
        // 5. Estilos para posicionarlo libremente sobre el mapa
        trenImg.style.position = 'absolute';
        trenImg.style.width = '60px';  
        trenImg.style.height = '60px'; 
        trenImg.style.objectFit = 'contain';
        
        // Posición X y Y
        trenImg.style.left = tren.left;
        trenImg.style.top = tren.top;
        
        // ✨ MAGIA: Esto obliga a que el centro de la imagen sea la coordenada exacta
       trenImg.style.transform = 'translate(-50%, -85%)';
        
        trenImg.style.zIndex = '5'; // Debajo de los jugadores, sobre el mapa
        trenImg.style.pointerEvents = 'none';

        // ¡Lo pegamos directo al tablero visual!
        tablero.appendChild(trenImg);
    });
}

function verificarRespuestaAleatoria(indiceElegido, indiceCorrecto, recompensaCasilla) {
    const jugador = getJugadorActual();

    // Referencias DOM
    const btnContainer = document.getElementById('modalButtons'); // Pie del modal
    const btnElegido = document.getElementById(`btn-opcion-${indiceElegido}`);
    const btnCorrecto = document.getElementById(`btn-opcion-${indiceCorrecto}`);
    const todosBotones = document.querySelectorAll('.opcion-boton');

    // 1. BLOQUEAR OPCIONES (Para que no cambie la respuesta)
    todosBotones.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
        btn.style.opacity = '0.6';
    });

    // Configurar Puntos
    let puntosGanados = 50;
    let puntosPerder = 30;

    if (typeof recompensaCasilla === 'object' && recompensaCasilla !== null) {
        puntosGanados = recompensaCasilla.puntos || 50;
    }

    // ==========================================
    // 🟢 CASO: CORRECTO (Gana Puntos)
    // ==========================================
    if (indiceElegido === indiceCorrecto) {

        // Estilo Verde al botón
        btnElegido.style.backgroundColor = '#dcedc8';
        btnElegido.style.border = '2px solid #33691e';
        btnElegido.style.color = '#33691e';
        btnElegido.style.opacity = '1';
        btnElegido.innerHTML += " ✅";

        // Guardar recompensa
        aplicarRecompensa({ puntos: puntosGanados, item: recompensaCasilla?.item || null });

        // 🔥 FEEDBACK CON BOTÓN "RECOLECTAR PUNTOS"
        btnContainer.innerHTML = `
            <div style="text-align:center; animation: fadeInUp 0.3s; width: 100%;">
                
                <h3 style="color:#2E7D32; margin:0 0 5px 0; font-size:1.1rem;">¡EXCELENTE!</h3>
                <p style="margin:0 0 10px 0; font-weight:bold; color: #1B5E20;">+${puntosGanados} Puntos</p>
                
                <button class="btn-imbabura" onclick="cerrarYContinuar(${jugador.id})">
                    ¡Recolectar Puntos!
                </button>
            </div>
        `;

    }
    // ==========================================
    // 🔴 CASO: INCORRECTO (Pierde Puntos)
    // ==========================================
    else {

        // Estilo Rojo al botón
        btnElegido.style.backgroundColor = '#ffcdd2';
        btnElegido.style.border = '2px solid #c62828';
        btnElegido.style.color = '#c62828';
        btnElegido.style.opacity = '1';
        btnElegido.innerHTML += " ❌";

        // Pista visual en la correcta
        if (btnCorrecto) {
            btnCorrecto.style.border = '2px dashed #4caf50';
            btnCorrecto.style.backgroundColor = '#f1f8e9';
            btnCorrecto.style.opacity = '0.9';
        }

        jugador.puntos -= puntosPerder;
        guardarProgresoJugador(jugador);



        // FEEDBACK CON BOTÓN "CONTINUAR"
        btnContainer.innerHTML = `
            <div style="text-align:center; animation: fadeInUp 0.3s; width: 100%;">
                
                <h3 style="color:#c62828; margin:0 0 5px 0; font-size:1.1rem;">¡INCORRECTO!</h3>
                <p style="margin:0 0 10px 0; font-weight:bold; color: #B71C1C;">-${puntosPerder} Puntos</p>
                
                <button class="btn-imbabura" style="background-color: #555;" onclick="cerrarYContinuar(${jugador.id})">
                    Continuar
                </button>
            </div>
        `;
    }
}



// ==========================================
// 🛠️ FUNCIÓN GLOBAL OBLIGATORIA PARA EL BOTÓN HTML
// ==========================================
window.cerrarYContinuar = function (jugadorId) {
    // 1. Ocultar el modal visualmente
    const modal = document.getElementById('gameModal');
    if (modal) modal.style.display = 'none';

    // 2. Controlar música
    if (typeof controlarMusicaFondo === 'function') {
        controlarMusicaFondo(false);
    }

    // 3. Reanudar movimiento o pasar turno
    if (typeof reanudarMovimiento === 'function') {
        reanudarMovimiento(jugadorId);
    } else if (typeof window.reanudarMovimiento === 'function') {
        window.reanudarMovimiento(jugadorId);
    } else {
        // Fallback
        avanzarTurno();
        actualizarInterfazPartida();
    }
};
function aplicarRecompensa(recompensa) {
    if (!recompensa) return;
    const jugador = getJugadorActual();

    // 1. PUNTOS: Se suman y se guardan en BD
    if (recompensa.puntos) {
        jugador.puntos += recompensa.puntos;
        // Guardamos en Firebase INMEDIATAMENTE
        guardarProgresoJugador(jugador);
    }

    // 2. ÍTEMS: Se suman y se guardan en BD
    if (recompensa.item) {
        const inv = gameState.inventarioPartida[jugador.cedula];
        inv[recompensa.item] = (inv[recompensa.item] || 0) + 1;

        // Guardamos Inventario en Firebase INMEDIATAMENTE
        guardarInventario(jugador.cedula);

        // 🔥🔥🔥 AQUÍ AGREGAS LA LÍNEA MÁGICA 🔥🔥🔥
        // Esto dispara la animación visual sin afectar la lógica de datos
        lanzarAnimacionItem(recompensa.item);
    }

    // Actualizar visualmente la tabla lateral
    actualizarInterfazPartida();
}

function manejarRespuesta(data, seleccion) {
    const opts = document.getElementById('modalOptionsContainer');
    const btns = opts.querySelectorAll('button');
    const desc = document.getElementById('modalDescription');

    // 🛑 1. BLOQUEO INMEDIATO
    btns.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'wait';
        btn.style.opacity = '0.6';
    });

    // ✨ 2. FEEDBACK VISUAL INSTANTÁNEO
    if (btns[seleccion]) {
        btns[seleccion].style.opacity = '1';
        btns[seleccion].style.border = '2px solid #333';
        btns[seleccion].innerText += ' ⏳...';
    }

    opts.classList.add('respuesta-revelada');

    // 🧠 3. LÓGICA DE VALIDACIÓN
    setTimeout(() => {
        const correcto = data.respuestaCorrecta;
        let res = {};
        let color = "";
        let icono = "";
        let esAcierto = false;

        // Quitamos el texto de carga temporal
        if (btns[seleccion]) {
            btns[seleccion].innerText = btns[seleccion].innerText.replace(' ⏳...', '');
            btns[seleccion].style.border = '';
        }

        if (seleccion === correcto) {
            // ======================================
            // ✅ A. RESPUESTA CORRECTA (+50)
            // ======================================
            esAcierto = true;
            res = data.recompensa.correcta;

            // Forzamos 50 puntos
            aplicarRecompensa({ puntos: 50, item: res.item });

            icono = "✅ ¡Correcto!";
            color = "#2E7D32";
            btns[seleccion].classList.add('opcion-correcta');

        } else {
            // ======================================
            // ❌ B. RESPUESTA INCORRECTA (-30)
            // ======================================
            esAcierto = false;
            res = data.recompensa.incorrecta;

            const jugador = getJugadorActual();
            // Forzamos resta de 30
            jugador.puntos -= 30;
            guardarProgresoJugador(jugador);

            icono = "❌ ¡Incorrecto!";
            color = "#D32F2F";
            btns[seleccion].classList.add('opcion-incorrecta');

            if (btns[correcto]) btns[correcto].classList.add('respuesta-correcta-final');
        }

        // 4. MOSTRAR RESULTADO FINAL Y BOTÓN CONTINUAR
        setTimeout(() => {
            opts.style.display = 'none'; // Ocultamos botones

            // 🔥 DISEÑO DEL MENSAJE FINAL
            desc.innerHTML = `
                <div style="text-align: center; animation: fadeIn 0.5s;">
                    <h3 style="color:${color}; margin: 0 0 10px 0;">${icono}</h3>
                    
                    <p style="font-size: 1.1rem; line-height: 1.5; margin-bottom: 15px;">
                        ${res.feedback}
                    </p>
                    
                    <div style="
                        background-color: ${esAcierto ? '#E8F5E9' : '#FFEBEE'}; 
                        border: 1px solid ${esAcierto ? '#A5D6A7' : '#EF9A9A'};
                        color: ${esAcierto ? '#1B5E20' : '#B71C1C'};
                        padding: 10px;
                        border-radius: 8px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: inline-block;
                        width: 100%;
                    ">
                        ${esAcierto ? '🎉 ¡GANASTE 50 PUNTOS!' : '⚠️ HAS PERDIDO 30 PUNTOS'}
                    </div>
                </div>
                <div id="contenedor-btn-pregunta" style="margin-top: 20px; text-align: center;"></div>
            `;

            const btnCerrar = document.createElement('button');
            btnCerrar.className = 'btn-modal-accion';
            btnCerrar.textContent = "CONTINUAR";
            btnCerrar.onclick = ocultarModal;

            const cont = document.getElementById('contenedor-btn-pregunta');
            if (cont) cont.appendChild(btnCerrar);

        }, 1000);

    }, 50);
}


// ==========================================
// MANEJAR EVENTO (TRAMPAS, VENTAJAS Y PREMIOS)
// ==========================================
function manejarEvento(data) {
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDescription');
    const modal = document.getElementById('gameModal');

    // Captura segura del jugador
    const jugador = getJugadorActual();
    if (!jugador) return;

    // Variables iniciales
    let mensajeFinal = "";
    let movimientoFinal = parseInt(data.movimiento || 0, 10);
    let tituloFinal = data.titulo || "Evento";
    let esDecision = false; // Bandera para saber si mostramos 2 botones
    // =========================================================
    // 1. TRAMPA DE ITEM (VERSIÓN DEFINITIVA)
    // =========================================================
    if (data.subtipo === 'trampa_item') {
        const inv = gameState.inventarioPartida[jugador.cedula] || {};
        const itemRequerido = data.condicionItem;

        if (inv[itemRequerido] && inv[itemRequerido] > 0) {
            tituloFinal = "😅 ¡Uff, cerca!";
            mensajeFinal = data.text_success;
            movimientoFinal = parseInt(data.move_success || 0, 10);

            if (data.itemLost) {
                inv[itemRequerido]--;
                if (inv[itemRequerido] < 0) inv[itemRequerido] = 0;
                guardarInventario(jugador.cedula);

                // 🔥 AHORA BUSCAMOS EXACTAMENTE POR 'key' Y 'src'
                let visualPremio = '';

                if (typeof RECOMPENSAS_DATA !== 'undefined') {
                    // Buscamos la coincidencia con la propiedad "key"
                    const recompensaEncontrada = RECOMPENSAS_DATA.find(r => r.key === itemRequerido);

                    if (recompensaEncontrada) {
                        // Extraemos la ruta de la imagen desde la propiedad "src"
                        visualPremio = recompensaEncontrada.src || '';
                    }
                }

                if (visualPremio) {
                    mensajeFinal += `
                        <div style="display: flex; flex-direction: column; align-items: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #eee;">
                            <img src="${visualPremio}" alt="${itemRequerido}" style="width: 60px; height: 60px; object-fit: contain; filter: grayscale(100%); opacity: 0.8; margin-bottom: 5px;">
                            <small style="color:#c0392b; font-weight: bold; font-size: 0.9rem; text-transform: uppercase;">¡Perdiste esta recompensa!</small>
                        </div>
                    `;
                } else {
                    mensajeFinal += `
                        <div style="margin-top: 15px; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
                            <small style="color:#c0392b; font-weight: bold;">(Perdiste: ${itemRequerido})</small>
                        </div>`;
                }

                if (window.playSound) window.playSound('error');
            } else {
                if (window.playSound) window.playSound('click');
            }
        } else {
            tituloFinal = "⚠️ ¡Oh no!";
            mensajeFinal = data.text_fail;
            movimientoFinal = parseInt(data.move_fail || 0, 10);
            if (window.playSound) window.playSound('error');
        }
    }
    // =========================================================
    // 2. VENTAJA
    // =========================================================
    else if (data.subtipo === 'ventaja_movimiento') {
        tituloFinal = `✨ ${data.titulo}`;
        mensajeFinal = `${data.descripcion}<br><strong style="color:green">🚀 Avanzas ${movimientoFinal} casillas</strong>`;
        if (window.playSound) window.playSound('success');
    }
    // =========================================================
    // VENTAJA MISTERIOSA: ELEGIR ENTRE 4 HUACAS
    // =========================================================
    else if (data.subtipo === 'ventaja_huacas') {
        const premios = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
        movimientoFinal = premios[0];

        tituloFinal = `🏺 ${data.titulo || 'El Montículo Misterioso'}`;

        let htmlHuacas = `
            <div style="text-align: center;">
                <p style="margin-bottom: 10px; font-size: 1.1rem; color: #444;">
                    ${data.descripcion || 'Encuentras 4 ollas de barro ancestrales.'}
                </p>
                
                <h4 id="instruccion-arriba" style="color: #E65100; margin: 15px 0; font-size: 1.2rem;">
                    👇 Selecciona tu huaca 👇
                </h4>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap;">
        `;

        for (let i = 0; i < 4; i++) {
            htmlHuacas += `
                <button id="huaca-${i}" style="font-size: 2.5rem; width: 70px; height: 80px; border-radius: 10px; border: 2px solid #8D6E63; background: #EFEBE9; cursor: pointer; transition: 0.3s;"
                        onclick="window.seleccionarHuaca(${i}, ${movimientoFinal}, [${premios}])">
                    🏺
                </button>
            `;
        }

        htmlHuacas += `
                </div>

                <div id="resultado-abajo" style="min-height: 30px; margin-top: 15px;"></div>
            </div>
        `;

        mensajeFinal = htmlHuacas;

        setTimeout(() => {
            const btnCont = document.getElementById('btnContainer');
            if (btnCont) btnCont.style.display = 'none';
        }, 50);

        if (window.playSound) window.playSound('success');
    }



    // =========================================================
    // 3. DECISIÓN DE TRAMPA (NUEVO)
    // =========================================================
    else if (data.subtipo === 'decision_trampa') {
        esDecision = true;
        tituloFinal = data.titulo;
        mensajeFinal = data.descripcion;
        // No restamos puntos ni movemos todavía; eso sucede al hacer clic en las opciones.
        if (window.playSound) window.playSound('error'); // Sonido de alerta opcional
    }
    // =========================================================
    // 4. EVENTO ESTÁNDAR
    // =========================================================
    else {
        mensajeFinal = data.descripcion;
        if (data.pointsGained) jugador.puntos += parseInt(data.pointsGained);
        if (data.pointsLost) jugador.puntos -= parseInt(data.pointsLost);
        if (movimientoFinal < 0 && window.playSound) window.playSound('error');
        guardarProgresoJugador(jugador);
    }







    // =========================================================
    // RENDERIZADO DE TEXTOS
    // =========================================================
    title.textContent = tituloFinal;
    desc.innerHTML = `<div style="margin-bottom:20px;">${mensajeFinal}</div><div id="contenedor-btn-accion" style="display:flex; flex-direction:column; gap:10px; align-items:center;"></div>`;

    const contenedorBtn = document.getElementById('contenedor-btn-accion');
    contenedorBtn.innerHTML = '';

    // =========================================================
    // FUNCIÓN INTERNA: PROCESAR FIN DEL EVENTO
    // (Evita repetir código entre los diferentes botones)
    // =========================================================
    const procesarFinDeEvento = (movFinal) => {
        // 1. Ocultar modal visualmente
        modal.style.display = 'none';
        if (typeof controlarMusicaFondo === 'function') controlarMusicaFondo(false);

        // 2. DECISIÓN DE MOVIMIENTO
        if (movFinal > 0) {
            animarMovimiento(jugador.id, movFinal, gameState.limiteCasillasActual);
        } else if (movFinal < 0) {
            let nuevaPos = jugador.posicion + movFinal;
            if (nuevaPos < 0) nuevaPos = 0;

            jugador.posicion = nuevaPos;
            moverFicha(jugador.id, jugador.posicion);
            guardarProgresoJugador(jugador);

            console.log("🔙 Retroceso completado. Reactivando controles...");

            avanzarTurno();

            const btnDado = document.getElementById('boton-dado');
            if (btnDado) {
                btnDado.disabled = false;
                btnDado.innerText = "TIRAR DADOS";
                btnDado.classList.add('animacion-latido');
                setTimeout(() => btnDado.classList.remove('animacion-latido'), 2000);
            }

            actualizarInterfazPartida();
        } else {
            avanzarTurno();
            const btnDado = document.getElementById('boton-dado');
            if (btnDado) {
                btnDado.disabled = false;
                btnDado.innerText = "TIRAR DADOS";
            }
            actualizarInterfazPartida();
        }
    };

    // =========================================================
    // CREACIÓN DE BOTONES (Dinámico según el tipo)
    // =========================================================
    if (esDecision) {
        // --- BOTÓN OPCIÓN A ---
        const btnA = document.createElement('button');
        btnA.className = 'btn-modal-accion';
        // Agregamos un poco de estilo inline para diferenciar que son opciones
        btnA.style.width = '100%';
        btnA.innerHTML = `<strong>${data.opcionA.texto}</strong>`;

        btnA.onclick = function () {
            // Aplicar consecuencias de A
            if (data.opcionA.puntos) {
                jugador.puntos += parseInt(data.opcionA.puntos);
            }
            guardarProgresoJugador(jugador);
            procesarFinDeEvento(parseInt(data.opcionA.mov || 0));
        };

        // --- BOTÓN OPCIÓN B ---
        const btnB = document.createElement('button');
        btnB.className = 'btn-modal-accion';
        btnB.style.width = '100%';
        btnB.style.backgroundColor = '#d32f2f'; // Color rojo para diferenciar la alternativa (opcional)
        btnB.innerHTML = `<strong>${data.opcionB.texto}</strong>`;

        btnB.onclick = function () {
            // Aplicar consecuencias de B
            if (data.opcionB.puntos) {
                jugador.puntos += parseInt(data.opcionB.puntos);
            }
            guardarProgresoJugador(jugador);
            procesarFinDeEvento(parseInt(data.opcionB.mov || 0));
        };

        contenedorBtn.appendChild(btnA);
        contenedorBtn.appendChild(btnB);

    } else {
        // --- BOTÓN CONTINUAR NORMAL ---
        const btnEntendido = document.createElement('button');
        btnEntendido.className = 'btn-modal-accion';
        btnEntendido.textContent = "CONTINUAR";

        btnEntendido.onclick = function () {
            procesarFinDeEvento(movimientoFinal);
        };
        contenedorBtn.appendChild(btnEntendido);
    }

    // Mostrar el modal
    modal.style.display = 'flex';
}
// =========================================================
// FUNCIÓN PARA REVELAR LA HUACA
// =========================================================
window.seleccionarHuaca = function (indexSeleccionado, premioGanado, todosLosPremios) {
    // 1. Ocultamos la instrucción de arriba para limpiar la pantalla
    const instruccionArriba = document.getElementById('instruccion-arriba');
    if (instruccionArriba) {
        instruccionArriba.style.display = 'none';
    }

    // 2. ¡AQUÍ ESTÁ EL CAMBIO! Ponemos el mensaje de victoria ABAJO de las huacas
    const resultadoAbajo = document.getElementById('resultado-abajo');
    if (resultadoAbajo) {
        resultadoAbajo.innerHTML = `<h4 style="color: #2E7D32; font-size: 1.2rem; margin: 0;">¡Increíble! Has ganado un impulso de <strong>+${premioGanado} casillas</strong>.</h4>`;
    }

    // 3. Modificamos los botones de las huacas
    let premioFalsoIndex = 1;

    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`huaca-${i}`);
        if (btn) {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';

            if (i === indexSeleccionado) {
                btn.style.background = '#FFE0B2';
                btn.style.border = '2px solid #E65100';
                btn.innerHTML = `<span style="font-size: 1.8rem;">🏺</span><br><span style="font-size: 1.1rem; font-weight: bold; color: #E65100;">+${premioGanado}</span>`;
            } else {
                btn.style.opacity = '0.6';
                btn.style.background = '#f5f5f5';
                btn.innerHTML = `<span style="font-size: 1.2rem;">🏺</span><br><span style="font-size: 0.9rem; color: #888;">+${todosLosPremios[premioFalsoIndex]}</span>`;
                premioFalsoIndex++;
            }
        }
    }

    // 4. Mostramos tu botón original de Continuar
    const btnCont = document.getElementById('btnContainer');
    if (btnCont) {
        btnCont.style.display = 'block';
    }

    if (window.playSound) window.playSound('success');
};
// ==========================================
// 6. SCOREBOARD (UI)
// ==========================================


export function actualizarInterfazPartida() {
    const jugador = getJugadorActual();
    if (!jugador) return;

    // 1. Resaltar turno en la lista
    document.querySelectorAll('.jugador-score-partida').forEach((el, idx) => {
        el.classList.remove('turno-activo');
        if (idx + 1 === gameState.turnoActual) el.classList.add('turno-activo');
    });

    // 2. Actualizar nombre en los controles
    const nombreDisplay = document.getElementById('nombre-jugador-turno');
    if (nombreDisplay) nombreDisplay.innerText = jugador.nombre.split(" ")[0];

    // 3. Renderizar Recompensas (Items en la barra lateral)
    renderizarRecompensas(jugador.cedula);

    // ✅ 4. RENDERIZAR PUNTAJE (Aquí se verán los puntos nuevos y la animación)
    // Al llamarse esto SOLO al cerrar el modal, el usuario verá el cambio justo en ese momento.
    renderizarScorePartida();
}

/// ==========================================
// EN ARCHIVO: js/game.js
// ==========================================

export function renderizarScorePartida() {
    const container = document.getElementById('score-partida-container');
    if (!container) return;

    container.innerHTML = '';
    const label = document.getElementById('label-nivel');
    if (label) label.innerText = `Ruta Nivel ${gameState.nivelSeleccionado}`;

    // 🔥 1. IDENTIFICAR AL JUGADOR ACTIVO POR SU ID (NO POR ÍNDICE)
    const jugadorActivo = getJugadorActual();

    gameState.jugadoresPartida.forEach((j) => {

        // --- Memoria de Puntos y Animaciones (Tu código anterior) ---
        if (typeof j.puntosAnteriores === 'undefined') j.puntosAnteriores = j.puntos;

        let claseAnimacionPuntos = '';
        if (j.puntos !== j.puntosAnteriores) {
            if (j.puntos > j.puntosAnteriores) {
                claseAnimacionPuntos = 'animacion-ganar';
                if (window.playSound) window.playSound('success');
            } else {
                claseAnimacionPuntos = 'animacion-perder';
                if (window.playSound) window.playSound('error');
            }
        }
        j.puntosAnteriores = j.puntos;

        // --- Renderizado de Items (Tu código anterior) ---
        if (typeof j.inventarioAnterior === 'undefined') j.inventarioAnterior = {};
        const invActual = gameState.inventarioPartida[j.cedula] || {};
        let itemsHtml = '';

        Object.keys(invActual).forEach(key => {
            const cantidadHoy = invActual[key];
            if (cantidadHoy > 0) {
                const cantidadAyer = j.inventarioAnterior[key] || 0;
                let claseAnimItem = '';
                if (cantidadHoy > cantidadAyer) claseAnimItem = 'animacion-item-nuevo';

                const data = RECOMPENSAS_DATA.find(r => r.key === key);
                if (data) {
                    itemsHtml += `
                    <div class="recompensa-item-wrapper ${claseAnimItem}">
                        <div class="recompensa-icono-miniatura" style="background-image: url('${data.src}'); background-color: ${data.color};">
                            <span class="recompensa-contador-badge">${cantidadHoy}</span>
                        </div>
                    </div>`;
                }
            }
        });
        j.inventarioAnterior = { ...invActual };

        // --- 🎨 RENDERIZADO DE LA TARJETA ---
        const div = document.createElement('div');
        div.className = 'jugador-score-partida';

        // 🔥 CORRECCIÓN AQUÍ: Comparamos Cédulas (IDs únicos), no índices.
        // Esto asegura que si es el turno de "Juan", se marque "Juan" sin importar el orden.
        if (jugadorActivo && j.cedula === jugadorActivo.cedula) {
            div.classList.add('turno-activo');
        }

        div.innerHTML = `
        <div class="score-cabecera">
            <div class="ficha-wrapper">
                <img src="assets/imagenes/fichas/ficha_${j.fichaId}.png">
            </div>
            <div class="info-jugador">
                <span class="nombre-jugador">${j.nombre.split(" ")[0]}</span>
                <div class="puntos-badge ${claseAnimacionPuntos}">
                    ${j.puntos} Pts
                </div>
            </div>
        </div>
        <div class="inventario-fila-inferior">
            ${itemsHtml}
        </div>`;

        container.appendChild(div);

        // Limpieza de animaciones
        if (claseAnimacionPuntos !== '' || itemsHtml.includes('animacion-item-nuevo')) {
            setTimeout(() => {
                const badge = div.querySelector('.puntos-badge');
                if (badge) badge.classList.remove('animacion-ganar', 'animacion-perder');
                const items = div.querySelectorAll('.recompensa-item-wrapper');
                items.forEach(it => it.classList.remove('animacion-item-nuevo'));
            }, 1500);
        }
    });
}

function renderizarRecompensas(cedula) {
    const container = document.getElementById('recompensas-container');
    if (!container) return;
    container.innerHTML = '';
    const inv = gameState.inventarioPartida[cedula] || {};
    let slots = 0;

    Object.keys(inv).forEach(key => {
        if (inv[key] > 0 && slots < 6) {
            const data = RECOMPENSAS_DATA.find(r => r.key === key);
            if (data) {
                container.innerHTML += `<div class="recompensa-slot recompensa-slot-lleno" style="background: ${data.color};"><img src="${data.src}"><span class="recompensa-contador-badge">${inv[key]}</span></div>`;
                slots++;
            }
        }
    });
    while (slots < 6) {
        container.innerHTML += `<div class="recompensa-slot recompensa-slot-vacio"></div>`;
        slots++;
    }
}

// ==========================================
// ==========================================
// 🧮 CÁLCULO AUTOMÁTICO DE BONOS (SIN CLIC)
// ==========================================
function calcularBonosSilenciosamente() {
    // Tus datos de configuración
    const VALORES = {
        'helado': 10, 'arbol': 20, 'poncho': 30, 'canoa': 40, 'algodon': 50,
        'cascada': 10, 'piscina': 20, 'silla': 30, 'sendero': 40, 'volcan': 50, 'petroglifo': 60,
        'caraintag': 10, 'cascadaconrayaro': 20, 'cuychaltura': 30, 'cascadataxopamba': 40, 'molinodepiedra': 50, 'canadeazucar': 60,
        'terrazacahuasqui': 10, 'frutastrueque': 20, 'columpiovertigo': 30, 'complejovolcanico': 40, 'lagosanpablo': 50, 'ollabarrogualiman': 60,
    };
    const normalizar = (txt) => txt.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Recorremos a todos los jugadores
    gameState.jugadoresPartida.forEach(j => {
        const inv = gameState.inventarioPartida[j.cedula] || {};
        let bono = 0;

        // Sumar valor de cada item del inventario
        Object.keys(inv).forEach(k => {
            const kn = normalizar(k);
            if (inv[k] > 0 && VALORES[kn]) {
                bono += inv[k] * VALORES[kn];
            }
        });

        // 🔥 ACTUALIZAMOS LA MEMORIA AL INSTANTE
        j.puntos_base = j.puntos;         // Guardamos los puntos del tablero
        j.puntos_bono = bono;             // Guardamos cuánto ganó en premios
        j.puntos = j.puntos + bono;       // SUMAMOS EL TOTAL FINAL
    });

    console.log("💰 Bonos calculados y sumados automáticamente.");
}
// ==========================================
// 🏆 MODAL VICTORIA (CON NOMBRES ORTOGRÁFICOS)
// ==========================================
export function mostrarModalVictoria() {
    console.log("🏆 Calculando desglose detallado...");

    const modal = document.getElementById('modal-victoria');
    const contenedorLista = document.getElementById('vic-lista-jugadores');
    const titulo = document.getElementById('vic-titulo');

    if (!modal || !contenedorLista) return;

    // 1. Ordenar por puntaje
    const ranking = [...gameState.jugadoresPartida].sort((a, b) => b.puntos - a.puntos);
    const ganador = ranking[0];

    // 2. CONFIGURACIÓN
    const VALORES = {
        'helado': 10, 'arbol': 20, 'poncho': 30, 'canoa': 40, 'algodon': 50,
        'cascada': 10, 'piscina': 20, 'silla': 30, 'sendero': 40, 'volcan': 50, 'petroglifo': 60,
        'caraintag': 10, 'cascadaconrayaro': 20, 'cuychaltura': 30, 'cascadataxopamba': 40, 'molinodepiedra': 50, 'canadeazucar': 60,
        'terrazacahuasqui': 10, 'frutastrueque': 20, 'columpiovertigo': 30, 'complejovolcanico': 40, 'lagosanpablo': 50, 'ollabarrogualiman': 60,
    };
    const ICONO_DEFAULT = 'assets/imagenes/fichas/ficha_1.png';

    // 🔥 DICCIONARIO PARA CORREGIR ORTOGRAFÍA VISUAL
    // Clave (Tu código) : Valor (Lo que ve el usuario)
    const NOMBRES_MOSTRAR = {
        'helado': 'Helado',
        'arbol': 'Árbol',
        'poncho': 'Poncho',
        'canoa': 'Canoa',
        'algodon': 'Algodón',
        'cascada': 'Cascada Peguche',
        'piscina': 'Piscina',
        'Silla': 'Silla de montar',
        'sendero': 'Sendero',
        'volcan': 'Volcán',
        'petroglifo': 'Petroglifo',
        'caraintag': 'Cara del Dios Intag',
        'cascadaconrayaro': 'Cascada Conrayaro',
        'cuychaltura': 'Cuy de Chaltura',
        'cascadataxopamba': 'Cascada Taxopamba',
        'molinodepiedra': 'Molino de Piedra',
        'canadeazucar': 'Caña de Azúcar',
        //nivel 4
        'terrazacahuasqui': 'Terraza de Cahuasquí',
        'frutastrueque': 'Frutas',
        'columpiovertigo': 'Columpio',
        'complejovolcanico': 'Volcán Imbabura',
        'lagosanpablo': 'Lago de San Pablo',
        'ollabarrogualiman': 'Olla de barro de Gualimán',



    };

    const normalizar = (txt) => txt ? txt.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    titulo.innerHTML = `¡VICTORIA PARA <span style="color:#FFF8E1">${ganador.nombre.split(" ")[0]}</span>!`;
    contenedorLista.innerHTML = '';

    // 3. Generar Tarjetas
    ranking.forEach((jugador, index) => {
        const esGanador = (index === 0);
        const medalla = esGanador ? '🥇' : (index === 1 ? '🥈' : '🥉');

        let totalPuntosItems = 0;
        let listaItemsHTML = '';

        const inv = gameState.inventarioPartida[jugador.cedula] || {};

        Object.keys(inv).forEach(k => {
            const kn = normalizar(k); // ej: "algodon"
            const cantidad = inv[k];

            if (cantidad > 0 && VALORES[kn]) {
                const valorUnitario = VALORES[kn];
                const subtotal = cantidad * valorUnitario;

                // 🔥 AQUÍ USAMOS EL DICCIONARIO DE NOMBRES BONITOS
                // Si existe en el diccionario lo usa (ej: "Algodón"), si no, usa el normal capitalizado.
                const nombreItem = NOMBRES_MOSTRAR[kn] || (k.charAt(0).toUpperCase() + k.slice(1));

                // Lógica de búsqueda de imagen (INTACTA)
                let src = ICONO_DEFAULT;
                if (typeof RECOMPENSAS_DATA !== 'undefined' && Array.isArray(RECOMPENSAS_DATA)) {
                    const encontrado = RECOMPENSAS_DATA.find(item => normalizar(item.key) === kn);
                    if (encontrado && encontrado.src) src = encontrado.src;
                }

                totalPuntosItems += subtotal;

                listaItemsHTML += `
                    <div class="item-subfila">
                        <div class="it-left">
                            <img src="${src}" alt="${nombreItem}" onerror="this.src='${ICONO_DEFAULT}'">
                            <span class="it-nom">${cantidad} x ${nombreItem}</span>
                        </div>
                        <span class="it-pts">+${subtotal}</span>
                    </div>
                `;
            }
        });

        if (listaItemsHTML === '') {
            listaItemsHTML = `<div class="item-subfila vacio">Sin items recolectados</div>`;
        }

        const puntosMeta = esGanador ? 500 : 0;
        let puntosRuta = jugador.puntos - totalPuntosItems - puntosMeta;

        const cardHTML = `
            <div class="vic-card ${esGanador ? 'ganador' : ''}">
                <div class="vic-col-left">
                    <div class="vic-posicion">${medalla}</div>
                    <div class="vic-avatar">
                        <img src="assets/imagenes/fichas/ficha_${jugador.fichaId}.png">
                    </div>
                </div>

                <div class="vic-info-detallada">
                    <h3>${jugador.nombre}</h3>
                    
                    <div class="tabla-desglose">
                        <div class="grupo-items">
                            <div class="titulo-grupo">🎒 Inventario de recompensas recolectadas:</div>
                            ${listaItemsHTML}
                            <div class="subtotal-grupo">Subtotal Items: <strong>+${totalPuntosItems}</strong></div>
                        </div>

                        <div class="fila-resumen">
                            <span class="lbl">👣 Ruta Recorrida:</span>
                            <span class="val">+${puntosRuta}</span>
                        </div>

                        ${esGanador ? `
                        <div class="fila-resumen meta">
                            <span class="lbl">🏁 Bono Meta:</span>
                            <span class="val">+${puntosMeta}</span>
                        </div>` : ''}
                    </div>
                </div>
                
                <div class="vic-total-container">
                    <small>TOTAL</small>
                    <div class="vic-puntos-final">${jugador.puntos}</div>
                </div>
            </div>
        `;
        contenedorLista.innerHTML += cardHTML;
    });

    modal.style.display = 'flex';
    if (window.playSound) window.playSound('success');
    if (window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}
// ==========================================
// ARCHIVO: js/game.js (OPTIMIZADO: SIN ESPERAS)
// ==========================================
export async function terminarPartida() {
    console.log("🏁 Meta alcanzada.");

    // 1. Limpieza visual INMEDIATA
    document.getElementById('panel-derecho').style.display = 'none';
    document.getElementById('contenedor-mapa').style.display = 'none';
    if (audioManager && audioManager.playBGM) audioManager.playBGM();

    // 2. CÁLCULO INTERNO (Esto es instantáneo, milisegundos)
    calcularBonosSilenciosamente();

    // =========================================================
    // 🚀 CAMBIO CLAVE: GUARDADO EN SEGUNDO PLANO
    // =========================================================
    // Quitamos la palabra 'await'.
    // Esto lanza el proceso de guardado pero NO detiene el juego.
    // El juego sigue corriendo mientras Firebase trabaja en el fondo.
    ejecutarGuardadoSilencioso();

    // =========================================================
    // 📝 MOSTRAR QUIZ DE INMEDIATO
    // =========================================================
    console.log("⚡ Iniciando Quiz sin esperas...");

    iniciarQuiz('final', async () => {
        console.log("✅ Quiz final terminado.");
        mostrarModalVictoria(); // <--- NUEVA FUNCIÓN
    });
}

// 👇 FUNCIÓN AUXILIAR PARA QUE EL CÓDIGO SE VEA ORDENADO
async function ejecutarGuardadoSilencioso() {
    console.log("💾 Iniciando respaldo en la nube (Segundo plano)...");

    try {
        const rankingAdmin = [...gameState.jugadoresPartida].sort((a, b) => b.puntos - a.puntos);

        // Creamos una lista de tareas para enviarlas todas juntas
        const promesasDeGuardado = rankingAdmin.map((j, i) => {
            const desglose = { base: j.puntos_base || 0, bono: j.puntos_bono || 0 };
            return guardarCierrePartida(j.cedula, i + 1, j.puntos, desglose);
        });

        // Agregamos el guardado de niveles desbloqueados
        promesasDeGuardado.push(guardarPuntosFinales());

        // Esperamos a que todo termine (pero el usuario ya está jugando el quiz)
        await Promise.all(promesasDeGuardado);
        console.log("✅ ¡Todo guardado exitosamente en Firebase!");

    } catch (error) {
        console.error("⚠️ Error en guardado de fondo:", error);
    }
}

export function mostrarPestana(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('activo'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('activo'));
    document.getElementById(`tab-${tabId}`).classList.add('activo');
    if (event && event.target) event.target.classList.add('activo');
}



// ==========================================
// 8. INICIALIZACIÓN Y EVENTOS (DOM LOADED)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🎮 Game.js cargado.");

    cargarRankingGlobal();

    // Botones de Registro (Jugador 1, 2, 3)
    [1, 2, 3].forEach(n => {
        const b = document.getElementById(`btn-jugador-${n}`);
        if (b) b.addEventListener("click", () => prepararPantallaRegistro(n));
    });

    const btnAdmin = document.getElementById("btn-admin");
    if (btnAdmin) btnAdmin.addEventListener("click", accesoAdmin);

    // ============================================================
    // 🔥 NUEVO: CONECTAR EL DADO CON EL RELOJ DE FERIA
    // ============================================================
    const btnDado = document.getElementById('boton-dado');
    if (btnDado) {
        // Escuchamos el clic en el botón del dado
        btnDado.addEventListener('click', () => {
            // Llamamos a la función del reloj.
            // Ella sola revisa si es la primera vez. Si ya está corriendo, no hace nada.
            intentarIniciarRelojFeria();
        });
    }
});


// ==========================================
// 9. PROTECCIÓN CONTRA SALIDA ACCIDENTAL
// ==========================================

window.addEventListener('beforeunload', (e) => {
    // Verificamos si el juego está activo (si el mapa se ve)
    const mapaVisible = document.getElementById('contenedor-mapa').style.display !== 'none';
    const seleccionVisible = document.getElementById('pantalla-personaje').style.display !== 'none';

    // Solo protegemos si ya están jugando o eligiendo ficha
    if (mapaVisible || seleccionVisible) {
        // Estándar moderno: previene la salida directa y muestra la alerta del navegador
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
    // Si están en el menú principal (registro), dejamos que salgan sin molestar.
});

// ==========================================
// 9. LÓGICA DE SALIDA (MODAL BONITA)
// ==========================================

export function confirmarSalida() {
    // En lugar de window.confirm, mostramos nuestra modal
    const modal = document.getElementById('modal-salida');
    if (modal) {
        modal.style.display = 'flex'; // Muestra la ventana
    }
}

// Lógica interna para los botones de la modal (Se activa al cargar)
document.addEventListener("DOMContentLoaded", () => {

    // 1. Botón "Cancelar" (Seguir jugando)
    const btnCancelar = document.getElementById('btn-cancelar-salida');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            document.getElementById('modal-salida').style.display = 'none'; // Oculta la ventana
        });
    }

    // 2. Botón "Salir" (Reiniciar de verdad)
    const btnSalir = document.getElementById('btn-confirmar-salida');
    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            window.location.reload(); // Recarga la página
        });
    }

    // Opcional: Cerrar si hacen clic fuera de la cajita blanca
    const modal = document.getElementById('modal-salida');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
});
// Exponer para el HTML
window.confirmarSalida = confirmarSalida;

//---------------------------RELOJ TIEMPO DE JUEGO------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------
// =========================================================
// 🎡 VARIABLES GLOBALES (Pégalas arriba, después de los imports)
// =========================================================
let modoFeriaActivo = false;       // ¿Está activado?
let tiempoRestanteSegundos = 0;    // Cuenta regresiva
let intervaloReloj = null;         // El proceso del reloj
let primerLanzamientoHecho = false; // ¿Ya lanzaron el dado?

// =========================================================
// 🛠️ FUNCIONES DEL RELOJ (Pégalas antes de 'seleccionarFicha')
// =========================================================

// 1. Configurar el reloj (se llama desde seleccionarFicha)
export async function prepararModoFeria(minutosRecibidos = null) {
    let minutos = minutosRecibidos;

    // Si no recibimos minutos, intentamos leer de BD por seguridad
    if (minutos === null) {
        try {
            const docRef = doc(db, "configuracion_tiempodejuego", "ajustes_globales");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().modo_feria) {
                minutos = docSnap.data().tiempo_limite;
            } else {
                return; // No hay feria
            }
        } catch (e) { console.error(e); return; }
    }

    console.log(`⏱️ Configurando reloj visual para ${minutos} minutos...`);

    // Asignamos valores a las variables globales
    modoFeriaActivo = true;
    tiempoRestanteSegundos = (minutos || 5) * 60;

    // Mostramos la cajita
    const cajaReloj = document.getElementById('contenedor-reloj-feria');
    if (cajaReloj) {
        cajaReloj.style.display = 'flex';
        actualizarDisplayVisual(tiempoRestanteSegundos);
    }
}

// 2. Actualizar números en pantalla
function actualizarDisplayVisual(segundos) {
    const display = document.getElementById('timer-display');
    const caja = document.getElementById('contenedor-reloj-feria');

    if (!display) return;

    const m = Math.floor(segundos / 60);
    const s = segundos % 60;

    // Formato 00:00
    display.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;

    // Alerta visual (último minuto)
    if (segundos < 60 && caja) {
        caja.classList.add('peligro');
    }
}

// 3. Iniciar cuenta regresiva (Llamar al lanzar dado)
export function intentarIniciarRelojFeria() {
    // Solo inicia si hay feria, no ha empezado y hay tiempo
    if (modoFeriaActivo && !primerLanzamientoHecho && tiempoRestanteSegundos > 0) {

        console.log("🚀 Primer lanzamiento detectado: ¡CORRE TIEMPO!");
        primerLanzamientoHecho = true;

        intervaloReloj = setInterval(() => {
            tiempoRestanteSegundos--;
            actualizarDisplayVisual(tiempoRestanteSegundos);

            if (tiempoRestanteSegundos <= 0) {
                clearInterval(intervaloReloj);
                finalizarPorTiempo();
            }
        }, 1000);
    }
}

// ==========================================
// 4. FIN DEL JUEGO POR TIEMPO (CON MENSAJE TOAST)
// ==========================================
function finalizarPorTiempo() {
    // 0. 🛑 FRENO DE EMERGENCIA: Bloqueamos futuros eventos del tablero
    gameState.juegoTerminado = true;

    // 1. Detenemos el reloj
    clearInterval(intervaloReloj);
    const display = document.getElementById('timer-display');
    if (display) display.innerText = "00:00";

    // 2. Cerramos cualquier modal del tablero que esté abierto o intentando abrirse
    if (typeof ocultarModal === 'function') {
        ocultarModal();
    }

    // 3. Mensaje flotante elegante
    mostrarToast("⏰ ¡TIEMPO TERMINADO! Pasando al Quiz Final...", "info");
    console.log("⏰ Tiempo agotado. Ejecutando cierre de partida...");

    // 4. Transición final (Le damos 1.5 segundos para que lean el Toast y termine de moverse la ficha)
    setTimeout(() => {
        terminarPartida();
    }, 1500);
}
//-------------------------------------------------------------------------------------------------------------------
//------------------------------MINI JUEGO-------------------------------------------------------------------
window.resolverMinijuegoImagenes = function (indiceElegido, datosCasilla) {
    const cards = document.querySelectorAll('.card-minijuego');

    // 1. BLOQUEO INMEDIATO
    cards.forEach(c => c.style.pointerEvents = 'none');

    if (indiceElegido === datosCasilla.indiceCorrecto) {
        // ==========================================
        // ✅ ACIERTO (+20 Puntos)
        // ==========================================
        cards[indiceElegido].style.backgroundColor = "#c8e6c9";
        cards[indiceElegido].style.borderColor = "#2e7d32";

        // Premio Fijo
        const PREMIO = { puntos: 20 };
        aplicarRecompensa(PREMIO);

        mostrarToast("✨ ¡Correcto! +20 Puntos");

        setTimeout(ocultarModal, 1000);

    } else {
        // ==========================================
        // ❌ ERROR (-15 Puntos)
        // ==========================================
        cards[indiceElegido].style.backgroundColor = "#ffcdd2";
        cards[indiceElegido].style.borderColor = "#c62828";
        cards[indiceElegido].style.transform = "shake 0.5s";

        // Revelar la correcta visualmente (Opcional, educativo)
        const cartaCorrecta = cards[datosCasilla.indiceCorrecto];
        if (cartaCorrecta) {
            cartaCorrecta.style.border = "3px dashed #66bb6a";
            cartaCorrecta.style.opacity = "0.7";
        }

        // 🔥 APLICAR CASTIGO (-15)
        // Al ser negativo, la función de sumar restará automáticamente
        const CASTIGO = { puntos: -15 };
        aplicarRecompensa(CASTIGO);

        mostrarToast("❌ Incorrecto. -15 Puntos", "error");

        // Cierre rápido
        setTimeout(ocultarModal, 1500);
    }
};

// Variables temporales para el juego de Unir
let seleccionadoIzq = null;
let seleccionadoDer = null;

window.seleccionarLadoIzquierdo = function (btn, idx) {
    // Limpiar selección previa visual
    document.querySelectorAll('.col-unir.izquierda button').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    seleccionadoIzq = { element: btn, index: idx };
    verificarUnion();
};

window.seleccionarLadoDerecho = function (btn, idx) {
    document.querySelectorAll('.col-unir.derecha button').forEach(b => b.classList.remove('seleccionado'));
    btn.classList.add('seleccionado');
    seleccionadoDer = { element: btn, index: idx };
    verificarUnion();
};

function verificarUnion() {
    if (seleccionadoIzq && seleccionadoDer) {
        // Comparamos si coinciden (en tu data original, el índice es el match)
        // Nota: Si desordenas la derecha, usa dataset.match
        if (seleccionadoIzq.index === seleccionadoDer.index) {
            // MATCH CORRECTO
            seleccionadoIzq.element.style.backgroundColor = '#81C784'; // Verde
            seleccionadoDer.element.style.backgroundColor = '#81C784';
            seleccionadoIzq.element.disabled = true;
            seleccionadoDer.element.disabled = true;
            // Limpiar variables
            seleccionadoIzq = null; seleccionadoDer = null;
            // Chequear si terminó todo el juego...
        } else {
            // ERROR
            seleccionadoIzq.element.classList.add('error');
            seleccionadoDer.element.classList.add('error');
            setTimeout(() => {
                seleccionadoIzq.element.classList.remove('error', 'seleccionado');
                seleccionadoDer.element.classList.remove('error', 'seleccionado');
                seleccionadoIzq = null; seleccionadoDer = null;
            }, 500);
        }
    }
}
// ==========================================
// 🧠 LÓGICA DEL MINIJUEGO (Pegar al final de game.js)
// ==========================================
window.manejarClickUnion = function (lado, idPareja, btnElement) {
    const estado = window.estadoMinijuego;
    if (!estado) return;

    // 1. Validaciones básicas (Igual que antes)
    if (btnElement.classList.contains('emparejado')) return;

    // 2. Gestión de Selección (Igual que antes)
    if (lado === 'izq') {
        if (estado.seleccionIzq && estado.seleccionIzq.btn !== btnElement) {
            estado.seleccionIzq.btn.classList.remove('seleccionado');
        }
        estado.seleccionIzq = { id: idPareja, btn: btnElement };
        btnElement.classList.add('seleccionado');
    } else {
        if (estado.seleccionDer && estado.seleccionDer.btn !== btnElement) {
            estado.seleccionDer.btn.classList.remove('seleccionado');
        }
        estado.seleccionDer = { id: idPareja, btn: btnElement };
        btnElement.classList.add('seleccionado');
    }

    // 3. VERIFICAR PAREJA
    if (estado.seleccionIzq && estado.seleccionDer) {
        const btnIzq = estado.seleccionIzq.btn;
        const btnDer = estado.seleccionDer.btn;

        if (estado.seleccionIzq.id === estado.seleccionDer.id) {
            // ✅ ¡CORRECTO! (MATCH)
            btnIzq.classList.remove('seleccionado');
            btnDer.classList.remove('seleccionado');
            btnIzq.classList.add('emparejado');
            btnDer.classList.add('emparejado');

            // Sonido opcional
            if (window.playSound) window.playSound('click');

            estado.seleccionIzq = null;
            estado.seleccionDer = null;
            estado.paresEncontrados++;

            // 🏁 ¿JUEGO TERMINADO?
            if (estado.paresEncontrados >= estado.totalPares) {
                setTimeout(() => {

                    // 🔥 CAMBIO 1: FORZAR 20 PUNTOS SIEMPRE
                    const PREMIO_FIJO = { puntos: 20 };
                    if (typeof aplicarRecompensa === 'function') {
                        aplicarRecompensa(PREMIO_FIJO);
                    }

                    // 🔥 CAMBIO 2: USAR TOAST EN LUGAR DE ALERT
                    if (typeof mostrarToast === 'function') {
                        mostrarToast("¡Mochila ordenada! 🎒 +20 Puntos");
                    } else {
                        alert("¡Mochila ordenada! +20 Puntos");
                    }

                    setTimeout(() => {
                        // 1. Ocultamos el modal MANUALMENTE para no disparar avanzarTurno()
                        const modal = document.getElementById('gameModal');
                        if (modal) modal.style.display = 'none';
                        if (typeof controlarMusicaFondo === 'function') controlarMusicaFondo(false);

                        // 2. Obtenemos el jugador actual ANTES de que cambie el turno
                        const jugador = getJugadorActual();

                        // 3. Reanudamos movimiento (esto se encargará de pasar el turno correctamente cuando termine)
                        if (typeof window.reanudarMovimiento === 'function') {
                            window.reanudarMovimiento(jugador.id);
                        } else {
                            // Si no hay movimiento, entonces sí avanzamos turno manualmente
                            avanzarTurno();
                            actualizarInterfazPartida();
                        }
                    }, 1500);

                }, 500);
            }

        } else {
            // ❌ INCORRECTO (Igual que antes)
            btnIzq.classList.add('error');
            btnDer.classList.add('error');

            if (window.playSound) window.playSound('error');

            setTimeout(() => {
                btnIzq.classList.remove('seleccionado', 'error');
                btnDer.classList.remove('seleccionado', 'error');
                estado.seleccionIzq = null;
                estado.seleccionDer = null;
            }, 600);
        }
    }
};


//---------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
// ==========================================
// 🎵 SISTEMA DE SONIDOS (RESPETA EL SILENCIO)
// ==========================================
window.playSound = function (tipo) {

    // 🔥 ESTA ES LA REGLA DE ORO: 
    // Si existe el audioManager y dice que está silenciado (isMuted = true), cancelamos el sonido.
    if (typeof audioManager !== 'undefined' && audioManager.isMuted) {
        return; // Salimos de la función sin hacer ruido
    }

    // 👇 Tu código original que funciona perfecto:
    const rutas = {
        'success': 'assets/audio/success.mp3',  // Sonido de acierto/victoria
        'error': 'assets/audio/error.mp3',      // Sonido de error
        'click': 'assets/audio/click.mp3'       // Opcional
    };

    const url = rutas[tipo];

    if (url) {
        const audio = new Audio(url);
        audio.volume = 0.5; // Volumen al 50%

        // Intentamos reproducir con un catch para evitar errores si no existe el archivo
        audio.play().catch(e => {
            console.log(`⚠️ No se pudo reproducir el sonido '${tipo}' (Revisar si el archivo existe en assets/audio/)`);
        });
    } else {
        console.warn(`🔊 Se intentó reproducir un sonido desconocido: ${tipo}`);
    }
};

function lanzarAnimacionItem(nombreItem) {
    const imgModal = document.getElementById('icono-recompensa-modal');

    if (imgModal) {
        // Reiniciar por si se activa varias veces
        imgModal.classList.remove('animacion-enfasis-recompensa');
        void imgModal.offsetWidth;

        // 🔥 Activar el pulso
        imgModal.classList.add('animacion-enfasis-recompensa');

        // Sonido de éxito


    }
}

//--------------------------------------------------------------------------------------------------------
//--------------------CASILLAS LEYENDAS-----------------------------------------------------------------------------
// --- FUNCIÓN: LEYENDA DE DECISIÓN (A vs B) ---
// --- FUNCIÓN MINIJUEGO: BÚSQUEDA (Puntaje Estándar Automático) ---
function jugarMinijuegoBusqueda(casilla) {
    return new Promise((resolve) => {

        // --- 1. CONFIGURACIÓN GENERAL DE PUNTOS ---
        const PUNTOS_VICTORIA = 20;  // Siempre gana 20
        const PUNTOS_DERROTA = 15;   // Siempre pierde 15

        // 2. Crear Modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-leyenda-overlay';

        overlay.innerHTML = `
            <div class="pergamino-ancestral">
                <h3 class="titulo-leyenda">${casilla.titulo}</h3>
                
                <div style="text-align:center; margin:10px 0;">
                     <img src="${casilla.imagen}" style="width:80px; height:80px; border-radius:50%; border:3px solid #5d4037; object-fit:cover;">
                </div>

                <p class="texto-leyenda" style="font-size:0.95rem;">${casilla.historia}</p>
                <p style="font-weight:bold; color:#546e7a;">${casilla.instruccion || "Encuentra el premio oculto"}</p>
                
                <div class="contenedor-cartas" id="zonaJuego"></div>

                <div id="mensajeResultado" style="margin-top:15px; font-weight:bold; min-height:30px;"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const zonaJuego = document.getElementById('zonaJuego');
        const mensajeRes = document.getElementById('mensajeResultado');
        let juegoTerminado = false;

        // Elegir ganador al azar (0, 1 o 2)
        const posicionGanadora = Math.floor(Math.random() * 3);

        // 3. Generar las 3 cartas
        for (let i = 0; i < 3; i++) {
            const carta = document.createElement('div');
            carta.className = 'carta-misteriosa';
            carta.innerText = casilla.icono_oculto || '❓';

            carta.onclick = () => {
                if (juegoTerminado) return;
                juegoTerminado = true;

                carta.classList.add('revelada');

                setTimeout(() => {
                    if (i === posicionGanadora) {
                        // --- GANASTE (+20) ---
                        carta.innerText = casilla.icono_ganador || '🏆';
                        carta.style.border = "3px solid #4caf50";
                        mensajeRes.innerHTML = `<span style='color:green'>¡LO ENCONTRASTE! 🎉 (+${PUNTOS_VICTORIA})</span>`;

                        // AQUÍ LLAMAS A TU FUNCIÓN DE SUMAR PUNTOS
                        // sumarPuntos(PUNTOS_VICTORIA);

                    } else {
                        // --- PERDISTE (-15) ---
                        carta.innerText = casilla.icono_perdedor || '🐸';
                        carta.style.border = "3px solid #f44336";
                        mensajeRes.innerHTML = `<span style='color:red'>¡Fallaste! 😢 (-${PUNTOS_DERROTA})</span>`;

                        // AQUÍ LLAMAS A TU FUNCIÓN DE RESTAR PUNTOS
                        // restarPuntos(PUNTOS_DERROTA);
                    }

                    // Botón para salir
                    setTimeout(() => {
                        const btn = document.createElement('button');
                        btn.className = 'btn-decision';
                        btn.innerText = "Continuar";
                        btn.style.marginTop = "10px";
                        btn.onclick = () => { overlay.remove(); resolve(); };
                        overlay.querySelector('.pergamino-ancestral').appendChild(btn);
                    }, 1000);

                }, 200);
            };
            zonaJuego.appendChild(carta);
        }
    });
}





// =========================================================================================================
// MODAL DE PERFIL DE EXPLORADOR
// =====================================================
// =====================================================
// LÓGICA DEL PERFIL DE EXPLORADOR (100% en game.js)
// =====================================================

window.mostrarPerfil = function () {
    console.log("👆 Abriendo el perfil...");
    const modal = document.getElementById('modal-perfil');
    if (!modal) {
        console.error("❌ No se encontró el HTML del modal-perfil.");
        return;
    }

    // Resetear a la vista de pedir cédula
    const vistaIngreso = document.getElementById('vista-ingreso-cedula');
    const vistaDatos = document.getElementById('vista-datos-perfil');
    const inputCedula = document.getElementById('input-cedula-perfil');

    if (vistaIngreso) vistaIngreso.style.display = 'block';
    if (vistaDatos) vistaDatos.style.display = 'none';
    if (inputCedula) inputCedula.value = '';

    modal.classList.remove('modal-oculto');
};

window.cerrarPerfil = function () {
    console.log("❌ Cerrando el perfil...");
    const modal = document.getElementById('modal-perfil');
    if (modal) {
        modal.classList.add('modal-oculto');
    }
};
window.buscarPerfilPorCedula = async function () {
    const inputCedula = document.getElementById('input-cedula-perfil');
    const msgError = document.getElementById('error-cedula-perfil');
    const btnBuscar = document.querySelector('.btn-buscar-perfil');

    const cedula = inputCedula ? inputCedula.value.trim() : '';

    // 1. Limpiamos cualquier error previo antes de buscar
    msgError.style.display = 'none';
    msgError.innerText = '';
    inputCedula.classList.remove('input-error-borde');

    // 2. Validación de campo vacío o corto
    if (cedula === '') {
        msgError.innerText = "⚠️ Por favor ingresa tu número de cédula.";
        msgError.style.display = 'block';
        inputCedula.classList.add('input-error-borde');
        return;
    }

    if (cedula.length < 10) {
        msgError.innerText = "⚠️ La cédula debe tener 10 números.";
        msgError.style.display = 'block';
        inputCedula.classList.add('input-error-borde');
        return;
    }

    // 3. Estado de carga
    btnBuscar.innerText = "Buscando...";
    btnBuscar.disabled = true;

    try {
        const docRef = doc(db, "ranking_publico", cedula);
        const docSnap = await getDoc(docRef);

        // 🔥 EL ERROR QUE ME PEDISTE CAMBIAR (Si no existe en Firebase)
        if (!docSnap.exists()) {
            msgError.innerText = "❌ No se encontro ningún perfil con esa cédula.";
            msgError.style.display = 'block';
            inputCedula.classList.add('input-error-borde'); // Pinta el borde rojo

            // Restauramos el botón
            btnBuscar.innerText = "Buscar Explorador";
            btnBuscar.disabled = false;
            return;
        }

        // --- (A PARTIR DE AQUÍ SIGUE TU CÓDIGO NORMAL) ---
        const datos = docSnap.data();
        const puntajeJugador = datos.puntuacion_total || 0;
        const nombreJugador = datos.nombre || "Explorador";
        const niveles = datos.estado_niveles || {};

        const rankingRef = collection(db, "ranking_publico");
        const qRanking = query(rankingRef, where("puntuacion_total", ">", puntajeJugador));
        const snapshotRanking = await getCountFromServer(qRanking);
        const puestoGlobal = snapshotRanking.data().count + 1;

        document.getElementById('perfil-nombre-jugador').innerText = nombreJugador;
        document.getElementById('perfil-puesto').innerText = `#${puestoGlobal}`;
        document.getElementById('pts-total').innerText = puntajeJugador;

        const formatearNivel = (nivelData, numeroNivel) => {
            if (!nivelData || !nivelData.desbloqueado) {
                return `<span class="label-pts">Nivel ${numeroNivel}</span>
                        <span class="separador">|</span>
                        <span class="nivel-bloqueado">🔒 Bloqueado</span>`;
            }
            return `<span class="label-pts">Nivel ${numeroNivel}</span>
                    <span class="separador">|</span>
                    <strong class="valor-pts">${nivelData.puntos} pts</strong>`;
        };

        document.getElementById('pts-nv1').innerHTML = formatearNivel(niveles.nivel_1, 1);
        document.getElementById('pts-nv2').innerHTML = formatearNivel(niveles.nivel_2, 2);
        document.getElementById('pts-nv3').innerHTML = formatearNivel(niveles.nivel_3, 3);
        document.getElementById('pts-nv4').innerHTML = formatearNivel(niveles.nivel_4, 4);

        // Restauramos el botón por si cierran y vuelven a abrir
        btnBuscar.innerText = "Buscar Explorador";
        btnBuscar.disabled = false;

        document.getElementById('vista-ingreso-cedula').style.display = 'none';
        document.getElementById('vista-datos-perfil').style.display = 'block';

    } catch (error) {
        console.error("❌ Error al obtener el perfil de Firebase:", error);

        // Error de conexión también lo mostramos bonito
        msgError.innerText = "❌ Hubo un error de conexión. Intenta nuevamente.";
        msgError.style.display = 'block';

        btnBuscar.innerText = "Buscar Explorador";
        btnBuscar.disabled = false;
    }
};

// =====================================================
// FUNCIÓN PARA DAR DE BAJA LA CUENTA (BORRADO + ANONIMIZACIÓN)
// =====================================================
// =====================================================
// FLUJO DE ELIMINACIÓN DE CUENTA (CON MODAL BONITO)
// =====================================================

// 1. Solo abre el modal de advertencia
window.confirmarDarDeBaja = function () {
    const inputCedula = document.getElementById('input-cedula-perfil');
    if (!inputCedula || inputCedula.value.trim() === '') {
        mostrarToast("⚠️ No se encontró la cédula para dar de baja.");
        return;
    }

    const modalConfirmacion = document.getElementById('modal-confirmacion-baja');
    if (modalConfirmacion) {
        modalConfirmacion.classList.remove('modal-oculto');
    }
};

// 2. Cierra el modal si el usuario se arrepiente
window.cerrarConfirmacionBaja = function () {
    const modalConfirmacion = document.getElementById('modal-confirmacion-baja');
    if (modalConfirmacion) {
        modalConfirmacion.classList.add('modal-oculto');
    }
};
// 3. Ejecuta la eliminación real en Firebase
window.ejecutarBajaCuenta = async function () {
    const inputCedula = document.getElementById('input-cedula-perfil');
    const cedula = inputCedula.value.trim();

    // Obtenemos AMBOS botones
    const btnEjecutar = document.getElementById('btn-ejecutar-baja');
    const btnCancelar = document.getElementById('btn-cancelar-baja');

    // 🔒 BLOQUEAMOS TODO MIENTRAS CARGA
    btnEjecutar.innerText = "Eliminando...";
    btnEjecutar.disabled = true;
    btnEjecutar.style.cursor = "not-allowed";

    btnCancelar.disabled = true;
    btnCancelar.style.opacity = "0.5"; // Lo hacemos ver apagado
    btnCancelar.style.cursor = "not-allowed";

    try {
        // --- A. BORRADO FÍSICO ---
        await deleteDoc(doc(db, "ranking_publico", cedula));
        await deleteDoc(doc(db, "usuarios_privados", cedula));

        // --- B. ANONIMIZACIÓN LÓGICA ---
        const historialRef = collection(db, "historial_partidas");
        const qHistorial = query(historialRef, where("cedula", "==", cedula));
        const historialSnapshot = await getDocs(qHistorial);

        const promesasAnonimizacion = [];
        historialSnapshot.forEach((documento) => {
            const docUpdateRef = doc(db, "historial_partidas", documento.id);
            promesasAnonimizacion.push(
                updateDoc(docUpdateRef, {
                    cedula: "usuario_eliminado",
                    nombre: "Usuario Anónimo"
                })
            );
        });

        await Promise.all(promesasAnonimizacion);

        // --- C. LIMPIEZA Y REINICIO ---
        localStorage.clear();
        sessionStorage.clear();

        mostrarToast("✅ Tu cuenta ha sido eliminada con éxito. ¡Vuelve pronto!");
        window.location.reload();

    } catch (error) {
        console.error("❌ Error al intentar dar de baja la cuenta:", error);
        mostrarToast("Hubo un problema de conexión. Intenta de nuevo más tarde.");

        // 🔓 DESBLOQUEAMOS LOS BOTONES SI HUBO ERROR
        btnEjecutar.innerText = "Sí, eliminar cuenta";
        btnEjecutar.disabled = false;
        btnEjecutar.style.cursor = "pointer";

        btnCancelar.disabled = false;
        btnCancelar.style.opacity = "1";
        btnCancelar.style.cursor = "pointer";
    }

};