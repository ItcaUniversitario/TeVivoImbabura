// ==========================================
// ARCHIVO: js/auth.js
// ==========================================
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
    updateDoc,
    onSnapshot,
    serverTimestamp,
    arrayUnion // 👈 Added serverTimestamp here
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";
import { mostrarModalTerminos, mostrarToast } from './ui.js';
import { gameState, setJugadoresRegistrados, getJugadorActual } from './state.js';
import { RECOMPENSAS_DATA } from './data.js';
import { audioManager } from './audioManager.js';
import { mostrarSeleccionNiveles } from './game.js'; // Ensure this path is correct

export function prepararPantallaRegistro(cantidad) {
    setJugadoresRegistrados(cantidad);

    const pantallaJugadores = document.getElementById('pantalla-jugadores');
    if (pantallaJugadores) pantallaJugadores.style.display = 'none';

    const pantallaRegistro = document.getElementById('pantalla-registro');
    if (pantallaRegistro) pantallaRegistro.style.display = 'flex';

    const contenedor = document.getElementById('contenedor-inputs');
    contenedor.innerHTML = '';

    for (let i = 1; i <= cantidad; i++) {
        const htmlJugador = `
    <div class="ficha-jugador">
        <div class="encabezado-ficha">
            <h3 class="titulo-ficha">👤 Jugador ${i}</h3>
           
        </div>
        
       <div class="grupo-busqueda">
    <input type="tel" id="cedula-j${i}" class="input-imbabura input-cedula" 
           placeholder="🔎 Ingrese Cédula" 
           oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(this.value.length > 10) this.value = this.value.slice(0, 10);"
           onkeydown="if(event.key === 'Enter') window.verificarCedula(${i})"> 
    
    <button class="btn-imbabura primario btn-buscar" onclick="window.verificarCedula(${i})">Buscar</button>
</div>

     <div id="mensaje-j${i}" class="mensaje-alerta" 
     style="display:none; text-align: center; width: 100%; justify-content: center;">
    Bienvenido por favor. Completa el registro:
</div>
        
        <div id="form-extra-j${i}" class="campos-restantes" style="display: none;">
            
            <div class="separador-form">Datos Obligatorios <span style="color:red">*</span></div>
            <div class="grid-formulario">
                <div class="input-group">
                    <input type="text" id="nombre-j${i}" class="input-imbabura" 
                        placeholder="Nombres y Apellidos *" 
                        style="text-transform: uppercase;"
                        oninput="
                            this.value = this.value.toUpperCase();
                            let ayuda = document.getElementById('ayuda-nombre-j${i}');
                            let valor = this.value.trim();
                            
                            if (valor === '') {
                                ayuda.innerText = '';
                                this.style.borderColor = '';
                            } else if (!valor.includes(' ')) {
                                ayuda.innerText = '⚠️ Falta un apellido (añade un espacio)';
                                ayuda.style.color = '#c62828';
                                this.style.borderColor = '#c62828';
                            } else {
                                ayuda.innerText = '';
                                this.style.borderColor = '#2E7D32';
                            }
                        "
                        required>
                    <div id="ayuda-nombre-j${i}" style="font-size: 0.75rem; text-align: left; margin-top: 4px; padding-left: 5px; font-weight: bold; min-height: 15px;"></div>
                </div>

                <div class="input-group">
                    <input type="tel" id="telefono-j${i}" class="input-imbabura" 
                        placeholder="Celular*" 
                        oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(this.value.length > 10) this.value = this.value.slice(0, 10);" 
                        required>
                </div>

                <div class="input-group" style="grid-column: 1 / -1;">
                    <input type="email" id="email-j${i}" class="input-imbabura full-width" placeholder="Correo Electrónico *" required>
                </div>
            </div>

            <div class="separador-form modo-opcional">Datos Adicionales (Opcional)</div>
            <div class="grid-formulario">
                
                <select id="genero-j${i}" class="input-imbabura select-genero" >
                    <option value="" disabled selected>⚧ Seleccionar Género</option>
                    <option value="MASCULINO">MASCULINO</option>
                    <option value="FEMENINO">FEMENINO</option>
                    <option value="OTRO">OTRO</option>
                </select>
                
               <input type="tel" id="edad-j${i}" class="input-imbabura" 
       placeholder=" Edad" 
       oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(this.value.length > 2) this.value = this.value.slice(0, 2);" 
       maxlength="2">
                
                <input type="text" id="ciudad-j${i}" class="input-imbabura" 
                       placeholder=" Ciudad" 
                       
                       oninput="this.value = this.value.toUpperCase()">
            </div>
        </div>
    </div>`;

        contenedor.innerHTML += htmlJugador;
        activarBusquedaAutomatica(i);
    }
}

