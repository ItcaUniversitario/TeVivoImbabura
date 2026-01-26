// ==========================================
// 1. IMPORTACIONES
// ==========================================
import {
    iniciarJuego,
    verificarCedula,
    iniciarTablero,
    volverSeleccion,
    accesoAdmin,
    aceptarTerminosYContinuar,
    guardarPuntosFinales,
    cargarRankingGlobal,
    actualizarMapaVisual, // 👈 Para desbloquear niveles en el mapa
    guardarInventario,
    guardarProgresoJugador
     // 👈 Para guardar ítems al instante
} from './auth.js';

import { tirarDado, reanudarMovimiento, controlarMusicaFondo, crearFichasEnMapa, moverFicha, iniciarMusicaFondo, animarMovimiento } from './mechanics.js';
import { gameState, setNivelSeleccionado, getJugadorActual, avanzarTurno } from './state.js';
import { CONTENIDO_CASILLAS_POR_NIVEL, RECOMPENSAS_DATA, URL_GIF_VICTORIA, URL_VIDEO_FINAL } from './data.js';
import { mostrarToast } from './ui.js';
import { precargarImagenes } from './utils.js';
// En la sección 1. IMPORTACIONES
import { audioManager } from './audioManager.js';
// ==========================================
// 🎵 FUNCIÓN PARA EL BOTÓN DE MÚSICA
// ==========================================
window.controlarMusica = function () {
    const estaEnSilencio = audioManager.toggleMute();
    const btn = document.getElementById('btn-musica');

    if (btn) {
        if (estaEnSilencio) {
            // ESTADO: SILENCIO (Colores Tierra/Desaturados)
            btn.innerHTML = "🔇 Música: OFF";
            btn.style.backgroundColor = "#8d6e63"; // Café terracota suave
            btn.style.color = "#d7ccc8";           // Texto crema claro
            btn.style.borderColor = "#5d4037";
            btn.style.opacity = "0.8";             // Se ve "apagado"
        } else {
            // ESTADO: ACTIVO (Colores Naturaleza/Vivos)
            btn.innerHTML = "🔊 Música: ON";
            btn.style.backgroundColor = "#2e7d32"; // Verde bosque (Naturaleza)
            btn.style.color = "#ffffff";           // Texto blanco puro
            btn.style.borderColor = "#1b5e20";
            btn.style.opacity = "1";               // Resalta más
        }
    }
};
// ==========================================
// 2. EXPONER FUNCIONES GLOBALES (Fallback)
// ==========================================
// Mantenemos esto por seguridad, pero usaremos EventListeners principalmente.
window.iniciarJuego = iniciarJuego;
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

        // 🔥 CONEXIÓN CON FIREBASE: Actualizar candados del mapa
        // Usamos la cédula del primer jugador para verificar qué niveles están abiertos
        if (gameState.jugadoresPartida.length > 0) {
            const cedulaMain = gameState.jugadoresPartida[0].cedula;
            actualizarMapaVisual(cedulaMain);
        }
    }
}

// En js/game.js
// En js/game.js
// En js/game.js

