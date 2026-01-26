// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN
// ==========================================
// En js/auth.js (Al inicio)

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    writeBatch,
    onSnapshot // <--- ¡AGREGA ESTO! FALTABA ESTA IMPORTACIÓN
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { mostrarModalTerminos, mostrarToast } from './ui.js';
import { gameState, setJugadoresRegistrados } from './state.js';
import { RECOMPENSAS_DATA } from './data.js';



export function iniciarJuego(cantidad) {
    setJugadoresRegistrados(cantidad);
    
    // ... (código de ocultar/mostrar pantallas igual que antes) ...
    const pantallaJugadores = document.getElementById('pantalla-jugadores');
    if(pantallaJugadores) pantallaJugadores.style.display = 'none';

    const pantallaRegistro = document.getElementById('pantalla-registro');
    if(pantallaRegistro) pantallaRegistro.style.display = 'flex'; 

    const contenedor = document.getElementById('contenedor-inputs');
    contenedor.innerHTML = '';

    for (let i = 1; i <= cantidad; i++) {
        const htmlJugador = `
            <div class="ficha-jugador">
                <div class="encabezado-ficha">
                    <h3 class="titulo-ficha">👤 Jugador ${i}</h3>
                    <span class="badge-estado">Cédula</span>
                </div>
                
                <div class="grupo-busqueda">
                    <input type="number" id="cedula-j${i}" class="input-imbabura input-cedula" 
                           placeholder="🔎 Cédula (Obligatorio)" 
                           oninput="if(this.value.length > 10) this.value = this.value.slice(0, 10);"
                           onkeydown="if(event.key === 'Enter') window.verificarCedula(${i})"> 
                    <button class="btn-imbabura primario btn-buscar" onclick="window.verificarCedula(${i})">Buscar</button>
                </div>

                <div id="mensaje-j${i}" class="mensaje-alerta" style="display:none;">
                    ⚠️ Usuario nuevo. Completa el registro:
                </div>
                
                <div id="form-extra-j${i}" class="campos-restantes" style="display: none;">
                    
                    <div class="separador-form">Datos Obligatorios <span style="color:red">*</span></div>
                    <div class="grid-formulario">
                        <div class="input-group">
                            <input type="text" id="nombre-j${i}" class="input-imbabura" placeholder="👤 Nombre y Apellido *" required>
                        </div>
                        <div class="input-group">
                            <input type="number" id="telefono-j${i}" class="input-imbabura" placeholder="📱 Celular (10 dígitos) *" 
                            oninput="if(this.value.length > 10) this.value = this.value.slice(0, 10);" required>
                        </div>
                    </div>

                    <div class="separador-form modo-opcional">Datos Adicionales (Opcional)</div>
                    <div class="grid-formulario">
                        
                        <input type="email" id="email-j${i}" class="input-imbabura full-width" placeholder="📧 Correo Electrónico">

                        <select id="genero-j${i}" class="input-imbabura select-genero">
                            <option value="" disabled selected>⚧ Seleccionar Género</option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                            <option value="OTRO">Otro</option>
                        </select>
                        
                        <input type="number" id="edad-j${i}" class="input-imbabura" placeholder="🎂 Edad" min="5" max="99">
                        <input type="text" id="ciudad-j${i}" class="input-imbabura" placeholder="🏙️ Ciudad">
                    </div>
                </div>
            </div>`;
        contenedor.innerHTML += htmlJugador;
    }
}
export async function verificarCedula(idJugador) {
    const cedulaInput = document.getElementById(`cedula-j${idJugador}`);
    const cedula = cedulaInput.value.trim();
    const btnBuscar = cedulaInput.parentElement.querySelector('button'); 

    if (cedula.length !== 10) {
        mostrarToast("⚠️ La cédula debe tener 10 dígitos.");
        return;
    }

    const yaRegistrado = gameState.jugadoresPartida.some(j => j.cedula === cedula);
    if (yaRegistrado) {
        mostrarToast("❌ No se puede registrar con la misma cédula dos veces en la misma partida.");
        cedulaInput.style.borderColor = "#f44336";
        return; 
    }

    const textoOriginal = btnBuscar.innerText;
    btnBuscar.innerText = "⏳...";
    btnBuscar.disabled = true;

    try {
        const docRef = doc(db, "ranking_publico", cedula); 
        const docSnap = await getDoc(docRef);

        const mensajeDiv = document.getElementById(`mensaje-j${idJugador}`);
        const formExtra = document.getElementById(`form-extra-j${idJugador}`);
        const inputNombre = document.getElementById(`nombre-j${idJugador}`);
        
        // Buscamos la referencia del jugador en el estado actual para marcar sus términos
        const jugadorActual = gameState.jugadoresPartida.find(j => j.id === idJugador);

        if (docSnap.exists()) {
            // --- USUARIO EXISTE ---
            const data = docSnap.data();
            
            // ✅ GUARDAMOS QUE YA NO ES NUEVO Y YA TIENE TÉRMINOS
            if (jugadorActual) {
                jugadorActual.esNuevo = false;
                jugadorActual.aceptoTerminos = true; 
            }

            mensajeDiv.className = "mensaje-exito";
           mensajeDiv.innerHTML = `👋 <b>¡Qué gusto verte, ${data.nombre.split(" ")[0]}!</b><br>Tus datos están listos. ¡A jugar! 🚀`;
            mensajeDiv.style.display = 'block';

            inputNombre.value = data.nombre || "";
            inputNombre.disabled = true; 
            formExtra.style.display = 'none'; 
            cedulaInput.style.borderColor = "#4CAF50"; 
        } else {
            // --- USUARIO NUEVO ---
            if (jugadorActual) {
                jugadorActual.esNuevo = true;
                jugadorActual.aceptoTerminos = false;
            }

            mensajeDiv.className = "mensaje-alerta";
            mensajeDiv.innerHTML = `✨ <b>Usuario Nuevo</b><br>Por favor completa el registro.`;
            mensajeDiv.style.display = 'block';
            formExtra.style.display = 'block';
            
            formExtra.querySelectorAll('input, select').forEach(input => input.value = "");
            inputNombre.disabled = false;
            inputNombre.focus();
            cedulaInput.style.borderColor = "#FF9800"; 
        }
    } catch (error) {
        console.error("Error al buscar:", error);
        mostrarToast("❌ Error de conexión.");
    } finally {
        btnBuscar.innerText = textoOriginal;
        btnBuscar.disabled = false;
    }
}
// En tu función que lanza los términos (ej: aceptarTerminosYContinuar)
export function verificarPasoATerminos() {
    // Revisamos si hay algún jugador que SEA NUEVO (es decir, que no tenga aceptoTerminos)
    const hayJugadoresNuevos = gameState.jugadoresPartida.some(j => j.aceptoTerminos === false);

    if (hayJugadoresNuevos) {
        // Mostrar pantalla de términos solo si hay alguien nuevo
        document.getElementById('pantalla-terminos').style.display = 'flex';
    } else {
        // Si todos son antiguos (como Carla o Dereck), saltamos directo al video o nivel
        console.log("Todos son usuarios registrados, saltando términos...");
        verVideoTerminado(); 
    }
}
export function iniciarTablero() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numDiezRegex = /^\d{10}$/;

    // 1. Variable para detectar si hay al menos un jugador nuevo en esta partida
    let hayNuevos = false; 

    for (let i = 1; i <= gameState.jugadoresRegistrados; i++) {
        const formExtra = document.getElementById(`form-extra-j${i}`);
        const inputNombre = document.getElementById(`nombre-j${i}`); 
        
        const cedulaVal = document.getElementById(`cedula-j${i}`).value.trim();
        const nombreVal = inputNombre.value.trim();
        const telefono = document.getElementById(`telefono-j${i}`).value.trim();
        const email = document.getElementById(`email-j${i}`).value.trim();
        const genero = document.getElementById(`genero-j${i}`).value;
        const edad = document.getElementById(`edad-j${i}`).value;
        const ciudad = document.getElementById(`ciudad-j${i}`).value.trim();

        // Validaciones Obligatorias (Cédula)
        if (cedulaVal === "") { mostrarToast(`⚠️ Jugador${i}: Ingrese cédula.`); return; }
        if (!numDiezRegex.test(cedulaVal)) { mostrarToast(`⚠️ Jugador${i}: Cédula de 10 dígitos.`); return; }

        // Verificar duplicados en la misma partida
        for (let j = i + 1; j <= gameState.jugadoresRegistrados; j++) {
            const otraCedula = document.getElementById(`cedula-j${j}`).value.trim();
            if (cedulaVal === otraCedula) { mostrarToast(`⛔ Error: Cédula duplicada en Jugador${i} y Jugador${j}.`); return; }
        }

        // Si es nuevo y el formulario está oculto o vacío, error.
        if (inputNombre.disabled === false && (formExtra.style.display === 'none' || formExtra.style.display === '')) { 
            mostrarToast(`⚠️ J${i}: Clic en "Buscar" para verificar tus datos.`); 
            return; 
        }

        // Si ya existe (nombre disabled), saltamos validación de campos privados
        if (inputNombre.disabled === true) {
            continue; 
        }

        // --- SI EL CÓDIGO LLEGA AQUÍ, ES UN JUGADOR NUEVO ---
        hayNuevos = true; // Marcamos que hay alguien nuevo registrándose

        // Validaciones para Nuevos
        if (nombreVal === "") { mostrarToast(`⚠️ Falta Nombre J${i}`); return; }
        if (telefono === "") { mostrarToast(`⚠️ Falta Teléfono J${i}`); return; }
        if (!numDiezRegex.test(telefono)) { mostrarToast(`⚠️ J${i}: Celular 10 dígitos.`); return; }
       
    }

    // 2. Decisión final fuera del bucle
    if (hayNuevos) {
        // Si hay al menos un nuevo, mostramos el modal para que acepte
        mostrarModalTerminos(aceptarTerminosYContinuar);
    } else {
        // Si TODOS son viejos, saltamos el modal e iniciamos directo
        aceptarTerminosYContinuar();
    }
}