// ==========================================
// 🛠️ FUNCIÓN AUXILIAR (Debe estar accesible)
// ==========================================
function activarBusquedaAutomatica(idJugador) {
    // Usamos setTimeout para asegurar que el elemento ya existe en el DOM
    setTimeout(() => {
        const inputCedula = document.getElementById(`cedula-j${idJugador}`);

        if (inputCedula) {
            inputCedula.addEventListener('input', function () {
                // Limpieza de caracteres no numéricos
                let valor = this.value.replace(/\D/g, '');

                // Límite visual de 10 caracteres
                if (valor.length > 10) valor = valor.slice(0, 10);
                this.value = valor;

                // ⚡ EL DETONADOR: Si son 10 dígitos, buscamos.
                if (valor.length === 10) {
                    this.style.borderColor = "#2196F3"; // Azul (Feedback visual)
                    window.verificarCedula(idJugador);  // Llamada a tu función
                    this.blur(); // Opcional: Cerrar teclado móvil
                } else {
                    this.style.borderColor = "#ccc"; // Reset color
                }
            });
        }
    }, 0);
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
            mensajeDiv.innerHTML = `👋 <b>¡Qué gusto verte, ${data.nombre.split(" ")[0]}!</b><br>Tus datos están listos. ¡A jugar! `;
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
        // Assuming verVideoTerminado exists and handles logic appropriately. 
        // If not, use mostrarSeleccionNiveles() as fallback.
        if (typeof window.verVideoTerminado === 'function') {
            window.verVideoTerminado();
        } else {
            mostrarSeleccionNiveles();
        }
    }
}
export function iniciarTablero() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numDiezRegex = /^\d{10}$/;

    let hayNuevos = false;

    for (let i = 1; i <= gameState.jugadoresRegistrados; i++) {
        const formExtra = document.getElementById(`form-extra-j${i}`);
        const inputNombre = document.getElementById(`nombre-j${i}`);

        const cedulaVal = document.getElementById(`cedula-j${i}`).value.trim();
        const nombreVal = inputNombre.value.trim();
        const telefono = document.getElementById(`telefono-j${i}`).value.trim();
        const email = document.getElementById(`email-j${i}`).value.trim();

        // ... (tus validaciones de cédula y duplicados se mantienen igual) ...

        // Validaciones Obligatorias (Cédula)
        if (cedulaVal === "") { mostrarToast(`⚠️ Jugador${i}: Ingrese cédula.`); return; }
        if (!numDiezRegex.test(cedulaVal)) { mostrarToast(`⚠️ Jugador${i}: Cédula de 10 dígitos.`); return; }

        // (Omito la parte de duplicados y búsqueda por brevedad, se mantiene igual)

        // Si ya existe (nombre disabled), saltamos validación de campos privados
        if (inputNombre.disabled === true) {
            continue;
        }

        // --- SI EL CÓDIGO LLEGA AQUÍ, ES UN JUGADOR NUEVO ---
        hayNuevos = true;

        // Validaciones para Nuevos
        if (nombreVal === "") {
            mostrarToast(`⚠️ Falta Nombre J${i}`);
            return;
        }

        // 🔥 NUEVA VALIDACIÓN: VERIFICAR QUE TENGA AL MENOS UN ESPACIO (APELLIDO)
        if (!nombreVal.includes(" ")) {
            mostrarToast(`⚠️ Jugador ${i}: Debe ingresar al menos un nombre y un apellido.`);
            inputNombre.focus(); // Llevamos el cursor al error
            return;
        }

        if (telefono === "") { mostrarToast(`⚠️ Falta Teléfono J${i}`); return; }
        if (!numDiezRegex.test(telefono)) { mostrarToast(`⚠️ J${i}: Celular 10 dígitos.`); return; }

        if (email === "") { mostrarToast(`⚠️ Falta Correo J${i}`); return; }
        if (!emailRegex.test(email)) { mostrarToast(`⚠️ J${i}: Formato de correo inválido.`); return; }
    }

    if (hayNuevos) {
        mostrarModalTerminos(aceptarTerminosYContinuar);
    } else {
        aceptarTerminosYContinuar();
    }
}