export function cargarNivel(nivel) {
    console.log(`🚀 Cargando Nivel ${nivel}...`);

    setNivelSeleccionado(nivel);
    gameState.turnoActual = 1;
    gameState.fichasSeleccionadas = {};

    // 1. CAMBIAR IMÁGENES DEL MAPA (Esto SÍ cambia por nivel)
    const imgMapa = document.getElementById('mapa-juego-visual');
    if (imgMapa) imgMapa.src = `assets/imagenes/mapas/mapa_imbabura${nivel}.png`;

    const imgCarga = document.getElementById('imagen-interstitial');
    if (imgCarga) imgCarga.src = `assets/imagenes/mapas/mapanivel${nivel}.png`;

    // 🔥 2. ACTUALIZAR LAS FICHAS (SIEMPRE SON LAS MISMAS: 1 al 6) 🔥
    const botonesFicha = document.querySelectorAll('.btn-ficha');

    botonesFicha.forEach((btn, index) => {
        // index va de 0 a 5.
        // Siempre sumamos 1, así que siempre tendremos IDs: 1, 2, 3, 4, 5, 6.
        const idFicha = index + 1;

        // A. Actualizamos el ID del botón
        btn.id = `ficha-${idFicha}`;

        // B. El clic siempre selecciona la ficha 1-6
        btn.setAttribute('onclick', `seleccionarFicha(${idFicha})`);

        // C. La imagen siempre es ficha_1.png a ficha_6.png
        const img = btn.querySelector('img');
        if (img) {
            img.src = `assets/fichas/ficha_${idFicha}.png`;
            img.alt = `Ficha ${idFicha}`;
        }

        // D. Reseteamos estado visual
        btn.disabled = false;
        btn.style.border = "2px solid var(--color-tierra-clara)";
        btn.classList.remove('seleccionada');
    });

   // 3. TRANSICIÓN
    document.getElementById('pantalla-niveles').style.display = 'none';
    const inter = document.getElementById('pantalla-interstitial');
    if (inter) inter.style.display = 'flex';

    setTimeout(() => {
        if (inter) inter.style.display = 'none';

        const titulo = document.getElementById('titulo-seleccion');
        const nombreJugador = gameState.jugadoresPartida[0] ? gameState.jugadoresPartida[0].nombre.split(" ")[0] : "Viajero";

        if (titulo) {
            titulo.innerText = `👤 ${nombreJugador}, elige tu ficha`;
            
            // --- AQUÍ APLICAMOS LA ANIMACIÓN ---
            
            // 1. Quitamos la clase (por si ya estaba puesta)
            titulo.classList.remove('titulo-destacado-anim');
            
            // 2. Truco mágico: Forzamos al navegador a "repintar" el elemento.
            // Esto es necesario para que la animación se reinicie desde cero.
            void titulo.offsetWidth; 
            
            // 3. Agregamos la clase de nuevo para activar el efecto
            titulo.classList.add('titulo-destacado-anim');
        }

        document.getElementById('pantalla-personaje').style.display = 'flex';
        
        // Opcional: Sonido de "Whoosh" o campanita aquí quedaría genial
        // playSonido('transicion'); 

    }, 3000);
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

function determinarJugadorInicial() {
    const num = gameState.jugadoresPartida.length;
    const indice = Math.floor(Math.random() * num);
    gameState.turnoActual = indice + 1;
    return gameState.jugadoresPartida[indice].nombre;
}

export function seleccionarFicha(numeroFicha) {
    const btn = document.getElementById(`ficha-${numeroFicha}`);
    if (btn) { btn.disabled = true; btn.style.border = "3px solid #2E7D32"; }

    gameState.fichasSeleccionadas[`jugador_${gameState.turnoActual}`] = numeroFicha;

    const jugador = getJugadorActual();
    jugador.fichaId = numeroFicha;
    jugador.posicion = 0;

    if (gameState.turnoActual < gameState.jugadoresRegistrados) {
        avanzarTurno();
        actualizarTituloFicha();
    } else {
        // INICIO DEL JUEGO
        const primerJugador = determinarJugadorInicial();
        document.getElementById('pantalla-personaje').style.display = 'none';
        crearFichasEnMapa();
        document.getElementById('contenedor-mapa').style.display = 'flex';
        document.getElementById('panel-derecho').style.display = 'block';
        mostrarToast(`🎉 ¡Sorteo de turnos aleatorio comienza: ${primerJugador}!`);

        renderizarScorePartida();
        actualizarInterfazPartida();
    }
}

// ==========================================
// 5. LÓGICA DE JUEGO (MODALES Y EVENTOS)
// ==========================================

// En js/game.js

export function ocultarModal() {
    document.getElementById('gameModal').style.display = 'none';
    controlarMusicaFondo(false);

    const btnDado = document.getElementById('boton-dado');
    if (btnDado) { 
        btnDado.disabled = false; 
        btnDado.innerText = 'TIRAR DADO'; 
    }

    // Si es fin de turno normal, avanzamos
    // Nota: Si usas reanudarMovimiento, esa función también llama a actualizarInterfazPartida
    avanzarTurno();
    
    // 🔥 AQUÍ ES EL MOMENTO CLAVE
    actualizarInterfazPartida();
}
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
        case 'lugar_emblematico':
            modalTitle.textContent = casillaData.titulo;
            modalDesc.innerHTML = casillaData.descripcion;
            if (casillaData.imagen) {
                modalImg.src = casillaData.imagen; modalImg.style.display = 'block';
                if (arContainer) arContainer.innerHTML = '<p class="mensaje-ar">¡Escanea para RA!</p>';
            }
            aplicarRecompensa(casillaData.recompensa);
            const jugador = getJugadorActual();
            btnContainer.innerHTML = `<button class="btn-imbabura" onclick="window.reanudarMovimiento(${jugador.id})">¡Entendido!</button>`;
            controlarMusicaFondo(true);
            break;

      case 'dato_curioso':
            modalTitle.textContent = '💡 Dato Curioso';

            // 1. Inyectamos el texto y preparamos el lugar para el botón
            modalDesc.innerHTML = `
                <div style="margin-bottom: 20px; font-size: 1.1rem; line-height: 1.6;">
                    ${casillaData.descripcion}
                </div>
                <div id="contenedor-btn-dato"></div>
            `;

            // 2. Creamos el botón (Puedes cambiar el texto a "¡Interesante!" o "Entendido")
            const btnDato = document.createElement('button');
            btnDato.className = 'btn-modal-accion'; // Reutilizamos tu clase CSS bonita
            btnDato.textContent = "¡INTERESANTE!";

            // 3. Lógica al hacer Clic: Dar premio y Cerrar
            btnDato.onclick = function() {
                // A. Aplicamos la recompensa AHORA (sensación de "cobrar")
                aplicarRecompensa(casillaData.recompensa);
                
                // B. Cerramos el modal
                ocultarModal();
            };

            // 4. Insertar el botón en el modal
            document.getElementById('contenedor-btn-dato').appendChild(btnDato);
            
            // ⚠️ IMPORTANTE: Eliminamos el setTimeout para que no se cierre solo
            // setTimeout(ocultarModal, 6000); <--- BORRADO
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
            break;

        case 'evento':
            manejarEvento(casillaData);
            break;
        case 'minijuego':
            modalTitle.textContent = casillaData.titulo;

            // Si hay pregunta (caso 3 imágenes) o descripción (caso unir), la mostramos
            if (casillaData.pregunta) {
                modalDesc.innerHTML = `<p>${casillaData.pregunta}</p>`;
            } else {
                modalDesc.innerHTML = casillaData.descripcion;
            }

            optsContainer.style.display = 'flex';

            if (casillaData.subtipo === 'tres_imagenes' || casillaData.subtipo === 'galeria_imagenes') {

                optsContainer.innerHTML = '';
                optsContainer.className = 'contenedor-mini-galeria';

                casillaData.opcionesImagenes.forEach((imgSrc, index) => {
                    const card = document.createElement('div');
                    card.className = 'card-minijuego';

                    // Asignamos el clic a TODA la tarjeta
                    card.onclick = function () {
                        resolverMinijuegoImagenes(index, casillaData);
                    };

                    card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imgSrc}" alt="Opción ${index + 1}">
            </div>
            <div class="indicador-tap">👆</div>
        `;

                    optsContainer.appendChild(card);
                });
            }


            // --- LÓGICA: UNIR PAREJAS ---
            else if (casillaData.subtipo === 'unir_parejas') {
                optsContainer.innerHTML = ''; // ⚠️ Limpieza importante
                optsContainer.className = 'contenedor-unir-parejas';

                // Inicializar estado del juego
                window.estadoMinijuego = {
                    seleccionIzq: null,
                    seleccionDer: null,
                    paresEncontrados: 0,
                    totalPares: casillaData.pares.length,
                    datosCasilla: casillaData
                };

                // 1. Crear Columna IZQUIERDA (Lugares)
                const colIzquierda = document.createElement('div');
                colIzquierda.className = 'col-unir';
                // Título opcional
                colIzquierda.innerHTML = '<div class="titulo-columna">Lugares</div>';

                casillaData.pares.forEach((par, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-unir';
                    btn.innerHTML = par.izquierda; // Ej: "Sanshipamba"
                    // Al hacer clic, enviamos 'izq' y el índice correcto (0, 1, 2...)
                    btn.onclick = function () { manejarClickUnion('izq', index, this); };
                    colIzquierda.appendChild(btn);
                });

                // 2. Crear Columna DERECHA (Ubicaciones - MEZCLADAS)
                const colDerecha = document.createElement('div');
                colDerecha.className = 'col-unir';
                // Título opcional
                colDerecha.innerHTML = '<div class="titulo-columna">Ubicación</div>';

                // Creamos una lista de índices [0, 1, 2...] y la mezclamos aleatoriamente
                let indicesMezclados = casillaData.pares.map((_, i) => i).sort(() => Math.random() - 0.5);

                indicesMezclados.forEach((indexReal) => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-unir';
                    btn.innerHTML = casillaData.pares[indexReal].derecha; // Ej: "Pimampiro"

                    // El botón muestra texto mezclado, pero internamente guarda su ID real para comparar
                    btn.onclick = function () { manejarClickUnion('der', indexReal, this); };
                    colDerecha.appendChild(btn);
                });

                // 3. Agregar columnas al contenedor
                optsContainer.appendChild(colIzquierda);
                optsContainer.appendChild(colDerecha);
            }
            break;

        case 'fin':
            modalTitle.textContent = casillaData.titulo;
            modalDesc.innerHTML = casillaData.descripcion;
            break;

        default:
            modalTitle.textContent = casillaData.titulo;
            modalDesc.innerHTML = casillaData.descripcion;
            setTimeout(ocultarModal, 3000);
            break;
    }
    modal.style.display = 'flex';
}

// En js/game.js
function aplicarRecompensa(recompensa) {
    if (!recompensa) return;
    const jugador = getJugadorActual();

    // 1. PUNTOS: Se guardan en memoria Y AHORA TAMBIÉN EN BD
    if (recompensa.puntos) {
        jugador.puntos += recompensa.puntos;

        // 🔥 ESTA ES LA LÍNEA QUE FALTABA 🔥
        // Envía el nuevo puntaje a Firebase inmediatamente
        guardarProgresoJugador(jugador);
    }

    // 2. ÍTEMS: Se guardan en memoria y BD
    if (recompensa.item) {
        const inv = gameState.inventarioPartida[jugador.cedula];
        inv[recompensa.item] = (inv[recompensa.item] || 0) + 1;
        
        // Guardamos en Firebase (esto ya lo tenías bien)
        guardarInventario(jugador.cedula);
    }
    
    // 🚫 IMPORTANTE: Aquí NO debe haber ningún renderizarScorePartida() 
    // (Correcto, no renderizamos para no interrumpir la animación visual si la tienes aparte)
}

function manejarRespuesta(data, seleccion) {
    const opts = document.getElementById('modalOptionsContainer');
    const btns = opts.querySelectorAll('button');
    const desc = document.getElementById('modalDescription');
    
    // 🛑 1. BLOQUEO INMEDIATO (Lo primero que hace la función)
    // Desactivamos TODOS los botones para que nadie pueda dar otro clic
    btns.forEach(btn => {
        btn.disabled = true; 
        btn.style.cursor = 'wait'; // Cambia el cursor a "esperando"
        btn.style.opacity = '0.6'; // Los oscurece un poco para que se note
    });

    // ✨ 2. FEEDBACK VISUAL INSTANTÁNEO
    // Resaltamos el botón que acaba de presionar el usuario para que sepa que "lo agarró"
    if (btns[seleccion]) {
        btns[seleccion].style.opacity = '1'; // Mantenemos brillante el seleccionado
        btns[seleccion].style.border = '2px solid #333'; // Borde temporal
        btns[seleccion].innerText += ' ⏳...'; // Pequeño indicador de carga
    }
    
    opts.classList.add('respuesta-revelada');

    // 🧠 3. LÓGICA DE VALIDACIÓN (Pequeña pausa dramática opcional o directa)
    // Usamos un setTimeout muy breve (100ms) para permitir que el navegador
    // renderice el bloqueo antes de hacer cálculos pesados.
    setTimeout(() => {
        const correcto = data.respuestaCorrecta;
        let res = {}; 
        let color = ""; 
        let icono = "";

        // Quitamos el texto de carga temporal
        if (btns[seleccion]) {
             btns[seleccion].innerText = btns[seleccion].innerText.replace(' ⏳...', '');
             btns[seleccion].style.border = ''; // Quitamos borde temporal
        }

        if (seleccion === correcto) {
            // --- A. CORRECTO ---
            res = data.recompensa.correcta;
            aplicarRecompensa({ puntos: res.puntos, item: res.item });
            
            icono = "✅ ¡Correcto!"; 
            color = "#2E7D32"; 
            btns[seleccion].classList.add('opcion-correcta');
        } else {
            // --- B. INCORRECTO ---
            res = data.recompensa.incorrecta;
            const jugador = getJugadorActual();
            jugador.puntos -= res.puntosPerdidos;
            guardarProgresoJugador(jugador);
            icono = "❌ ¡Incorrecto!"; 
            color = "#D32F2F"; 
            btns[seleccion].classList.add('opcion-incorrecta');
            
            // Mostramos la correcta para que aprendan
            if(btns[correcto]) btns[correcto].classList.add('respuesta-correcta-final');
        }

        // 4. MOSTRAR RESULTADO FINAL Y BOTÓN CONTINUAR
        // Esperamos 1 segundo para que el usuario vea los colores (Verde/Rojo)
        setTimeout(() => {
            opts.style.display = 'none'; // Ocultamos botones
            
            desc.innerHTML = `
                <div style="text-align: center; animation: fadeIn 0.5s;">
                    <h3 style="color:${color}; margin: 0 0 10px 0;">${icono}</h3>
                    <p style="font-size: 1.1rem; line-height: 1.5;">${res.feedback}</p>
                </div>
                <div id="contenedor-btn-pregunta" style="margin-top: 20px; text-align: center;"></div>
            `;
            
            const btnCerrar = document.createElement('button');
            btnCerrar.className = 'btn-modal-accion';
            btnCerrar.textContent = "CONTINUAR";
            btnCerrar.onclick = ocultarModal;
            
            const cont = document.getElementById('contenedor-btn-pregunta');
            if(cont) cont.appendChild(btnCerrar);
            
        }, 1000); 

    }, 50); // El delay de 50ms asegura que el bloqueo visual ocurra antes del cálculo
}

// En js/game.js

function manejarEvento(data) {
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDescription');
    const jugador = getJugadorActual();
    
    let txt = ""; 
    let tituloModal = "";
    
    // --- 1. Calcular Textos ---
    if (data.subtipo === 'trampa_item') {
        const inv = gameState.inventarioPartida[jugador.cedula];
        if (inv && inv[data.condicionItem] > 0) {
            tituloModal = '🛡️ ¡Salvado!';
            txt = data.text_success;
        } else {
            tituloModal = '🛑 Trampa';
            txt = data.text_fail;
        }
    } else {
        txt = data.descripcion || data.text;
        if (data.movimiento > 0 || data.pointsGained > 0 || (data.subtipo && data.subtipo.includes('ventaja'))) {
            tituloModal = '🍀 Buena Suerte';
        } else {
            tituloModal = (data.movimiento < 0) ? '🛑 Trampa' : '¡Evento!';
        }
    }

    // --- 2. Mostrar Modal ---
    title.textContent = tituloModal;
    desc.innerHTML = `
        <div style="margin-bottom: 20px;">
            <strong>¡Atención!</strong><br>${txt}
        </div>
        <div id="contenedor-btn-accion"></div>
    `;

    const btnEntendido = document.createElement('button');
    btnEntendido.className = 'btn-modal-accion'; 
    btnEntendido.textContent = "ENTENDIDO";
    
    // --- 3. Lógica del Botón (AQUÍ ESTÁ LA MAGIA) ---
    btnEntendido.onclick = function() {
        
        // Primero cerramos el modal del evento para ver el mapa
        ocultarModal();

        // A. Lógica de Trampa con Item
        if (data.subtipo === 'trampa_item') {
            const inv = gameState.inventarioPartida[jugador.cedula];
            if (inv && inv[data.condicionItem] > 0) {
                // Se salvó: Solo pierde el item
                inv[data.itemLost]--;
                guardarInventario(jugador.cedula);
            } else {
                // Falló: Se mueve si hay castigo (usualmente hacia atrás)
                if (data.move_fail) {
                    jugador.posicion += data.move_fail;
                    if (jugador.posicion < 0) jugador.posicion = 0;
                    moverFicha(jugador.id, jugador.posicion);
                    actualizarInterfazPartida(); // Actualizamos porque movimos manual
                }
            }
        } 
        // B. Lógica General de Movimiento
        else {
            // --- CASO 1: AVANZAR (Respetando Paradas) ---
            if (data.movimiento > 0) {
                console.log(`🚀 Ventaja activada: Avanzando ${data.movimiento} casillas...`);
                // Usamos animarMovimiento para que camine paso a paso
                // y detecte si pasa por un Lugar Emblemático.
                animarMovimiento(jugador.id, data.movimiento, gameState.limiteCasillasActual);
            }
            // --- CASO 2: RETROCEDER (Castigo directo) ---
            else if (data.movimiento < 0) {
                jugador.posicion += data.movimiento;
                if (jugador.posicion < 0) jugador.posicion = 0;
                
                // Movemos visualmente (Teletransporte hacia atrás)
                moverFicha(jugador.id, jugador.posicion);
                
                // Al retroceder, no solemos activar casillas, así que solo actualizamos UI
                actualizarInterfazPartida();
            }

            // Aplicar Puntos (Silencioso)
           if (data.pointsGained) {
                jugador.puntos += data.pointsGained;
                // 🔥 GUARDAR PUNTOS GANADOS
                guardarProgresoJugador(jugador);
            }
            
            if (data.pointsLost) {
                jugador.puntos -= data.pointsLost;
                // 🔥 GUARDAR PUNTOS PERDIDOS
                guardarProgresoJugador(jugador);
            }
        }

        // Si NO hubo movimiento positivo (porque animarMovimiento ya maneja su propio cierre),
        // y no fue retroceso (que ya actualizamos), nos aseguramos de actualizar la interfaz.
        if (!data.movimiento || data.movimiento <= 0) {
             actualizarInterfazPartida();
        }
    };

    document.getElementById('contenedor-btn-accion').appendChild(btnEntendido);
}

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
    if(nombreDisplay) nombreDisplay.innerText = jugador.nombre.split(" ")[0];
    
    // 3. Renderizar Recompensas (Items en la barra lateral)
    renderizarRecompensas(jugador.cedula);

    // ✅ 4. RENDERIZAR PUNTAJE (Aquí se verán los puntos nuevos y la animación)
    // Al llamarse esto SOLO al cerrar el modal, el usuario verá el cambio justo en ese momento.
    renderizarScorePartida();
}

// En js/game.js

export function renderizarScorePartida() {
    const container = document.getElementById('score-partida-container');
    if (!container) return;
    
    container.innerHTML = '';
    const label = document.getElementById('label-nivel');
    if (label) label.innerText = `Ruta Nivel ${gameState.nivelSeleccionado}`;

    gameState.jugadoresPartida.forEach((j, idx) => {
        
        // 1. Memoria de Puntos
        if (typeof j.puntosAnteriores === 'undefined') j.puntosAnteriores = j.puntos;
        
        // Variable para decidir qué clase poner AHORA
        let claseAnimacionPuntos = '';

        // Solo animamos si hubo un cambio reciente
        if (j.puntos !== j.puntosAnteriores) {
            if (j.puntos > j.puntosAnteriores) {
                claseAnimacionPuntos = 'animacion-ganar';
                if(window.playSound) window.playSound('success'); 
            } else {
                claseAnimacionPuntos = 'animacion-perder';
                if(window.playSound) window.playSound('error');
            }
        }
        
        // Actualizamos memoria
        j.puntosAnteriores = j.puntos;

        // 2. Memoria de Ítems
        if (typeof j.inventarioAnterior === 'undefined') j.inventarioAnterior = {}; 
        const invActual = gameState.inventarioPartida[j.cedula] || {};
        let itemsHtml = '';

        Object.keys(invActual).forEach(key => {
            const cantidadHoy = invActual[key];
            if (cantidadHoy > 0) {
                const cantidadAyer = j.inventarioAnterior[key] || 0;
                let claseAnimItem = '';
                
                // Si aumentó la cantidad, marcamos para animar
                if (cantidadHoy > cantidadAyer) {
                    claseAnimItem = 'animacion-item-nuevo'; 
                }

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
        
        // Actualizar memoria items
        j.inventarioAnterior = { ...invActual }; 

        // 3. RENDERIZADO
        const div = document.createElement('div');
        div.className = 'jugador-score-partida';
        if (idx + 1 === gameState.turnoActual) div.classList.add('turno-activo');

        div.innerHTML = `
        <div class="score-cabecera">
            <div class="ficha-wrapper">
                <img src="assets/fichas/ficha_${j.fichaId}.png">
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

        // 🧹 LIMPIEZA AUTOMÁTICA (TRUCO DE RENDIMIENTO) 🧹
        // Si pusimos una animación, la quitamos después de 1.2 segundos.
        // Esto permite que si gana puntos de nuevo en 5 segundos, la animación vuelva a salir.
        if (claseAnimacionPuntos !== '' || itemsHtml.includes('animacion-item-nuevo')) {
            setTimeout(() => {
                // Buscamos los elementos que acabamos de crear y les quitamos la clase
                const badge = div.querySelector('.puntos-badge');
                if(badge) badge.classList.remove('animacion-ganar', 'animacion-perder');
                
                const items = div.querySelectorAll('.recompensa-item-wrapper');
                items.forEach(it => it.classList.remove('animacion-item-nuevo'));
                
                // Nota: No necesitamos volver a guardar en memoria, solo limpiar el DOM visual
            }, 1500); // 1.5s es suficiente para que termine la animación CSS
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
// 7. FIN DE PARTIDA (VERSIÓN MODAL FLOTANTE)
// ==========================================
async function procesarCobroRecompensas() {
    // 1. Efecto visual en el mapa (opcional)
    const container = document.getElementById('contenedor-mapa');
    // NO le bajamos la opacidad aquí para que no se vea feo el fondo, 
    // el modal oscuro ya hará el trabajo.
    
    // 2. Limpieza de modales previos
    const modalViejo = document.getElementById('modal-cobro-dedicado');
    if (modalViejo) modalViejo.remove();

    // 3. Configuración de Datos
    const VALORES = { 'helado': 25, 'arbol': 30, 'poncho': 40, 'canoa': 50, 'algodon': 35 };
    const RUTAS_ICONOS = {
        'helado': 'assets/recompensas/helado.png',
        'arbol': 'assets/recompensas/arbol.png',
        'poncho': 'assets/recompensas/poncho.png',
        'canoa': 'assets/recompensas/canoa.png',
        'algodon': 'assets/recompensas/algodon.png'
    };
    const ICONO_DEFAULT = 'assets/iconos/caja_generica.png';
    const normalizar = (txt) => txt.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 4. MODO PRUEBA (Datos Falsos si no hay partida real)
    let jugadoresParaMostrar = gameState.jugadoresPartida;
    let inventarioParaMostrar = gameState.inventarioPartida;

    if (!jugadoresParaMostrar || jugadoresParaMostrar.length === 0) {
        jugadoresParaMostrar = [
            { cedula: 'test1', nombre: 'JUGADOR 1', fichaId: 1, puntos: 2000 },
            { cedula: 'test2', nombre: 'JUGADOR 2', fichaId: 2, puntos: 1500 }
        ];
        inventarioParaMostrar = {
            'test1': { 'canoa': 1, 'poncho': 1 },
            'test2': { 'helado': 2 }
        };
    }

    // 5. Generación de HTML (Tarjetas)
    let tarjetasHtml = '';
    jugadoresParaMostrar.forEach(jugador => {
        const inventario = inventarioParaMostrar[jugador.cedula] || {};
        const puntosBase = jugador.puntos;
        let bonoTotal = 0;
        let listaItemsHtml = '';
        let tieneItems = false;

        Object.keys(inventario).forEach(keyOriginal => {
            const cantidad = inventario[keyOriginal];
            const key = normalizar(keyOriginal);
            
            if (cantidad > 0 && VALORES[key] !== undefined) {
                tieneItems = true;
                const valor = VALORES[key];
                const subtotal = cantidad * valor;
                bonoTotal += subtotal;
                
                const nombreItem = key.charAt(0).toUpperCase() + key.slice(1);
                const imagen = RUTAS_ICONOS[key] || ICONO_DEFAULT;

                listaItemsHtml += `
                    <div class="fila-item">
                        <div class="izq">
                            <img src="${imagen}" onerror="this.src='${ICONO_DEFAULT}'">
                            <div class="textos">
                                <span class="nombre">${nombreItem}</span>
                                <span class="detalle">${cantidad} x ${valor} pts</span>
                            </div>
                        </div>
                        <div class="der">+${subtotal}</div>
                    </div>`;
            }
        });

        // 🔥 ACTUALIZACIÓN EN MEMORIA (IMPORTANTE)
        // Sumamos los bonos al jugador en la variable global gameState.
        // Cuando 'guardarPuntosFinales' se ejecute después, tomará este nuevo valor.
        if (gameState.jugadoresPartida.length > 0) {
            jugador.puntos += bonoTotal;
        }
        
        const totalFinal = puntosBase + bonoTotal;

        tarjetasHtml += `
            <div class="tarjeta-jugador">
                <div class="cabecera-tarjeta">
                    <img src="assets/fichas/ficha_${jugador.fichaId}.png">
                    <h3>${jugador.nombre.split(" ")[0]}</h3>
                </div>
                <div class="cuerpo-lista">
                    ${tieneItems ? listaItemsHtml : '<div class="vacio">Sin tesoros 🕸️</div>'}
                </div>
                <div class="pie-totales">
                    <div class="renglon"><span>Juego:</span> <span>${puntosBase}</span></div>
                    <div class="renglon verde"><span>Bonos:</span> <span>+${bonoTotal}</span></div>
                    <div class="renglon total"><span>TOTAL</span> <strong>${totalFinal} pts</strong></div>
                </div>
            </div>`;
    });

    // 6. CREAR MODAL
    const divModal = document.createElement('div');
    divModal.id = 'modal-cobro-dedicado';
    divModal.className = 'overlay-final-dedicado'; // Usamos la clase CSS nueva
    
    divModal.innerHTML = `
        <div class="caja-final-dedicada">
            <h2 class="titulo-final">💰 RECOMPENSAS OBTENIDAS</h2>
            <p style="text-align:center; color:#fff; margin-bottom:15px;">
                ¡Tus tesoros se han convertido en puntos!
            </p>
            
            <div class="lista-scrollable">
                <div class="grid-jugadores-dedicado" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:10px;">
                    ${tarjetasHtml}
                </div>
            </div>

            <div class="area-boton">
                <button id="btn-cerrar-dedicado" class="btn-final-accion">
                    GUARDAR Y CONTINUAR 💾
                </button>
            </div>
        </div>
    `;

    // 🚀 SIN CÁLCULOS JS DE ALTURA. 
    // El CSS (.overlay-final-dedicado) se encarga de cubrir todo y dejar el header arriba.
    document.body.appendChild(divModal);

    // 7. Retornar Promesa (Esperar click)
    return new Promise((resolve) => {
        const btn = document.getElementById('btn-cerrar-dedicado');
        btn.onclick = () => {
            // Animación de salida (opcional)
            divModal.style.opacity = '0';
            setTimeout(() => {
                divModal.remove();
                if (container) container.style.opacity = "1";
                resolve(); // ¡Aquí avisa a terminarPartida que continúe!
            }, 300);
        };
    });
}
// --- FUNCIÓN DE CELEBRACIÓN (DECLARACIÓN) ---
function mostrarCelebracionSobreMapa() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = "overlay-celebracion";
        overlay.innerHTML = `
            <div class="celebracion-content">
                <img src="${URL_GIF_VICTORIA}" alt="¡Victoria!" style="max-width: 400px; width: 80%;">
                <h1 class="texto-victoria">¡FELICIDADES!</h1>
            </div>
        `;
        document.body.appendChild(overlay);

        if(window.playSound) window.playSound('success');

        setTimeout(() => {
            overlay.style.opacity = "0";
            overlay.style.transition = "opacity 0.5s ease";
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 500);
        }, 3500);
    });
}