// En js/auth.js

export async function aceptarTerminosYContinuar() {
    const btnJugar = document.querySelector('.btn-imbabura.primario');
    
    // --- 1. MEMORIA RAM (Limpieza Local) ---
    gameState.jugadoresPartida = []; 
    gameState.inventarioPartida = {}; 

    for (let i = 1; i <= gameState.jugadoresRegistrados; i++) {
        const cedula = document.getElementById(`cedula-j${i}`).value.trim();
        const nombre = document.getElementById(`nombre-j${i}`).value.trim().toUpperCase();

        // Creamos un INVENTARIO VACÍO
        let inventarioBase = {};
        if (typeof RECOMPENSAS_DATA !== 'undefined') {
            RECOMPENSAS_DATA.forEach(item => { inventarioBase[item.key] = 0; });
        }
        // Lo guardamos en RAM
        gameState.inventarioPartida[cedula] = inventarioBase;

        // Reset de jugador en RAM
        gameState.jugadoresPartida.push({
            cedula: cedula,
            nombre: nombre,
            puntos: 0, 
            posicion: 0, // Siempre empieza en 0
            id: i,
            fichaId: i 
        });
    }

    if (btnJugar) { 
        btnJugar.innerHTML = "🚀 Iniciando..."; 
        btnJugar.disabled = true; 
    }

    try {
        const batch = writeBatch(db); 
        const fechaHoy = new Date().toISOString();

        for (let i = 1; i <= gameState.jugadoresRegistrados; i++) {
            let cedula = document.getElementById(`cedula-j${i}`).value.trim();
            const inputNombre = document.getElementById(`nombre-j${i}`);
            
            // Re-generamos el inventario base vacío para enviarlo a la nube
            let inventarioVacio = {};
            if (typeof RECOMPENSAS_DATA !== 'undefined') {
                RECOMPENSAS_DATA.forEach(item => { inventarioVacio[item.key] = 0; });
            }

            const refPublica = doc(db, "ranking_publico", cedula);
            const refPrivada = doc(db, "usuarios_privados", cedula);

            // --- DATOS PÚBLICOS ---
            let datosPublicos = {
                nombre: inputNombre.value.trim().toUpperCase(),
                avatar: `personaje_${i}`,
                ultima_conexion: fechaHoy,
                
                // 🔥 CAMBIO CLAVE 1: FORZAR REINICIO DE INVENTARIO
                // Al enviar esto, borramos cualquier moneda vieja en Firebase
                inventario: inventarioVacio, 

                // 🔥 CAMBIO CLAVE 2: FORZAR REINICIO DE POSICIÓN
                // Al iniciar, el jugador siempre debe estar en la casilla 0
                progreso_actual: {
                    nivel: 1, // O gameState.nivelSeleccionado si tienes selección previa
                    posicion: 0,
                    puntos_temporales: 0,
                    fichaId: i
                }
            };

            // 🛡️ Lógica de Niveles (Esto sí lo mantenemos por si quieres guardar récords históricos)
            // Si quieres borrar TAMBIÉN los niveles desbloqueados, quita este IF y deja solo el contenido del 'then'.
            if (inputNombre.disabled === false) {
                datosPublicos.puntuacion_total = 0;
                datosPublicos.estado_niveles = {
                    nivel_1: { desbloqueado: true,  puntos: 0, estrellas: 0 },
                    nivel_2: { desbloqueado: false, puntos: 0, estrellas: 0 },
                    nivel_3: { desbloqueado: false, puntos: 0, estrellas: 0 },
                    nivel_4: { desbloqueado: false, puntos: 0, estrellas: 0 }
                };
            }

            // --- DATOS PRIVADOS (Igual que antes) ---
            const valTelefono = document.getElementById(`telefono-j${i}`).value.trim();
            const valEmail = document.getElementById(`email-j${i}`).value.trim();
            const valGenero = document.getElementById(`genero-j${i}`).value;
            const valEdad = document.getElementById(`edad-j${i}`).value.trim();
            const valCiudad = document.getElementById(`ciudad-j${i}`).value.trim().toUpperCase();

            let datosPrivados = {
                cedula: cedula,
                registradoEn: fechaHoy,
                aceptaTerminos: true 
            };

            if (valTelefono) datosPrivados.telefono = valTelefono;
            if (valEmail) datosPrivados.email = valEmail;
            if (valGenero) datosPrivados.genero = valGenero;
            if (valEdad) datosPrivados.edad = parseInt(valEdad);
            if (valCiudad) datosPrivados.ciudad = valCiudad;

            // Enviamos con merge: true (Esto actualiza lo que enviamos y deja quieto lo que no)
            // Como enviamos 'inventario' vacío explícitamente, lo sobrescribirá.
            batch.set(refPublica, datosPublicos, { merge: true });
            batch.set(refPrivada, datosPrivados, { merge: true });
        }

        await batch.commit(); 
        console.log("✅ Partida reiniciada: Inventario y Posición borrados.");

        // Transición
        document.getElementById('pantalla-registro').style.display = 'none';
        document.getElementById('pantalla-video').style.display = 'flex';
        
        const video = document.getElementById('video-intro');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => mostrarToast("▶ Dale Play al video"));
            video.onended = () => {
                 if(window.verVideoTerminado) window.verVideoTerminado();
            };
        }

    } catch (error) {
        console.error("Error al guardar:", error);
        mostrarToast("⛔ Error de conexión.");
        if (btnJugar) { 
            btnJugar.innerHTML = "¡A JUGAR! 🚀"; 
            btnJugar.disabled = false; 
        }
    }
}