// ==========================================
// ARCHIVO: js/auth.js (Función Actualizada)
// ==========================================

export async function aceptarTerminosYContinuar() {
    const btnJugar = document.querySelector('.btn-imbabura.primario');

    // --- 1. MEMORIA RAM (Limpieza Local) ---
    gameState.jugadoresPartida = [];
    gameState.inventarioPartida = {};

    for (let i = 1; i <= gameState.jugadoresRegistrados; i++) {
        // Datos básicos (lo que ya tenías)
        const cedula = document.getElementById(`cedula-j${i}`).value.trim();
        const nombre = document.getElementById(`nombre-j${i}`).value.trim().toUpperCase();

        // 🔥 NUEVO: Capturar datos extra AHORA para usarlos en el historial
        // (Esto no afecta tu lógica antigua, solo guarda más info en memoria)
        const telefono = document.getElementById(`telefono-j${i}`)?.value.trim();
        const email = document.getElementById(`email-j${i}`)?.value.trim();
        const genero = document.getElementById(`genero-j${i}`)?.value;
        const edad = document.getElementById(`edad-j${i}`)?.value;
        const ciudad = document.getElementById(`ciudad-j${i}`)?.value.trim().toUpperCase();

        // Creamos un INVENTARIO VACÍO
        let inventarioBase = {};
        if (typeof RECOMPENSAS_DATA !== 'undefined') {
            RECOMPENSAS_DATA.forEach(item => { inventarioBase[item.key] = 0; });
        }
        // Lo guardamos en RAM
        gameState.inventarioPartida[cedula] = inventarioBase;

        // Reset de jugador en RAM
        gameState.jugadoresPartida.push({
            id: i,
            fichaId: i,
            cedula: cedula,
            nombre: nombre,
            puntos: 0,
            posicion: 0,

            // 🔥 NUEVO: Guardamos los datos extra en el objeto jugador
            telefono: telefono,
            email: email,
            genero: genero,
            edad: edad,
            ciudad: ciudad
        });
    }

    if (btnJugar) {
        btnJugar.innerHTML = "🚀 Guardando...";
        btnJugar.disabled = true;
    }

    try {
        // 🔥 NUEVO: Guardamos en la colección NUEVA 'historial_partidas'
        // Esto ocurre antes de tu lógica actual.
        await registrarHistorialPartida();


        // ============================================================
        // 🛡️ TU LÓGICA ORIGINAL (INTACTA)
        // ============================================================
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
                inventario: inventarioVacio,
                progreso_actual: {
                    nivel: 1,
                    posicion: 0,
                    puntos_temporales: 0,
                    fichaId: i
                }
            };

            // Lógica de Niveles
            if (inputNombre.disabled === false) {
                datosPublicos.puntuacion_total = 0;
                datosPublicos.estado_niveles = {
                    nivel_1: { desbloqueado: true, puntos: 0  },
                    nivel_2: { desbloqueado: true, puntos: 0},
                    nivel_3: { desbloqueado: false, puntos: 0 },
                    nivel_4: { desbloqueado: false, puntos: 0}
                };
            }

            // --- DATOS PRIVADOS ---
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

            batch.set(refPublica, datosPublicos, { merge: true });
            batch.set(refPrivada, datosPrivados, { merge: true });
        }

        await batch.commit();
        console.log("✅ Datos guardados correctamente (Ranking y Privados).");

        // 1. Iniciamos el audio general
        if (audioManager && audioManager.playBGM) {
            audioManager.playBGM();
        }

        // 2. MOSTRAMOS LA SELECCIÓN DE NIVEL
        mostrarSeleccionNiveles();

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