// --- FUNCIÓN PRINCIPAL ACTUALIZADA ---
export async function terminarPartida() {
    console.log("🏁 INICIO DE SECUENCIA FINAL");
    
    // 1. Ocultar paneles
    const panelDerecho = document.getElementById('panel-derecho');
    if (panelDerecho) panelDerecho.style.display = 'none';

    try {
        // PASO CLAVE: Esperamos a que el usuario vea sus recompensas y de clic en "Guardar"
        // Si esta función no tiene 'await', se guardarán 0 puntos.
        await procesarCobroRecompensas(); 
        
        console.log("💰 Recompensas procesadas. Iniciando guardado en BD...");

        // PASO CLAVE 2: Guardar en la base de datos
        await guardarPuntosFinales(); 
        
        // PASO 3: Celebración y Video
        await mostrarCelebracionSobreMapa();

        document.getElementById('contenedor-mapa').style.display = 'none';
        
        // Mostrar Video
        const fin = document.getElementById('pantalla-fin-partida');
        const vid = document.getElementById('video-final');
        fin.style.display = 'flex';
        vid.style.display = 'block';
        vid.src = URL_VIDEO_FINAL;
        vid.play();

        vid.onended = () => {
            vid.style.display = 'none';
            mostrarResumenFinal(); // Mostrar ranking
            cargarRankingGlobal();
        };

    } catch (error) {
        console.error("❌ Error en terminarPartida:", error);
    }
}