// ==========================================
// 3. LÓGICA DE PROGRESO Y PUNTUACIÓN
// ==========================================
// Guarda puntos al terminar nivel y desbloquea el siguiente
// ==========================================
// ARCHIVO: js/auth.js (Función Corregida)
// ==========================================

export async function guardarPuntosFinales() {
    console.log("💾 EJECUTANDO GUARDADO FINAL...");
    const nivelCompletado = gameState.nivelSeleccionado;

    for (const jugador of gameState.jugadoresPartida) {
        const docRef = doc(db, "ranking_publico", jugador.cedula);

        try {
            const docSnap = await getDoc(docRef);
            let datosExistentes = docSnap.exists() ? docSnap.data() : {};

            let estadoNiveles = datosExistentes.estado_niveles || {
                nivel_1: { puntos: 0, desbloqueado: true, estrellas: 0 },
                nivel_2: { puntos: 0, desbloqueado: true, estrellas: 0 },
                nivel_3: { puntos: 0, desbloqueado: true, estrellas: 0 },
                nivel_4: { puntos: 0, desbloqueado: true, estrellas: 0 }
            };

            const nivelKey = `nivel_${nivelCompletado}`;
            
            // LOG PARA DEBUG (MIRA ESTO EN LA CONSOLA)
            console.log(`👤 Jugador: ${jugador.nombre}`);
            console.log(`   - Puntos Nuevos: ${jugador.puntos}`);
            console.log(`   - Puntos Viejos en BD: ${estadoNiveles[nivelKey]?.puntos}`);

            // 🔥 CAMBIO: Quitamos el "if" para que guarde SIEMPRE el último intento
            // (Útil para pruebas. En producción podrías querer dejar solo el récord)
            
            estadoNiveles[nivelKey] = {
                puntos: jugador.puntos,  // <--- Guardamos el valor nuevo directamente
                desbloqueado: true,
                estrellas: jugador.estrellas || 0 
            };

            // Recalcular Total (Sumamos los 4 niveles con el valor nuevo)
            let nuevaPuntuacionTotal = 0;
            for (let i = 1; i <= 4; i++) {
                nuevaPuntuacionTotal += estadoNiveles[`nivel_${i}`]?.puntos || 0;
            }

            console.log(`   - Nuevo Total Global: ${nuevaPuntuacionTotal}`);

            // ENVIAMOS A FIREBASE
            await setDoc(docRef, {
                puntuacion_total: nuevaPuntuacionTotal,
                estado_niveles: estadoNiveles,
                ultima_conexion: new Date().toISOString()
            }, { merge: true });

            console.log("✅ ¡Base de datos actualizada correctamente!");

        } catch (error) {
            console.error(`❌ Error guardando puntos:`, error);
        }
    }
    mostrarToast("🎉 ¡Puntaje actualizado en BD!");
}
// Carga el Top 10 Global
export async function cargarRankingGlobal() {
    const container = document.getElementById('lista-jugadores-score');
    if (!container) return;

    // Verificar Caché (5 segundos)
    const cache = localStorage.getItem('ranking_cache');
    if (cache) {
        const { datos, timestamp } = JSON.parse(cache);
        if (Date.now() - timestamp < 5000) {
            if(window.renderizarRankingHTML) window.renderizarRankingHTML(container, datos);
            return;
        }
    }

    try {
        const q = query(collection(db, "ranking_publico"), orderBy("puntuacion_total", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        const rankingDatos = [];
        querySnapshot.forEach(doc => {
            let data = doc.data();
            data.cedula = doc.id; 
            rankingDatos.push(data);
        });

        localStorage.setItem('ranking_cache', JSON.stringify({
            datos: rankingDatos,
            timestamp: Date.now()
        }));

        if(window.renderizarRankingHTML) window.renderizarRankingHTML(container, rankingDatos);

    } catch (error) { 
        console.error("Error cargando ranking:", error);
    }
}

// Guarda posición exacta y PUNTOS en tiempo real
export async function guardarProgresoJugador(jugador) {
    try {
        const docRef = doc(db, "ranking_publico", jugador.cedula);
        
        await setDoc(docRef, {
            progreso_actual: {
                // Estas variables se mantienen igual, tal como pediste
                nivel: gameState.nivelSeleccionado,
                posicion: jugador.posicion,
                
                // 🔥 AQUÍ ESTÁ LA CLAVE: 
                // Como 'jugador.puntos' ya tiene sumada la recompensa (lo hicimos en el paso anterior),
                // esto guarda el nuevo total automáticamente en la BD.
                puntos_temporales: jugador.puntos, 
                
                fichaId: jugador.fichaId
            },
            ultima_conexion: new Date().toISOString()
        }, { merge: true });

        // Opcional: Un log para que veas en la consola que se guardó
        // console.log(`💾 Puntos guardados en vivo: ${jugador.puntos}`);

    } catch (e) {
        console.error("Error guardando posición", e);
    }
}
// Verifica niveles desbloqueados al cargar mapa
export async function actualizarMapaVisual(cedulaJugador) {
    if (!cedulaJugador) return;
    try {
        const docRef = doc(db, "ranking_publico", cedulaJugador);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
            const data = snap.data();
            const niveles = data.estado_niveles;

            if (niveles?.nivel_2?.desbloqueado) {
                const btn = document.getElementById('btn-nivel-2'); 
                if (btn) btn.disabled = false;
                const candado = document.getElementById('candado-nivel-2');
                if(candado) candado.style.display = 'none';
            }

            if (niveles?.nivel_3?.desbloqueado) {
                const btn = document.getElementById('btn-nivel-3');
                if (btn) btn.disabled = false;
                const candado = document.getElementById('candado-nivel-3');
                if(candado) candado.style.display = 'none';
            }

            // Recuperar Inventario
            if (data.inventario) {
                gameState.inventarioPartida[cedulaJugador] = data.inventario;
            }
        }
    } catch (error) {
        console.error("Error cargando mapa:", error);
    }
}

// Guarda items del inventario en tiempo real
export async function guardarInventario(cedulaJugador) {
    if (!cedulaJugador) return;
    try {
        const inventarioActual = gameState.inventarioPartida[cedulaJugador];
        const ref = doc(db, "ranking_publico", cedulaJugador);
        await setDoc(ref, {
            inventario: inventarioActual
        }, { merge: true });
    } catch (error) {
        console.error("Error guardando inventario:", error);
    }
}

// ==========================================
// 4. FUNCIONES VISUALES Y DE NAVEGACIÓN
// ==========================================

export function renderizarRankingHTML(container, datos) {
    container.innerHTML = ''; 
    if (!datos || datos.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center;">⏳ Aún no hay récords.</div>';
        return;
    }

    let posicion = 1;
    datos.forEach((datosJugador) => {
        const nombre = datosJugador.nombre ? datosJugador.nombre.split(" ")[0] : "Anónimo";
        const puntaje = datosJugador.puntuacion_total || 0;

        const div = document.createElement('div');
        div.className = 'jugador-score-item';
        div.style.cssText = `display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;`;

        let medalla = `#${posicion}`;
        let color = "#444";
        
        if (posicion === 1) { medalla = "🥇"; color = "#D4AF37"; div.style.fontWeight = "bold"; }
        else if (posicion === 2) { medalla = "🥈"; color = "#7f7f7f"; }
        else if (posicion === 3) { medalla = "🥉"; color = "#CD7F32"; }

        div.innerHTML = `<span>${medalla} <span style="color:${color}">${nombre}</span></span>
                         <span style="color:var(--color-bosque-profundo); font-weight:bold;">${puntaje} pts</span>`;
        container.appendChild(div);
        posicion++;
    });
}
// En js/auth.js

export function actualizarRankingGlobal() {
    const rankingList = document.getElementById('lista-jugadores-score');
    if (!rankingList) return;

    // 🔥 AQUÍ ESTÁ EL CAMBIO: Quitamos "limit(10)"
    const q = query(
        collection(db, "ranking_publico"), 
        orderBy("puntuacion_total", "desc") 
        // ¡Sin limit! Ahora traerá 100, 200 o los que haya.
    );

    onSnapshot(q, (querySnapshot) => {
        const datos = [];
        querySnapshot.forEach((doc) => {
            datos.push(doc.data());
        });

        // Llamamos a tu función perfecta para que pinte todo
        // Asegúrate de importar renderizarRankingHTML si está en otro archivo
        // O si tienes la lógica aquí mismo, úsala.
        if (window.renderizarRankingHTML) {
            window.renderizarRankingHTML(rankingList, datos);
        } else {
            // Si importaste la función al inicio del archivo:
            renderizarRankingHTML(rankingList, datos);
        }
    });
}
export function volverSeleccion() {
    document.getElementById('pantalla-registro').style.display = 'none';
    document.getElementById('pantalla-jugadores').style.display = 'flex';
}

export function accesoAdmin() {
    window.location.href = 'admin.html';
}



// ==========================================
// 5. EXPOSICIÓN A GLOBAL (Para HTML)
// ==========================================
// Esto es necesario si usas onclick="iniciarJuego(1)" en el HTML
window.iniciarJuego = iniciarJuego;
window.verificarCedula = verificarCedula;
window.iniciarTablero = iniciarTablero;
window.renderizarRankingHTML = renderizarRankingHTML;
window.volverSeleccion = volverSeleccion;
window.accesoAdmin = accesoAdmin;