export async function guardarPuntosFinales() {
    console.log("💾 EJECUTANDO GUARDADO FINAL...");
    const nivelCompletado = gameState.nivelSeleccionado;

    for (const jugador of gameState.jugadoresPartida) {
        const docRef = doc(db, "ranking_publico", jugador.cedula);

        try {
            const docSnap = await getDoc(docRef);
            let datosExistentes = docSnap.exists() ? docSnap.data() : {};

            let estadoNiveles = datosExistentes.estado_niveles || {
                nivel_1: { puntos: 0, desbloqueado: true },
                nivel_2: { puntos: 0, desbloqueado: true },
                nivel_3: { puntos: 0, desbloqueado: true },
                nivel_4: { puntos: 0, desbloqueado: true }
            };

            const nivelKey = `nivel_${nivelCompletado}`;

            console.log(`👤 Jugador: ${jugador.nombre}`);
            console.log(`   - Puntos Nuevos: ${jugador.puntos}`);
            console.log(`   - Puntos Viejos en BD: ${estadoNiveles[nivelKey]?.puntos}`);

            estadoNiveles[nivelKey] = {
                puntos: jugador.puntos,  // <--- Guardamos el valor nuevo directamente
                desbloqueado: true,
               
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
            if (window.renderizarRankingHTML) window.renderizarRankingHTML(container, datos);
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

        if (window.renderizarRankingHTML) window.renderizarRankingHTML(container, rankingDatos);

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
                nivel: gameState.nivelSeleccionado,
                posicion: jugador.posicion,
                puntos_temporales: jugador.puntos,
                fichaId: jugador.fichaId
            },
            ultima_conexion: new Date().toISOString()
        }, { merge: true });

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
                if (candado) candado.style.display = 'none';
            }

            if (niveles?.nivel_3?.desbloqueado) {
                const btn = document.getElementById('btn-nivel-3');
                if (btn) btn.disabled = false;
                const candado = document.getElementById('candado-nivel-3');
                if (candado) candado.style.display = 'none';
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
    if (!datos || datos.length === 0) {
        container.innerHTML = '<div style="padding:15px; text-align:center;">⏳ Aún no hay récords.</div>';
        return;
    }

    // 1. Iniciamos la tabla y le metemos el ENCABEZADO (thead)
    let htmlTabla = `
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 0.95rem;">
            <thead>
                <tr style="border-bottom: 2px solid #ddd; color: #888; font-weight: bold; text-transform: uppercase; font-size: 0.85rem;">
                    <th style="width: 35px; padding: 10px 0; text-align: left;">#</th>
                    <th style="padding: 10px 0; text-align: left;">NOMBRE</th>
                    <th style="width: 85px; padding: 10px 0; text-align: right;">PUNTAJE</th>
                </tr>
            </thead>
            <tbody>
    `;

    // 2. Llenamos las filas de los jugadores (tbody)
    let posicion = 1;
    datos.forEach((datosJugador) => {
        const nombre = datosJugador.nombre ? datosJugador.nombre.split(" ")[0].toUpperCase() : "ANÓNIMO";
        const puntaje = datosJugador.puntuacion_total || 0;

        let medalla = `#${posicion}`;
        let color = "#6D4C41";
        let pesoFuente = "bold";

        if (posicion === 1) { medalla = "🥇"; color = "#D4AF37"; pesoFuente = "900"; }
        else if (posicion === 2) { medalla = "🥈"; color = "#7f7f7f"; pesoFuente = "800"; }
        else if (posicion === 3) { medalla = "🥉"; color = "#CD7F32"; pesoFuente = "800"; }

        htmlTabla += `
            <tr style="border-bottom: 1px solid #eee;">
                
                <td style="padding: 10px 0; text-align: left; color: #888; font-weight: bold;">
                    ${medalla}
                </td>
                
                <td style="padding: 10px 0; text-align: left; color: ${color}; font-weight: ${pesoFuente}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${nombre}
                </td>
                
                <td style="padding: 10px 0; text-align: right; color: var(--color-bosque-profundo, #2E7D32); font-weight: 900; white-space: nowrap;">
                    ${puntaje} pts
                </td>
                
            </tr>
        `;
        posicion++;
    });

    // 3. Cerramos la tabla y la inyectamos en el HTML
    htmlTabla += `
            </tbody>
        </table>
    `;

    container.innerHTML = htmlTabla;
}
export function actualizarRankingGlobal() {
    const rankingList = document.getElementById('lista-jugadores-score');
    if (!rankingList) return;

    const q = query(
        collection(db, "ranking_publico"),
        orderBy("puntuacion_total", "desc")
    );

    onSnapshot(q, (querySnapshot) => {
        const datos = [];
        querySnapshot.forEach((doc) => {
            datos.push(doc.data());
        });

        if (window.renderizarRankingHTML) {
            window.renderizarRankingHTML(rankingList, datos);
        } else {
            renderizarRankingHTML(rankingList, datos);
        }
    });
}
export function volverSeleccion() {
    document.getElementById('pantalla-registro').style.display = 'none';
    document.getElementById('pantalla-jugadores').style.display = 'flex';
}