// ==========================================
// 🏆 PANTALLA FINAL (RESPETA EL HEADER)
// ==========================================
function mostrarResumenFinal() {
    // 1. Limpieza
    const modalViejo = document.getElementById('modal-final-dedicado');
    if (modalViejo) modalViejo.remove();

    // 2. Ranking
    const ranking = [...gameState.jugadoresPartida].sort((a, b) => b.puntos - a.puntos);
    const maxPuntos = ranking[0].puntos;

    // 3. HTML Tarjetas
    let tarjetasHtml = '';
    ranking.forEach((jugador, index) => {
        const esGanador = (jugador.puntos === maxPuntos);
        const puesto = index + 1;
        
        let iconoPuesto = `<span class="badge-puesto">#${puesto}</span>`;
        if (puesto === 1) iconoPuesto = '🥇';
        if (puesto === 2) iconoPuesto = '🥈';
        if (puesto === 3) iconoPuesto = '🥉';

        const claseFila = esGanador ? 'fila-jugador ganador' : 'fila-jugador';
        const etiquetaGanador = esGanador ? '<span class="tag-win">GANADOR</span>' : '';

        tarjetasHtml += `
            <div class="${claseFila}">
                <div class="col-izq">
                    <div class="puesto-icono">${iconoPuesto}</div>
                    <div class="avatar-wrapper">
                        <img src="assets/fichas/ficha_${jugador.fichaId}.png" alt="Ficha" onerror="this.style.display='none'">
                    </div>
                    <div class="info-user">
                        <span class="nombre-web">${jugador.nombre}</span>
                        ${etiquetaGanador}
                    </div>
                </div>
                <div class="col-der">
                    <span class="puntos-web">${jugador.puntos}</span>
                    <small>PTS</small>
                </div>
            </div>
        `;
    });

    // 4. Título
    const ganadores = ranking.filter(j => j.puntos === maxPuntos);
    let tituloHtml = (ganadores.length === 1) 
        ? `<h1 class="titulo-final victoria">🏆 ¡VICTORIA TOTAL!</h1>`
        : `<h1 class="titulo-final empate">🤝 ¡EMPATE TÉCNICO!</h1>`;

    // 5. Crear Modal
    const divModal = document.createElement('div');
    divModal.id = 'modal-final-dedicado';
    divModal.className = 'overlay-final-dedicado';
    
    divModal.innerHTML = `
        <div class="caja-final-dedicada">
            ${tituloHtml}
            <div class="lista-scrollable">
                ${tarjetasHtml}
            </div>
            <div class="area-boton">
                <button id="btn-reiniciar-juego" class="btn-final-accion">
                    🔄 VOLVER A JUGAR
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(divModal);

    document.getElementById('btn-reiniciar-juego').onclick = () => {
        window.location.reload();
    };
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
// ¡Aquí arreglamos el error de "iniciarJuego is not defined"!

document.addEventListener("DOMContentLoaded", () => {
    console.log("🎮 Game.js cargado y listo.");

    // Cargar Ranking Inicial
    cargarRankingGlobal();

    // Conectar Botones de Jugadores
    const btn1 = document.getElementById("btn-jugador-1");
    if (btn1) btn1.addEventListener("click", () => iniciarJuego(1));

    const btn2 = document.getElementById("btn-jugador-2");
    if (btn2) btn2.addEventListener("click", () => iniciarJuego(2));

    const btn3 = document.getElementById("btn-jugador-3");
    if (btn3) btn3.addEventListener("click", () => iniciarJuego(3));

    // Conectar Botón Admin
    const btnAdmin = document.getElementById("btn-admin");
    if (btnAdmin) btnAdmin.addEventListener("click", accesoAdmin);

    // Conectar Botón Saltar Video
    const btnSaltar = document.getElementById('btn-saltar-video');
    if (btnSaltar) btnSaltar.addEventListener('click', verVideoTerminado);
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

//-------------------------------------------------------------------------------------------------------------------
//------------------------------MINI JUEGO-------------------------------------------------------------------
// Función para el juego de las 3 imágenes
window.resolverMinijuegoImagenes = function (indiceElegido, datosCasilla) {
    const cards = document.querySelectorAll('.card-minijuego');

    if (indiceElegido === datosCasilla.indiceCorrecto) {
        // Victoria
        cards[indiceElegido].style.backgroundColor = "#c8e6c9"; // Verde clarito
        cards[indiceElegido].style.borderColor = "#2e7d32";
        mostrarToast("✨ ¡Excelente observación!");
        aplicarRecompensa(datosCasilla.recompensa);
        setTimeout(ocultarModal, 1500);
    } else {
        // Error
        cards[indiceElegido].style.backgroundColor = "#ffcdd2"; // Rojo clarito
        cards[indiceElegido].style.borderColor = "#c62828";
        cards[indiceElegido].style.transform = "shake 0.5s"; // Podrías añadir una animación de vibración
        mostrarToast("❌ Esa no es la imagen correcta...");
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



//---------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
// ==========================================
// 🎵 SISTEMA DE SONIDOS (SOLUCIÓN AL ERROR)
// ==========================================
window.playSound = function (tipo) {
    // Define aquí tus rutas reales. Si no tienes el archivo, no pasará nada malo.
    const rutas = {
        'success': 'assets/audio/success.mp3', // Asegúrate de tener este archivo o bórralo
        'error': 'assets/audio/error.mp3'
    };

    const url = rutas[tipo];

    if (url) {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("⚠️ No se encontró el sonido o falta interacción user."));
    } else {
        console.log(`🔊 Sonido solicitado: ${tipo} (Falta configurar archivo mp3)`);
    }
};