export function accesoAdmin() {
    window.open('admin.html', '_blank');
}

// ==========================================
// 🎨 DICCIONARIO DE FICHAS (CONFIGURACIÓN)
// ==========================================
export const NOMBRES_FICHAS = {
    1: "Paila de Bronce",   // ficha_1
    2: "Columpio Mirador",  // ficha_2
    3: "Sombrero Otavalo",  // ficha_3
    4: "Chacana Andina",    // ficha_4
    5: "Hilo Textil",       // ficha_5
    6: "Cabaña Mirador"     // ficha_6
};

// ==========================================
// 🆕 NUEVA FUNCIÓN: REGISTRO ADMINISTRATIVO
// (Guarda en 'historial_partidas' sin tocar lo demás)
// ==========================================
export async function registrarHistorialPartida() {
    const ahora = Date.now();
    // Generar ID único de partida
    const codigoRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
    gameState.idPartidaActual = `PARTIDA_${codigoRandom}_${ahora}`;
    gameState.timestampInicio = ahora;

    console.log(`📂 Creando historial administrativo: ${gameState.idPartidaActual}`);

    const promesas = [];

    // Recorremos los jugadores guardados en memoria (gameState)
    gameState.jugadoresPartida.forEach(jugador => {

        const docId = `${jugador.cedula}_${ahora}`;
        jugador.firebaseDocId = docId; // Referencia para uso futuro

        const ref = doc(db, "historial_partidas", docId);

        // Guardamos TODO lo que capturamos
        const datosAdmin = {
            partida_id: gameState.idPartidaActual,
            cedula: jugador.cedula,
            nombre: jugador.nombre,

            // Datos extra (si no están, pone 'No registrado')
            email: jugador.email || "No registrado",
            telefono: jugador.telefono || "No registrado",
            genero: jugador.genero || "No especificado",
            edad: jugador.edad || null,
            ciudad: jugador.ciudad || "No especificada",

            // Configuración
            modo: gameState.jugadoresRegistrados > 1 ? "GRUPAL" : "INDIVIDUAL",
            fecha: serverTimestamp(),
            estado: "INICIADO",
            puntos_iniciales: 0
        };

        promesas.push(setDoc(ref, datosAdmin));
    });

    try {
        await Promise.all(promesas);
        console.log("✅ Historial guardado en colección nueva.");
    } catch (error) {
        console.error("⚠️ Error guardando historial:", error);
    }
}

// =========================================================
// 📝 1. GUARDAR RESULTADOS DETALLADOS DEL QUIZ (INICIO O FINAL)
// =========================================================
export async function guardarQuizEnHistorial(tipo, cedulaJugador, arrayRespuestas) {
    // tipo debe ser "quiz_inicial" o "quiz_final"
    const jugador = gameState.jugadoresPartida.find(j => j.cedula === cedulaJugador);
    if (!jugador || !jugador.firebaseDocId) return;

    const ref = doc(db, "historial_partidas", jugador.firebaseDocId);

    try {
        // Usamos [tipo] para que sirva tanto para inicial como final
        await updateDoc(ref, {
            [tipo]: arrayRespuestas
        });
        console.log(`📝 ${tipo} guardado para ${jugador.nombre}`);
    } catch (e) {
        console.error(`Error guardando ${tipo}:`, e);
    }
}

// =========================================================
// ♟️ 2. GUARDAR LA FICHA SELECCIONADA
// =========================================================
export async function guardarFichaEnHistorial(cedulaJugador, fichaId) {
    const jugador = gameState.jugadoresPartida.find(j => j.cedula === cedulaJugador);
    if (!jugador || !jugador.firebaseDocId) return;

    // 🔍 Buscamos el nombre bonito, si no existe ponemos "Desconocida"
    const nombreFicha = NOMBRES_FICHAS[fichaId] || `Ficha ${fichaId}`;

    const ref = doc(db, "historial_partidas", jugador.firebaseDocId);

    try {
        await updateDoc(ref, {
            ficha_id: fichaId,         // Guardamos el número por si acaso (Ej: 1)
            ficha_nombre: nombreFicha, // 🔥 Guardamos el nombre (Ej: "Paila de Bronce")
            ultima_actualizacion: serverTimestamp()
        });
        console.log(`♟️ Ficha guardada: ${nombreFicha} para ${jugador.nombre}`);
    } catch (e) {
        console.error("Error guardando ficha:", e);
    }
}

// =========================================================
// 🏁 3. GUARDADO FINAL (CON DETALLE DE RECOMPENSAS)
// =========================================================
export async function guardarCierrePartida(cedulaJugador, posicion, puntajeFinal, desglosePuntos) {
    // desglosePuntos es un objeto: { base: 100, bono: 50 }

    const jugador = gameState.jugadoresPartida.find(j => j.cedula === cedulaJugador);
    if (!jugador || !jugador.firebaseDocId) return;

    const ref = doc(db, "historial_partidas", jugador.firebaseDocId);

    try {
        await updateDoc(ref, {
            estado: "FINALIZADO",
            posicion_llegada: posicion,
            puntos_finales: puntajeFinal, // El total ya sumado

            // 🔥 NUEVO: Guardamos el nivel seleccionado
            nivel_seleccionado: gameState.nivelSeleccionado, //

            // 🔥 NUEVO: Guardamos el desglose para auditoría
            detalle_puntos: {
                juego_base: desglosePuntos.base || 0,
                bono_items: desglosePuntos.bono || 0
            },

            fecha_fin: serverTimestamp()
        });
        console.log("🏁 Historial cerrado con desglose de recompensas y nivel.");
    } catch (e) {
        console.error("Error cerrando historial:", e);
    }
}
// =========================================================
// 📝 GUARDAR RESPUESTA INDIVIDUAL (TIEMPO REAL)
// =========================================================
export async function registrarRespuestaIndividual(tipo, cedulaJugador, objetoRespuesta) {
    // tipo: 'quiz_inicial' o 'quiz_final'
    const jugador = gameState.jugadoresPartida.find(j => j.cedula === cedulaJugador);
    if (!jugador || !jugador.firebaseDocId) return;

    const ref = doc(db, "historial_partidas", jugador.firebaseDocId);

    try {
        // 'arrayUnion' mete el objeto en la lista sin borrar lo que ya estaba
        await updateDoc(ref, {
            [tipo]: arrayUnion(objetoRespuesta)
        });
        // Opcional: console.log(`✅ Respuesta guardada para ${jugador.nombre}`);
    } catch (e) {
        console.error(`Error guardando respuesta en vivo:`, e);
    }
}

// ==========================================
// 5. EXPOSICIÓN A GLOBAL (Para HTML)
// ==========================================

window.prepararPantallaRegistro = prepararPantallaRegistro;
window.verificarCedula = verificarCedula;
window.iniciarTablero = iniciarTablero;
window.renderizarRankingHTML = renderizarRankingHTML;
window.volverSeleccion = volverSeleccion;
window.accesoAdmin = accesoAdmin;