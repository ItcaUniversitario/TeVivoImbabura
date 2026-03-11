// 1. IMPORTAR APP
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// 2. IMPORTAR BASE DE DATOS (Firestore)
import { getFirestore, collection, getDocs, query, orderBy, doc, setDoc, where,getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// 3. IMPORTAR AUTENTICACIÓN (Auth)
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- CONFIGURACIÓN Y VARIABLES ---
const firebaseConfig = {
    apiKey: "AIzaSyDtgE2I0eYet03R6VfeXvgvXtEpdAUaYSo",
    authDomain: "juego-te-vivo-imababura.firebaseapp.com",
    projectId: "juego-te-vivo-imababura",
    storageBucket: "juego-te-vivo-imababura.firebasestorage.app",
    messagingSenderId: "54108968941",
    appId: "1:54108968941:web:2ac23cd1eac1e6781b39e4",
    measurementId: "G-320511XQMN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables globales
let globalScoreData = [];

// --- UTILIDAD: ENCRIPTAR CONTRASEÑA (SHA-256) ---
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- FUNCIÓN 1: LOGIN SEGURO MEJORADA ---
window.validarIngreso = async function() {
    const inputEmail = document.getElementById('admin-user').value.trim(); 
    const inputPass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('msg-error');

    if (!inputEmail || !inputPass) {
        errorMsg.style.display = 'block';
        errorMsg.innerText = "⚠️ Por favor ingresa correo y contraseña";
        return;
    }

    try {
        // 1. Autenticación con Firebase Auth
        await signInWithEmailAndPassword(auth, inputEmail, inputPass);
        
        console.log("Login correcto: " + inputEmail);

        // 2. BUSCAR EL NOMBRE DEL ADMIN EN FIRESTORE (Nuevo paso) 🌟
        try {
            // Buscamos en la colección 'administradores' quien tenga este email
            const q = query(collection(db, "administradores"), where("email", "==", inputEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Si encontramos al admin, sacamos sus datos
                const adminData = querySnapshot.docs[0].data();
                const nombreCompleto = `${adminData.nombres} ${adminData.apellidos || ''}`;
                
                // Lo mostramos en el sidebar
                const labelNombre = document.getElementById('nombre-admin-sidebar');
                if(labelNombre) labelNombre.innerText = nombreCompleto;
            } else {
                // Si entra pero no está en la base de datos (raro, pero posible)
                document.getElementById('nombre-admin-sidebar').innerText = "Administrador";
            }
        } catch (errName) {
            console.error("No se pudo cargar el nombre del admin", errName);
        }
        
       // 3. Ocultar login y mostrar panel
        document.getElementById('overlay-login').style.display = 'none';
        const mainLayout = document.querySelector('.admin-layout');
        if(mainLayout) {
            mainLayout.style.filter = 'none';
            mainLayout.style.pointerEvents = 'auto';
            mainLayout.style.opacity = '1';
        }

        // 4. Cargar datos INICIALES (Solo lo vital)
        cargarDashboard();
       
    } catch (error) {
        console.error("🔥 ERROR:", error); 
        errorMsg.style.display = 'block';
        errorMsg.classList.add('error-shake');
        setTimeout(() => errorMsg.classList.remove('error-shake'), 500);

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMsg.innerText = "⛔ Correo o contraseña incorrectos";
        } else {
            errorMsg.innerText = "❌ Error: " + (error.message || "Desconocido");
        }
    }
}

// --- FUNCIÓN 2: CARGAR REGISTROS (FUSIÓN PÚBLICO + PRIVADO) ---
async function cargarRegistrosFusionados() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const totalLabel = document.getElementById('total-registros');
    
    // Mensaje de carga
    if(cuerpoTabla) cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align:center">🔄 Cargando datos seguros...</td></tr>';

    try {
        const [publicosSnap, privadosSnap] = await Promise.all([
            getDocs(collection(db, "ranking_publico")),
            getDocs(collection(db, "usuarios_privados"))
        ]);

        if(totalLabel) totalLabel.innerHTML = publicosSnap.size;
        if(cuerpoTabla) cuerpoTabla.innerHTML = '';

        // Crear mapa de privados
        const mapaPrivados = {};
        privadosSnap.forEach(doc => mapaPrivados[doc.id] = doc.data());

        // Recorrer y fusionar
        publicosSnap.forEach((doc) => {
            const dataPub = doc.data();
            const id = doc.id;
            const dataPriv = mapaPrivados[id] || {}; 

            const fechaISO = dataPriv.registradoEn || ""; 
            const fechaTexto = fechaISO ? new Date(fechaISO).toLocaleString() : "S/F";
            const acepta = dataPriv.aceptaTerminos ? "✅ SI" : "❌ NO";

            if(cuerpoTabla) {
                cuerpoTabla.innerHTML += `
                    <tr data-fecha="${fechaISO}">
                        <td><small>${fechaTexto}</small></td>
                        <td><strong>${id}</strong></td>
                        <td>${dataPriv.edad || '-'}</td>
                        <td>${dataPub.nombre || 'ANÓNIMO'}</td>
                        <td>${dataPriv.ciudad || '-'}</td>
                        <td>${dataPriv.email || '-'}</td>
                        <td>${dataPriv.genero || '-'}</td>
                        <td>${dataPriv.telefono || '-'}</td>
                        <td>${acepta}</td>
                        <td>${fechaTexto}</td>
                    </tr>`;
            }
        });

        window.filtrarTabla();

    } catch (error) {
        console.error("Error cargando registros:", error);
        if(cuerpoTabla) cuerpoTabla.innerHTML = `<tr><td colspan="10" style="color:red; text-align:center">⛔ Error de lectura en Base de Datos</td></tr>`;
    }
}

// --- FUNCIÓN 3: CARGAR SCORE GLOBAL ---
async function cargarScoreGlobal() {
    const cuerpo = document.getElementById('cuerpo-tabla-score');
    const total = document.getElementById('total-registros-score');
    globalScoreData = [];

    try {
        const q = query(collection(db, "ranking_publico"), orderBy("puntuacion_total", "desc"));
        const snap = await getDocs(q);

        if(total) total.innerHTML = snap.size;
        if(cuerpo) cuerpo.innerHTML = '';

        snap.forEach(doc => {
            const d = doc.data();
            const lvls = d.estado_niveles || {};
            globalScoreData.push({
                cedula: doc.id,
                nombre: d.nombre,
                total: d.puntuacion_total || 0,
                n1: lvls.nivel_1?.puntos || 0,
                n2: lvls.nivel_2?.puntos || 0,
                n3: lvls.nivel_3?.puntos || 0,
                n4: lvls.nivel_4?.puntos || 0
            });
        });

        globalScoreData.forEach((j, i) => {
            if(cuerpo) {
                cuerpo.innerHTML += `
                    <tr>
                        <td>#${i+1}</td>
                        <td>${j.cedula}</td>
                        <td>${j.nombre}</td>
                        <td class="score-total">${j.total}</td>
                        <td>${j.n1}</td>
                        <td>${j.n2}</td>
                        <td>${j.n3}</td>
                        <td>${j.n4}</td>
                    </tr>`;
            }
        });

    } catch (e) {
        if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="8">Error cargando scores</td></tr>';
    }
}

// --- FILTROS (LÓGICA INTACTA) ---

window.filtrarScore = function() {
    const texto = document.getElementById('filtro-score-texto').value.toUpperCase();
    const filas = document.querySelectorAll('#cuerpo-tabla-score tr');
    let contador = 0;

    filas.forEach(fila => {
        const txtFila = fila.innerText.toUpperCase();
        if(txtFila.includes(texto)) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });
    const labelTotal = document.getElementById('total-registros-score');
    if(labelTotal) labelTotal.innerText = contador;
}

window.filtrarTop10 = function() {
    document.getElementById('filtro-score-texto').value = "";
    const filas = document.querySelectorAll('#cuerpo-tabla-score tr');
    let contador = 0;
    filas.forEach((fila, index) => {
        if (index < 10) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });
    const labelTotal = document.getElementById('total-registros-score');
    if(labelTotal) labelTotal.innerText = contador;
}

window.limpiarFiltrosScore = function() {
    document.getElementById('filtro-score-texto').value = "";
    window.filtrarScore(); 
}

// --- FILTRO TABLA PRINCIPAL (LÓGICA INTACTA) ---
window.filtrarTabla = function() {
    const texto = document.getElementById('filtro-texto').value.toUpperCase();
    
    // Verificamos si los inputs existen (por si acaso no se han renderizado aún)
    const inputCiudad = document.getElementById('filtro-ciudad');
    const ciudad = inputCiudad ? inputCiudad.value.toUpperCase() : "";
    
    const inputEdad = document.getElementById('filtro-edad');
    const edad = inputEdad ? inputEdad.value : "";
    
    const inputGenero = document.getElementById('filtro-genero');
    const genero = inputGenero ? inputGenero.value.toUpperCase() : "";

    const fechaDesdeInput = document.getElementById('filtro-fecha-desde');
    const fechaHastaInput = document.getElementById('filtro-fecha-hasta');
    
    // Fechas
    const fechaDesde = (fechaDesdeInput && fechaDesdeInput.value) ? new Date(fechaDesdeInput.value + "T00:00:00") : null;
    const fechaHasta = (fechaHastaInput && fechaHastaInput.value) ? new Date(fechaHastaInput.value + "T23:59:59") : null;

    const filas = document.querySelectorAll('#cuerpo-tabla tr');
    let contador = 0;

    filas.forEach(fila => {
        if(fila.cells.length < 2) return; 

        const txtFila = fila.innerText.toUpperCase();
        const coincideTexto = txtFila.includes(texto) && 
                              txtFila.includes(ciudad) && 
                              (edad === "" || txtFila.includes(edad)) &&
                              (genero === "" || txtFila.includes(genero));

        let coincideFecha = true;
        const fechaFilaRaw = fila.getAttribute('data-fecha');

        if (fechaFilaRaw) {
            const fechaFila = new Date(fechaFilaRaw);
            if (fechaDesde && fechaFila < fechaDesde) coincideFecha = false;
            if (fechaHasta && fechaFila > fechaHasta) coincideFecha = false;
        }

        if(coincideTexto && coincideFecha) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });

    const totalReg = document.getElementById('total-registros');
    if(totalReg) totalReg.innerText = contador;
}

window.limpiarFiltros = function() {
    ['filtro-texto', 'filtro-ciudad', 'filtro-edad', 'filtro-genero', 'filtro-fecha-desde', 'filtro-fecha-hasta'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
    window.filtrarTabla();
}
window.cambiarModulo = function(id) {
    console.log(`Navegando a módulo: ${id}`);

    // 1. Ocultar todos los paneles y desactivar botones
    document.querySelectorAll('.panel-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

    // 2. Calcular cuál es el ID del panel a mostrar
    // Por defecto buscamos 'panel-' + id (ej: panel-inicio, panel-db...)
    let idPanelDestino = 'panel-' + id;

    // 🛠️ EXCEPCIÓN: Si el id es 'admin', el panel se llama 'panel-configuracion'
    if (id === 'admin') {
        idPanelDestino = 'panel-configuracion';
    }

    // 3. Mostrar el nuevo panel y activar el botón
    const panel = document.getElementById(idPanelDestino);
    const btn = document.getElementById('nav-' + id);
    
    if(panel) panel.classList.add('active');
    if(btn) btn.classList.add('active');

    // 4. CARGAR DATOS (El Cerebro) 🧠
    if(id === 'db') cargarRegistrosFusionados();
    if(id === 'score') cargarScoreGlobal();
    if(id === 'historial') cargarHistorial();
    if(id === 'inicio') cargarDashboard();

    // Lógica para Certificados
    if(id === 'certificados') {
        if(typeof cambiarSubTab === 'function') cambiarSubTab('generar'); 
        if(typeof cargarTablaCertificados === 'function') cargarTablaCertificados();
    }

    // 🔥 NUEVO: Lógica para Configuración
    if(id === 'admin') {
        // Carga el estado del "Modo Feria" y la lista de admins desde Firebase
        if(typeof cargarConfiguracion === 'function') {
            cargarConfiguracion(); 
        }
    }
}

// Botón hamburguesa móvil
window.toggleSidebar = function() {
    document.querySelector('.sidebar').classList.toggle('open');
}


// --- CREAR NUEVO ADMIN ---
window.registrarNuevoAdmin = async function() {
    const cedula = document.getElementById('new-admin-cedula').value.trim();
    // ... Nota: Aquí deberías completar con el resto de inputs del nuevo HTML si usas nombres distintos,
    // pero he mantenido la lógica original. Asegúrate que en el HTML los inputs tengan estos IDs:
    // 'new-admin-nombre', 'new-admin-apellido', etc.
    const pass = document.getElementById('new-admin-pass').value;
    const msgLabel = document.getElementById('msg-admin');

    if (!cedula || !pass) {
        msgLabel.style.color = "red";
        msgLabel.innerText = "⛔ Ingresa al menos Cédula y Contraseña";
        return;
    }

    msgLabel.style.color = "blue";
    msgLabel.innerText = "⏳ Creando...";

    try {
        const passwordHash = await sha256(pass);
        
        // Obtenemos los otros valores si existen en el HTML nuevo, sino vacíos
        const nombre = document.getElementById('new-admin-nombre')?.value || "Admin";
        const apellido = document.getElementById('new-admin-apellido')?.value || "";
        const email = document.getElementById('new-admin-email')?.value || "";
        const edad = document.getElementById('new-admin-edad')?.value || "";
        const ciudad = document.getElementById('new-admin-ciudad')?.value || "";

        await setDoc(doc(db, "administradores", cedula), {
            nombres: nombre, apellidos: apellido, email: email,
            edad: edad, ciudad: ciudad, password: passwordHash,
            rol: "admin", creadoPor: "Panel Dashboard", fecha: new Date().toISOString()
        });

        msgLabel.style.color = "green";
        msgLabel.innerText = "✅ ¡Administrador creado!";
        document.getElementById('new-admin-cedula').value = "";
        document.getElementById('new-admin-pass').value = "";

    } catch (error) {
        console.error(error);
        msgLabel.style.color = "red";
        msgLabel.innerText = "❌ Error: " + error.message;
    }
}


// --- EXPORTAR EXCEL (Mejorado) ---
window.exportarExcel = function() {
    const tabla = document.getElementById("tabla-jugadores");
    if(!tabla) return; 

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"></head> <body><table>${tabla.innerHTML}</table></body>
        </html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Reporte_Jugadores_Imbabura.xls';
    a.click(); URL.revokeObjectURL(url);
}

window.exportarExcelScore = function() {
    const tabla = document.getElementById("tabla-score");
    if(!tabla) return; 

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"></head> 
        <body><h3>Ranking Global</h3><table>${tabla.innerHTML}</table></body>
        </html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Reporte_Score.xls';
    a.click(); URL.revokeObjectURL(url);
}

// Inicializar tecla Enter
document.addEventListener("DOMContentLoaded", () => {
    const passInput = document.getElementById('admin-pass');
    if(passInput) {
        passInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") window.validarIngreso();
        });
    }
});
// --- VARIABLES GLOBALES PARA HISTORIAL ---
let historialDataGlobal = []; // Aquí guardaremos los datos crudos de Firebase
// 1. CARGAR DATOS DE FIREBASE (CORREGIDO PARA LEER NIVEL_SELECCIONADO)
window.cargarHistorial = async function() {
    const cuerpo = document.getElementById('cuerpo-historial');
    if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="11" style="text-align:center">🔄 Conectando con Firebase...</td></tr>';

    try {
        const q = query(collection(db, "historial_partidas"), orderBy("fecha", "desc")); 
        const snap = await getDocs(q);

        historialDataGlobal = []; 

        if (snap.empty) {
            cuerpo.innerHTML = '<tr><td colspan="11" style="text-align:center">No hay partidas registradas.</td></tr>';
            return;
        }

        snap.forEach(doc => {
            const d = doc.data();
            
            historialDataGlobal.push({
                raw: d, 
                fechaObj: d.fecha && d.fecha.toDate ? d.fecha.toDate() : null,
                cedula: d.cedula || d.cedula_jugador || "",
                nombre: d.nombre || "Anónimo",
                
                // 🔥 AQUÍ ESTÁ LA CORRECCIÓN CLAVE:
                // Agregamos 'd.nivel_seleccionado' a la lista de búsqueda
                nivel: d.nivel_jugado || d.nivel_seleccionado || d.nivel || 1, 
                
                puntos: d.puntos_finales || d.puntos || 0,
                busqueda: ((d.nombre || "") + " " + (d.cedula || d.cedula_jugador || "")).toUpperCase()
            });
        });

        aplicarFiltrosHistorial();

    } catch (error) {
        console.error("Error historial:", error);
        if(cuerpo) cuerpo.innerHTML = `<tr><td colspan="11" style="color:red; text-align:center">⛔ Error: ${error.message}</td></tr>`;
    }
}

// 2. LÓGICA DE FILTRADO (Esta es la que hace la magia de "Solo última partida")
window.aplicarFiltrosHistorial = function() {
    // A. Obtener valores de los inputs
    const texto = document.getElementById('historial-busqueda').value.toUpperCase();
    const fechaDesdeInput = document.getElementById('historial-fecha-desde').value;
    const fechaHastaInput = document.getElementById('historial-fecha-hasta').value;
    const soloUnicos = document.getElementById('check-unicos').checked;

    // Convertir fechas para comparar
    const fechaDesde = fechaDesdeInput ? new Date(fechaDesdeInput + "T00:00:00") : null;
    const fechaHasta = fechaHastaInput ? new Date(fechaHastaInput + "T23:59:59") : null;

    // B. Filtrado inicial (Texto y Fechas)
    let listaFiltrada = historialDataGlobal.filter(item => {
        // 1. Filtro Texto
        if (!item.busqueda.includes(texto)) return false;

        // 2. Filtro Fechas
        if (item.fechaObj) {
            if (fechaDesde && item.fechaObj < fechaDesde) return false;
            if (fechaHasta && item.fechaObj > fechaHasta) return false;
        }
        return true;
    });

    // C. FILTRO ESPECIAL: "Solo última partida de cada jugador"
    if (soloUnicos) {
        const mapaUnicos = new Map();
        
        listaFiltrada.forEach(item => {
            // Como la lista YA viene ordenada por fecha descendente desde Firebase,
            // la primera vez que aparece una cédula, ES la partida más reciente.
            if (!mapaUnicos.has(item.cedula)) {
                mapaUnicos.set(item.cedula, item);
            }
        });
        
        // Reemplazamos la lista con solo los valores únicos
        listaFiltrada = Array.from(mapaUnicos.values());
    }

    // D. Mandar a dibujar
    renderizarTablaHistorial(listaFiltrada);
}

// 3. DIBUJAR LA TABLA (Separado para poder reusarlo)
function renderizarTablaHistorial(listaDatos) {
    const cuerpo = document.getElementById('cuerpo-historial');
    cuerpo.innerHTML = '';
    
    // Actualizar contador visual si quieres
    // document.getElementById('total-historial-count').innerText = listaDatos.length;

    if (listaDatos.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="11" style="text-align:center; color:#666;">No se encontraron coincidencias.</td></tr>';
        return;
    }

    listaDatos.forEach(item => {
        const d = item.raw; // Recuperamos los datos originales de Firebase

        // --- LÓGICA DE RENDERIZADO (IGUAL A LA QUE YA TENÍAS) ---
        
        // FECHA
        let fechaTexto = "S/F";
        let duracionTexto = "-";
        if (item.fechaObj) {
            fechaTexto = item.fechaObj.toLocaleString('es-EC', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            if (d.fecha_fin && d.fecha_fin.toDate) {
                const diffMs = d.fecha_fin.toDate() - item.fechaObj;
                const mins = Math.floor(diffMs / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                duracionTexto = `${mins}m ${secs}s`;
            }
        }

        // QUIZZES
        const generarCelda = (quizArray, tipo) => {
            if (!quizArray || !Array.isArray(quizArray) || quizArray.length === 0) return '<span style="color:#ccc;font-size:0.8rem">-</span>';
            const aciertos = quizArray.filter(p => p.es_correcta).length;
            const total = quizArray.length;
            let color = aciertos === total ? '#2e7d32' : (aciertos > 0 ? '#f57f17' : '#c62828');
            const dataStr = encodeURIComponent(JSON.stringify(quizArray)).replace(/'/g, "%27");
            
            return `<div style="display:flex; flex-direction:column; align-items:center;">
                <strong style="color:${color}; font-size:0.9rem;">${aciertos}/${total}</strong>
                <button class="btn-ver-quiz" onclick="abrirModalQuiz('${dataStr}', '${tipo}')">👁️ Ver</button>
            </div>`;
        };

        const celdaQuizIni = generarCelda(d.quiz_inicial, 'Inicial');
        const celdaQuizFin = generarCelda(d.quiz_final, 'Final');

        // PUNTOS
        let puntosHTML = `<span style="font-weight:bold;">${d.puntos_finales || 0}</span>`;
        if (d.detalle_puntos) puntosHTML += `<br><span style="font-size:0.7rem; color:#666">Base:${d.detalle_puntos.juego_base||0} | Bono:${d.detalle_puntos.bono_items||0}</span>`;

        // POSICIÓN
        let posHTML = d.posicion_llegada || '-';
        if(d.posicion_llegada===1) posHTML='🥇 1';
        if(d.posicion_llegada===2) posHTML='🥈 2';
        if(d.posicion_llegada===3) posHTML='🥉 3';

        const nivel = d.nivel || "-";
const nivelLabel = item.nivel || 1;
const colorNivel = nivelLabel > 1 ? '#E65100' : '#2E7D32'; // Naranja si es >1, Verde si es 1

cuerpo.innerHTML += `
    <tr>
        <td><small>${fechaTexto}</small></td>
        <td>
            <b>${item.nombre}</b><br>
            <small style="color:#666">${item.cedula}</small>
        </td>
        <td>${d.ficha_nombre || '-'}</td>
        <td><span class="badge-modo">${d.modo || '-'}</span></td>
        
        <td style="text-align:center;">
            <span style="background-color:${colorNivel}; color:white; padding:3px 8px; border-radius:10px; font-size:0.85rem; font-weight:bold;">
                 ${nivelLabel}
            </span>
        </td>

        <td style="font-family:monospace;">${duracionTexto}</td>
        <td style="text-align:center;">${posHTML}</td>
        <td>${puntosHTML}</td>
        <td style="text-align:center;">${celdaQuizIni}</td>
        <td style="text-align:center;">${celdaQuizFin}</td>
        <td><small>${d.estado || '-'}</small></td>
    </tr>`;
    });
}

// --- FUNCIONES PARA LA VENTANA MODAL (POP-UP) ---

window.abrirModalQuiz = function(datosCodificados, tituloQuiz) {
    // 1. Recuperamos los datos originales
    const preguntas = JSON.parse(decodeURIComponent(datosCodificados));
    
    // 2. Referencias al DOM
    const modal = document.getElementById('modal-quiz');
    const tituloEl = document.getElementById('modal-titulo');
    const cuerpoEl = document.getElementById('modal-body');

    // 3. Llenamos la información
    tituloEl.innerText = `Detalle: Quiz ${tituloQuiz}`;
    cuerpoEl.innerHTML = ''; // Limpiar lo anterior

    // 4. Generamos las tarjetas de preguntas
    preguntas.forEach((p, i) => {
        const esCorrecta = p.es_correcta === true;
        const claseColor = esCorrecta ? 'borde-verde' : 'borde-rojo';
        const icono = esCorrecta ? '✅ Correcto' : '❌ Incorrecto';
        const respuestaUser = p.respuesta_usuario || 'No respondió';

        cuerpoEl.innerHTML += `
            <div class="card-pregunta ${claseColor}">
                <div style="font-weight:bold; margin-bottom:5px; color:#333;">
                    ${i + 1}. ${p.pregunta}
                </div>
                <div style="font-size:0.9rem; color:#555;">
                    Respuesta: <i>"${respuestaUser}"</i>
                </div>
                <div style="margin-top:8px; font-weight:bold; font-size:0.85rem; color:${esCorrecta ? 'green' : 'red'}">
                    ${icono}
                </div>
            </div>
        `;
    });

    // 5. Mostrar
    modal.style.display = 'flex';
}

window.cerrarModalQuiz = function() {
    document.getElementById('modal-quiz').style.display = 'none';
}

// Cerrar al dar click afuera
window.onclick = function(e) {
    const modal = document.getElementById('modal-quiz');
    if (e.target === modal) {
        cerrarModalQuiz();
    }
}
// =========================================================
// 📊 EXPORTAR HISTORIAL A EXCEL (CORREGIDO PARA LEER PREGUNTAS)
// =========================================================
window.exportarExcelHistorial = function() {
    const tablaOriginal = document.getElementById("tabla-historial");
    if (!tablaOriginal) {
        alert("No se encontró la tabla para exportar.");
        return;
    }

    // 1. Clonamos la tabla para modificarla sin afectar lo que ve el admin
    const tablaClon = tablaOriginal.cloneNode(true);

    // --- HELPER: Extrae y formatea las preguntas del botón ---
    const formatearQuizParaExcel = (btnElement) => {
        try {
            // Obtenemos el texto del onclick: abrirModalQuiz('DatosCodificados...', 'Titulo')
            const rawOnClick = btnElement.getAttribute('onclick'); 
            if (!rawOnClick) return "Sin datos";

            // 🔥 ESTRATEGIA ROBUSTA: Usamos split para sacar lo que está entre comillas
            // El array resultante [1] siempre será el primer argumento (los datos)
            const partes = rawOnClick.split("'");
            
            if (!partes[1]) return "Error formato"; // Si no encuentra comillas

            const dataEncoded = partes[1];
            // Decodificamos los datos
            const preguntas = JSON.parse(decodeURIComponent(dataEncoded));

            const total = preguntas.length;
            const aciertos = preguntas.filter(p => p.es_correcta === true).length;
            
            // Construimos el HTML interno de la celda de Excel
            // 'mso-number-format' evita que Excel cambie formatos
            let html = `<div style="mso-number-format:'@'">`; 
            
            // Nota Global
            html += `<b style="font-size:14px; color:#1B5E20;">NOTA: ${aciertos}/${total}</b><br style="mso-data-placement:same-cell;" />`;
            html += `<span style="color:#999">-------------------</span><br style="mso-data-placement:same-cell;" />`;

            // Listado de Preguntas
            preguntas.forEach((p, i) => {
                const icono = p.es_correcta ? "✅" : "❌";
                // Limpiamos etiquetas HTML de la pregunta por si acaso
                const pregTexto = p.pregunta.replace(/<[^>]*>?/gm, ''); 
                const respUser = p.respuesta_usuario || 'Sin respuesta';

                html += `<b>${i + 1}.</b> ${pregTexto}<br style="mso-data-placement:same-cell;" />`;
                html += `&nbsp;&nbsp;R: <i style="color:#444">${respUser}</i> ${icono}<br style="mso-data-placement:same-cell;" /><br style="mso-data-placement:same-cell;" />`;
            });
            
            html += `</div>`;
            return html;

        } catch (e) { 
            console.error("Error al formatear quiz para excel:", e);
            return "Error lectura datos"; 
        }
    };

    // 2. Recorremos las filas para transformar los botones en texto
    const filas = tablaClon.querySelectorAll('tr');
    
    filas.forEach((fila, index) => {
        if (index === 0) return; // Ignorar encabezado

        // --- A. COLUMNA NIVEL (Índice 4) ---
        const celdaNivel = fila.cells[4];
        if (celdaNivel) {
            celdaNivel.innerText = celdaNivel.innerText.trim(); // Quitar badge HTML
            celdaNivel.style.textAlign = 'center';
            celdaNivel.style.fontWeight = 'bold';
            celdaNivel.style.color = '#E65100';
            celdaNivel.style.backgroundColor = '#FFF3E0';
        }

        // --- B. COLUMNAS QUIZZES (Índices 8 y 9) ---
        const celdaQuizIni = fila.cells[8]; 
        const celdaQuizFin = fila.cells[9]; 

        // Procesar Quiz Inicial
        if (celdaQuizIni) {
            const btn = celdaQuizIni.querySelector('button');
            if (btn) {
                celdaQuizIni.innerHTML = formatearQuizParaExcel(btn);
                celdaQuizIni.style.verticalAlign = "top"; // Alinear arriba
                celdaQuizIni.style.textAlign = "left";    // Alinear izquierda para leer mejor
            } else {
                celdaQuizIni.innerHTML = "<span style='color:#ccc'>-</span>";
            }
        }

        // Procesar Quiz Final
        if (celdaQuizFin) {
            const btn = celdaQuizFin.querySelector('button');
            if (btn) {
                celdaQuizFin.innerHTML = formatearQuizParaExcel(btn);
                celdaQuizFin.style.verticalAlign = "top";
                celdaQuizFin.style.textAlign = "left";
            } else {
                celdaQuizFin.innerHTML = "<span style='color:#ccc'>-</span>";
            }
        }
    });

    // 3. Generar el archivo Excel
    // IMPORTANTE: El estilo 'br { mso-data-placement:same-cell; }' es vital para los saltos de línea
    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                th { background-color: #1B5E20; color: white; padding: 12px; border: 1px solid #000; text-align: center; }
                td { padding: 10px; border: 1px solid #CCC; vertical-align: top; }
                br { mso-data-placement:same-cell; } 
            </style>
        </head>
        <body>
            <h3 style="color:#1B5E20">Historial de Partidas - Te Vivo Imbabura</h3>
            ${tablaClon.outerHTML}
        </body>
        </html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Historial_Imbabura_${new Date().toISOString().slice(0,10)}.xls`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
// --- FUNCIÓN PARA LIMPIAR FILTROS DEL HISTORIAL ---
window.limpiarFiltrosHistorial = function() {
    // 1. Resetear todos los inputs a vacío
    document.getElementById('historial-busqueda').value = "";
    document.getElementById('historial-fecha-desde').value = "";
    document.getElementById('historial-fecha-hasta').value = "";
    
    // 2. Desmarcar el checkbox
    const check = document.getElementById('check-unicos');
    if(check) check.checked = false;

    // 3. Volver a ejecutar el filtro (que ahora mostrará todo porque los campos están vacíos)
    aplicarFiltrosHistorial();
}

// Variable global para la gráfica
let miGrafica = null;
window.cargarDashboard = async function() {
    // Referencias
    const lblHoy = document.getElementById('stat-hoy');
    const lblMes = document.getElementById('stat-mes');
    const lblTotal = document.getElementById('stat-total');
    const lblFicha = document.getElementById('stat-ficha');
    const tablaUltimos = document.getElementById('tabla-ultimos');
    const lblFecha = document.getElementById('fecha-actual');

    // Fecha
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if(lblFecha) lblFecha.innerText = new Date().toLocaleDateString('es-EC', opcionesFecha);

    try {
        const ahora = new Date();
        const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        // Traemos datos ordenados por fecha descendente
        const q = query(collection(db, "historial_partidas"), orderBy("fecha", "desc"));
        const snap = await getDocs(q);

        let contHoy = 0;
        let contMes = 0;
        const conteoFichas = {};
        
        // Contadores Niveles
        let conteoNiveles = { '1': 0, '2': 0, '3': 0, '4': 0 };

        let ultimos5HTML = "";
        let contadorRender = 0;

        snap.forEach(doc => {
            const d = doc.data();
            
            // 1. Stats Tiempo
            if (d.fecha && d.fecha.toDate) {
                const f = d.fecha.toDate();
                if (f >= inicioHoy) contHoy++;
                if (f >= inicioMes) contMes++;
            }
            
            // 2. Ficha
            const ficha = d.ficha_nombre || "Desconocido";
            conteoFichas[ficha] = (conteoFichas[ficha] || 0) + 1;

            // 3. Stats Niveles (Para la gráfica)
            const nivelRaw = d.nivel_seleccionado || d.nivel_jugado || d.nivel || "1";
            const nivelJugado = String(nivelRaw).trim();
            
            if (conteoNiveles[nivelJugado] !== undefined) {
                conteoNiveles[nivelJugado]++;
            }

            // ========================================================
            // 4. TABLA ÚLTIMOS REGISTROS (Aquí mostramos el Nivel)
            // ========================================================
            if (contadorRender < 5) {
                let hora = d.fecha && d.fecha.toDate ? d.fecha.toDate().toLocaleTimeString('es-EC', {hour:'2-digit', minute:'2-digit'}) : "S/F";
                let icono = d.posicion_llegada === 1 ? '🥇' : '👤';
                
                // 🔥 CORRECCIÓN: Leemos el nivel real para mostrarlo en la tabla pequeña
                const nivelParaMostrar = d.nivel_seleccionado || d.nivel_jugado || d.nivel || 1;

                // Colorcito para el nivel en la tabla pequeña
                const colorNivel = nivelParaMostrar > 1 ? '#e65100' : '#2e7d32'; 

                ultimos5HTML += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px 0; font-size: 1.2rem; text-align:center;">${icono}</td>
                        <td style="padding: 10px;">
                            <div style="font-weight: bold; color: #333;">${d.nombre || 'Anónimo'}</div>
                            
                            <div style="font-size: 0.75rem; color: ${colorNivel}; font-weight:bold; margin-top:2px;">
                                Nivel ${nivelParaMostrar}
                            </div>
                        </td>
                        <td style="text-align: right; font-weight: bold; color: var(--color-sidebar);">
                            ${d.puntos_finales || 0}
                        </td>
                        <td style="text-align: right; color: #999; font-size: 0.8rem;">${hora}</td>
                    </tr>`;
                contadorRender++;
            }
        });

        // Pintar Textos
        if(lblHoy) lblHoy.innerText = contHoy;
        if(lblMes) lblMes.innerText = contMes;
        if(lblTotal) lblTotal.innerText = snap.size;
        if(tablaUltimos) tablaUltimos.innerHTML = ultimos5HTML || '<tr><td colspan="4" style="text-align:center; color:#999; padding:20px;">Sin actividad reciente</td></tr>';

        // Calcular Ficha Ganadora
        let fichaGanadora = "-";
        let maxVotos = 0;
        for (const [ficha, votos] of Object.entries(conteoFichas)) {
            if (votos > maxVotos) { maxVotos = votos; fichaGanadora = ficha; }
        }
        if(lblFicha) lblFicha.innerText = fichaGanadora;

        // --- GRÁFICA DE DONA ---
        const ctx = document.getElementById('graficaModos');
        if (ctx) {
            if (miGrafica) miGrafica.destroy();

            const totalNiveles = conteoNiveles['1'] + conteoNiveles['2'] + conteoNiveles['3'] + conteoNiveles['4'];
            
            let dataFinal, colorsFinal, labelsFinal;

            if (totalNiveles === 0) {
                dataFinal = [1]; 
                colorsFinal = ['#eeeeee']; 
                labelsFinal = ['Sin datos'];
            } else {
                dataFinal = [conteoNiveles['1'], conteoNiveles['2'], conteoNiveles['3'], conteoNiveles['4']];
                colorsFinal = ['#4CAF50', '#2196F3', '#FF9800', '#F44336']; // Verde, Azul, Naranja, Rojo
                labelsFinal = ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4'];
            }

            miGrafica = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labelsFinal,
                    datasets: [{
                        data: dataFinal,
                        backgroundColor: colorsFinal,
                        borderWidth: 0,
                        hoverOffset: totalNiveles === 0 ? 0 : 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', display: true },
                        tooltip: { enabled: totalNiveles > 0 }
                    }
                }
            });
        }

    } catch (error) {
        console.error("Error dashboard:", error);
    }
}



// =========================================================
// 🎓 GENERADOR DE CERTIFICADO (CON IMAGEN DE FONDO)
// =========================================================
window.generarCertificadoPDF = async function(datos, modo = 'descargar') {
    // 1. Crear documento en HORIZONTAL (Landscape)
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // A4 Horizontal (297mm x 210mm)

    // =========================================================
    // 🖼️ IMAGEN DE FONDO (LO PRIMERO QUE SE PONE)
    // =========================================================
    try {
        // IMPORTANTE: Reemplaza 'img/fondo_certificado.jpg' con la ruta real de tu imagen.
        // Si usas PNG con transparencia, cambia 'JPEG' por 'PNG'.
        // Los números (0, 0, 297, 210) hacen que ocupe toda la hoja A4.
        
        // 👇👇👇 AJUSTA ESTA LÍNEA 👇👇👇
        doc.addImage('assets/imagenes/admin/fondo_certificado.jpg', 'JPEG', 0, 0, 297, 210);
        // 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆
        
    } catch (error) {
        console.warn("⚠️ No se pudo cargar la imagen de fondo. Verifica la ruta o usa Base64.", error);
        // Si falla la imagen, al menos dibujamos un fondo gris claro suave
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, 297, 210, 'F');
    }

    // --- CONFIGURACIÓN DE ESTILO ---
    const anchoPagina = 297;
    const altoPagina = 210;
    const centro = anchoPagina / 2;
    
    // Colores (RGB) - Puedes ajustarlos para que combinen con tu fondo
    const azulITCA = [0, 51, 102];    
    const dorado = [218, 165, 32];    
    const negro = [60, 60, 60];       

    // --- 2. MARCO DECORATIVO (Opcional si tu fondo ya tiene marco) ---
    // Si tu imagen ya tiene borde, puedes comentar estas líneas.
    doc.setDrawColor(...azulITCA);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, anchoPagina - 20, altoPagina - 20); // Marco externo

    doc.setDrawColor(...dorado);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, anchoPagina - 26, altoPagina - 26); // Marco interno

    // --- 3. ENCABEZADO (INSTITUCIÓN) ---
    // Para que el texto se vea bien sobre un fondo, a veces ayuda ponerle un fondo blanco transparente detrás,
    // pero probemos primero directo sobre la imagen.
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...azulITCA);
    doc.setFontSize(22);
    doc.text("INSTITUTO SUPERIOR TECNOLÓGICO", centro, 40, { align: "center" });
    
    doc.setFontSize(28);
    doc.text("ITCA", centro, 50, { align: "center" });

    // Línea decorativa
    doc.setDrawColor(...dorado);
    doc.setLineWidth(1);
    doc.line(centro - 50, 58, centro + 50, 58);

    // --- 4. TEXTO DE OTORGAMIENTO ---
    doc.setFont("times", "normal");
    doc.setTextColor(...negro);
    doc.setFontSize(14);
    doc.text("Confiere el presente", centro, 75, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...dorado); 
    doc.text("CERTIFICADO DE RECONOCIMIENTO", centro, 88, { align: "center" });

    doc.setFont("times", "normal");
    doc.setTextColor(...negro);
    doc.setFontSize(14);
    doc.text("A:", centro, 100, { align: "center" });

    // --- 5. NOMBRE DEL ESTUDIANTE (Gigante) ---
    const nombreEstudiante = datos.nombre ? datos.nombre.toUpperCase() : "ESTUDIANTE ANÓNIMO";
    doc.setFont("times", "bolditalic");
    doc.setTextColor(...azulITCA);
    doc.setFontSize(36); 
    doc.text(nombreEstudiante, centro, 115, { align: "center" });

    // Línea debajo del nombre
    doc.setDrawColor(...negro);
    doc.setLineWidth(0.2);
    doc.line(40, 118, anchoPagina - 40, 118);

    // --- 6. CUERPO DEL TEXTO ---
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...negro);
    doc.setFontSize(14);
    
    const nivelTexto = datos.nivel ? datos.nivel : "4";
    const textoCuerpo = `Por haber culminado satisfactoriamente el NIVEL ${nivelTexto} del juego interactivo`;
    
    doc.text(textoCuerpo, centro, 135, { align: "center" });

    // Nombre del Juego destacado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text('"TE VIVO IMBABURA"', centro, 145, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.text("Demostrando conocimiento y valoración de nuestra cultura.", centro, 155, { align: "center" });

    // --- 7. FECHA Y CIERRE ---
    const fechaHoy = new Date();
    const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaTexto = `Ibarra, ${fechaHoy.toLocaleDateString('es-ES', opcionesFecha)}`;

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(fechaTexto, centro, 175, { align: "center" });

    

    // --- 9. GUARDADO O RETORNO ---
    if (modo === 'blob') {
        return doc.output('blob');
    } else {
        // Quitamos espacios y caracteres raros para el nombre del archivo
        const nombreClean = datos.nombre.replace(/[^a-zA-Z0-9 áéíóúñÑ]/g, "").trim();
        doc.save(`Certificado ITCA - ${nombreClean}.pdf`);
        
        if(typeof registrarEnvioCertificado === 'function') {
            registrarEnvioCertificado(datos, "DESCARGA_PDF");
        }
    }
}


let listaCertificables = [];
// =========================================================
// 🎓 CARGA DEFINITIVA: RANKING (ID=CÉDULA) + EMAIL PRIVADO
// =========================================================

window.cargarTablaCertificados = async function() {
    const cuerpo = document.getElementById('cuerpo-certificados');
    // Mensaje de carga
    if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">🔄 Cruzando datos de Ranking y Usuarios...</td></tr>';

    try {
        console.log("🚀 Leyendo Ranking Público...");
        
        // 1. LEER RANKING PUBLICO
        const q = query(collection(db, "ranking_publico")); 
        const snapRanking = await getDocs(q);

        if (snapRanking.empty) {
            cuerpo.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">El Ranking Público está vacío.</td></tr>';
            return;
        }

        let candidatos = [];
        const promesasEmail = [];

        // 2. PROCESAR CADA JUGADOR
        snapRanking.forEach(docRank => {
            const d = docRank.data();
            
            // A. LA CÉDULA ES EL ID DEL DOCUMENTO (Clave del éxito)
            const cedulaReal = docRank.id; 

            // B. LEER PUNTOS (Según tu imagen es 'puntuacion_total')
            const puntos = d.puntuacion_total || d.puntos || 0;

            // C. LEER NIVEL (Dentro de progreso_actual)
            let nivelLeido = "1"; // Valor base
            if (d.progreso_actual && d.progreso_actual.nivel) {
                nivelLeido = d.progreso_actual.nivel;
            } else if (d.nivel) {
                nivelLeido = d.nivel;
            }

            // Objeto temporal del jugador
            const jugador = {
                id_doc: docRank.id,
                cedula: cedulaReal,
                nombre: d.nombre || "Jugador Sin Nombre",
                puntos_finales: puntos,
                nivel: nivelLeido,
                email: "Buscando...", // Marcador temporal
                fecha: d.ultima_conexion || null
            };

            candidatos.push(jugador);

            // D. PREPARAR BÚSQUEDA DEL EMAIL (En usuarios_privados)
            // Usamos la cedulaReal para ir directo al documento
            const refPrivada = doc(db, "usuarios_privados", cedulaReal);
            promesasEmail.push(getDoc(refPrivada));
        });

        // 3. EJECUTAR BÚSQUEDAS DE EMAIL (En paralelo para velocidad)
        const snapshotsPrivados = await Promise.all(promesasEmail);

        // 4. ASIGNAR LOS EMAILS ENCONTRADOS
        candidatos.forEach((jugador, index) => {
            const snapUser = snapshotsPrivados[index];
            
            if (snapUser && snapUser.exists()) {
                const dataUser = snapUser.data();
                // Buscamos el campo 'email' (o 'correo' por si acaso)
                jugador.email = dataUser.email || dataUser.correo || "Email no guardado";
            } else {
                // Si existe en ranking pero NO en usuarios_privados
                jugador.email = "No registrado en Usuarios"; 
            }
        });

        // 5. ORDENAR (Mejores puntajes primero)
        candidatos.sort((a, b) => b.puntos_finales - a.puntos_finales);

        // Guardar en variable global
        listaCertificables = candidatos;

        console.log(`✅ Fusión completada: ${listaCertificables.length} jugadores listos.`);

        // 6. MOSTRAR EN PANTALLA
        filtrarCertificados();

    } catch (error) {
        console.error("❌ ERROR CARGANDO TABLA:", error);
        if(cuerpo) cuerpo.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center">Error técnico: ${error.message}</td></tr>`;
    }
}
// =========================================================
// 🎨 FILTRADO INTELIGENTE (NIVEL -> FECHA/TXT -> TOP X)
// =========================================================

let listaVisibles = [];      // Solo los que se ven en pantalla (filtrados)

// =========================================================
// 🎨 DIBUJAR TABLA (CORREGIDO: FILTRO EXACTO)
// =========================================================
window.filtrarCertificados = function() {
    // 1. Obtener filtros
    const inputNivel = document.getElementById('cert-nivel');
    const inputLimite = document.getElementById('cert-limite');
    const inputBuscador = document.getElementById('cert-buscador');
    const inputFecha = document.getElementById('cert-fecha');
    const cuerpo = document.getElementById('cuerpo-certificados');

    if (!cuerpo) return;
    cuerpo.innerHTML = '';

    // Valores seguros
    const nivelReq = inputNivel ? inputNivel.value : "todos";
    const limiteReq = inputLimite ? inputLimite.value : "todos";
    const texto = inputBuscador ? inputBuscador.value.toUpperCase().trim() : "";
    const fechaReq = inputFecha ? inputFecha.value : "";

    // 2. FILTRAR
    let resultados = listaCertificables.filter(item => {
        // --- 🛠️ CORRECCIÓN AQUÍ: FILTRO DE NIVEL EXACTO ---
        if (nivelReq !== 'todos') {
            const nFiltro = parseInt(nivelReq); // El número que elegiste (ej: 2)
            
            // Leemos el nivel del jugador. Si no existe, es 0.
            let nJugador = parseInt(item.nivel) || 0;

            // Opcional: Mantener tu lógica de "Puntos altos = Nivel 4" si el nivel viene vacío
            // Si prefieres ver el dato real, comenta la siguiente línea:
            if (nJugador === 0 && item.puntos_finales > 1500) nJugador = 4;

            // 🔥 CAMBIO CLAVE: Usamos !== para que sea EXACTO
            // "Si el nivel del jugador NO ES IGUAL al del filtro, ocultarlo"
            if (nJugador !== nFiltro) return false;
        }

        // Filtro Fecha
        if (fechaReq) {
            let fechaItem = "";
            if (item.fecha && item.fecha.toDate) fechaItem = item.fecha.toDate().toISOString().split('T')[0];
            else if (typeof item.fecha === 'string') fechaItem = item.fecha.split('T')[0];
            if (fechaItem !== fechaReq) return false;
        }
        // Filtro Texto
        if (texto) {
            const nombreStr = String(item.nombre).toUpperCase();
            const cedulaStr = String(item.cedula).toUpperCase();
            if (!nombreStr.includes(texto) && !cedulaStr.includes(texto)) return false;
        }
        return true;
    });

    // 3. ORDENAR Y CORTAR (TOP X)
    resultados.sort((a, b) => b.puntos_finales - a.puntos_finales);
    if (limiteReq !== 'todos') {
        const max = parseInt(limiteReq);
        resultados = resultados.slice(0, max);
    }

    // 🔥 GUARDAMOS LO QUE SE VE PARA PODER DESCARGARLO LUEGO
    listaVisibles = resultados;

    // 4. DIBUJAR (Sin Checkbox)
    if (resultados.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999; padding:20px;">No hay resultados.</td></tr>';
        return;
    }

    resultados.forEach(d => {
        const datosObj = { nombre: d.nombre, cedula: d.cedula, nivel: d.nivel, email: d.email };
        const datosStr = encodeURIComponent(JSON.stringify(datosObj)).replace(/'/g, "%27");
        const colorEmail = d.email && d.email.includes("@") ? "#2e7d32" : "#d32f2f";

        cuerpo.innerHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;"><strong>${d.nombre}</strong></td>
                <td style="padding: 10px;">${d.cedula}</td>
                <td style="padding: 10px; color: ${colorEmail}; font-size:0.9rem;">${d.email}</td>
                <td style="text-align:center;">
                    <span style="background:#e3f2fd; padding:3px 8px; border-radius:4px; font-weight:bold; color:#1565c0;">
                         ${d.nivel || '?'}
                    </span>
                </td>
                <td style="font-weight:bold;">${d.puntos_finales}</td>
                <td style="text-align:center;">
                    <button class="btn-imbabura secundario" style="padding:4px 8px; font-size:0.8rem;" 
                        onclick="generarCertificadoPDF(JSON.parse(decodeURIComponent('${datosStr}')), 'descargar')">
                        ⬇️ PDF
                    </button>
                </td>
            </tr>
        `;
    });
    
    // Actualizar botón de descarga masiva si existe
    const btnMasivo = document.getElementById('btn-descarga-masiva');
    if(btnMasivo) btnMasivo.innerText = `⬇️ Descargar Visibles (${listaVisibles.length})`;
}
// =========================================================
// 📦 DESCARGA MASIVA EN ZIP (Nombres Cortos)
// =========================================================
window.descargarVisibles = async function() {
    // 1. Validaciones
    if (listaVisibles.length === 0) {
        alert("No hay estudiantes en la tabla para descargar.");
        return;
    }

    if (!confirm(`📦 Se generará un archivo ZIP con ${listaVisibles.length} certificados.\n\n¿Continuar?`)) return;

    const btn = document.getElementById('btn-descarga-masiva');
    const textoOriginal = btn ? btn.innerText : "⬇️ Descargar";
    if(btn) btn.innerText = "⏳ Comprimiendo...";

    try {
        console.log("🚀 Iniciando compresión ZIP...");
        
        const zip = new JSZip();
        const carpeta = zip.folder("Certificados_TeVivoImbabura");

        // 2. Generar PDFs uno por uno
        for (let i = 0; i < listaVisibles.length; i++) {
            const est = listaVisibles[i];
            
            // Actualizar progreso en el botón
            if(btn) btn.innerText = `⏳ Procesando ${i+1}/${listaVisibles.length}...`;

            // A. Generar PDF silencioso (blob)
            const pdfBlob = await generarCertificadoPDF(est, 'blob');

            // B. DEFINIR EL NOMBRE CORTO
            // Quitamos caracteres raros para evitar errores en Windows/Android
            const nombreLimpio = est.nombre.replace(/[^a-zA-Z0-9 áéíóúñÑ]/g, "").trim(); 
            
            // ✨ AQUÍ ESTÁ EL CAMBIO DE NOMBRE:
            const nombreArchivo = `Certificado ${nombreLimpio} TE VIVO IMBABURA.pdf`;

            // C. Meter en el ZIP
            carpeta.file(nombreArchivo, pdfBlob);

            // Pausa técnica para no congelar la pantalla
            await new Promise(r => setTimeout(r, 50));
        }

        // 3. Cerrar y Descargar
        if(btn) btn.innerText = "💾 Guardando ZIP...";
        
        const zipContent = await zip.generateAsync({type: "blob"});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipContent);
        // Nombre del archivo ZIP general
        link.download = `Certificados_Imbabura_${new Date().toISOString().slice(0,10)}.zip`;
        link.click();

        alert("✅ ¡Descarga lista!");

    } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al comprimir. Revisa la consola.");
    } finally {
        if(btn) btn.innerText = textoOriginal;
    }
}
// --- CHECKBOX MAESTRO (Seleccionar Todos) ---
window.toggleCheckGlobal = function() {
    const master = document.getElementById('check-global');
    const checks = document.querySelectorAll('.check-cert');
    checks.forEach(c => c.checked = master.checked);
}



// =========================================================
// 🔄 CONTROL DE PESTAÑAS INTERNAS (CERTIFICADOS)
// =========================================================

window.cambiarSubTab = function(tabId) {
    // 1. Referencias a los contenedores
    const vistaGenerar = document.getElementById('subtab-generar');
    const vistaBitacora = document.getElementById('subtab-bitacora');
    
    // 2. Referencias a los botones (asumimos orden: 0=Generar, 1=Bitácora)
    const botones = document.querySelectorAll('.tab-btn');

    // 3. Ocultar todo primero
    if(vistaGenerar) vistaGenerar.style.display = 'none';
    if(vistaBitacora) vistaBitacora.style.display = 'none';
    
    // 4. Quitar clase 'active' a todos los botones
    botones.forEach(btn => btn.classList.remove('active'));

    // 5. Mostrar la pestaña seleccionada
    if (tabId === 'generar') {
        if(vistaGenerar) vistaGenerar.style.display = 'block';
        if(botones[0]) botones[0].classList.add('active');
        
        // Recargar tabla si está vacía (Opcional)
        // if(listaCertificables.length === 0) cargarTablaCertificados();
    } 
    else if (tabId === 'bitacora') {
        if(vistaBitacora) vistaBitacora.style.display = 'block';
        if(botones[1]) botones[1].classList.add('active');
        
        // Cargar el historial de envíos si existe la función
        if(typeof cargarBitacoraCertificados === 'function') {
            cargarBitacoraCertificados();
        }
    }
}
// =========================================================
// 📝 FUNCIÓN PARA REGISTRAR EN LA BITÁCORA (FALTANTE)
// =========================================================

window.registrarEnvioCertificado = async function(datosEstudiante, tipoEnvio) {
    try {
        console.log(`📝 Registrando envío: ${tipoEnvio} para ${datosEstudiante.nombre}`);

        // 1. Obtener datos del admin (opcional, si no hay usuario logueado pone "Admin")
        // Nota: Asegúrate de tener 'auth' importado o usa un string fijo si da error.
        const auth = typeof getAuth !== 'undefined' ? getAuth() : null;
        const emailAdmin = auth && auth.currentUser ? auth.currentUser.email : "Administrador";

        // 2. Crear objeto de registro
        const registro = {
            fecha: new Date(), // Guardamos la fecha/hora actual
            cedula_estudiante: datosEstudiante.cedula || "S/C",
            nombre_estudiante: datosEstudiante.nombre || "Anónimo",
            correo_destino: datosEstudiante.email || "No aplica",
            nivel_certificado: datosEstudiante.nivel || "4",
            tipo_envio: tipoEnvio, // "DESCARGA" o "EMAIL"
            admin_responsable: emailAdmin
        };

        // 3. Guardar en Firebase (Colección: historial_certificados)
        await addDoc(collection(db, "historial_certificados"), registro);
        
        console.log("✅ Registro guardado en bitácora exitosamente.");

        // 4. Si la pestaña de bitácora está abierta, recargarla
        if (typeof cargarBitacoraCertificados === 'function') {
            // Solo recargamos si la función existe y estamos viendo esa pestaña
            const panelBitacora = document.getElementById('subtab-bitacora');
            if(panelBitacora && panelBitacora.style.display !== 'none') {
                cargarBitacoraCertificados();
            }
        }

    } catch (error) {
        // Solo mostramos el error en consola para no asustar al usuario, 
        // ya que el certificado sí se generó.
        console.warn("⚠️ El certificado se generó, pero no se pudo guardar en el historial:", error);
    }
}

// =========================================================
// 🧹 FUNCIÓN PARA LIMPIAR TODOS LOS FILTROS
// =========================================================

window.limpiarFiltros = function() {
    console.log("🧹 Limpiando filtros...");

    // 1. Resetear los selectores a su valor por defecto ("todos")
    const inputNivel = document.getElementById('cert-nivel');
    const inputLimite = document.getElementById('cert-limite');
    const inputBuscador = document.getElementById('cert-buscador');
    const inputFecha = document.getElementById('cert-fecha');
    const checkGlobal = document.getElementById('check-global');

    if (inputNivel) inputNivel.value = "todos";  // O "4" si prefieres que vuelva al nivel 4
    if (inputLimite) inputLimite.value = "todos";
    if (inputBuscador) inputBuscador.value = "";
    if (inputFecha) inputFecha.value = "";
    
    // 2. Desmarcar el check de la cabecera
    if (checkGlobal) checkGlobal.checked = false;

    // 3. Volver a dibujar la tabla limpia
    filtrarCertificados();
}
// =========================================================
// ✅ SELECCIONAR SOLO LOS VISIBLES
// =========================================================

window.toggleCheckGlobal = function() {
    // 1. Mirar el checkbox maestro (si lo tienes en la cabecera)
    const checkMaster = document.getElementById('check-global');
    const estado = checkMaster ? checkMaster.checked : true; // Si no hay master, asumimos true

    // 2. Buscar solo los checkboxes VISIBLES en la tabla
    // Usamos querySelectorAll dentro del tbody para asegurar
    const cuerpo = document.getElementById('cuerpo-certificados');
    if(!cuerpo) return;

    const checkboxes = cuerpo.querySelectorAll('.check-cert');

    // 3. Marcar o desmarcar
    checkboxes.forEach(chk => {
        chk.checked = estado;
    });

    // Opcional: Si el botón se usa sin el checkbox de cabecera, 
    // podemos hacer que alterne (si hay uno desmarcado, los marca todos, sino los desmarca).
    console.log(`✅ Se cambiaron ${checkboxes.length} casillas a: ${estado ? 'Marcado' : 'Desmarcado'}`);
}

// =========================================================
// 🎡 LÓGICA MODO FERIA (ÚNICA CONFIGURACIÓN)
// =========================================================

// Variable global para recordar el estado inicial
window.estadoFeriaOriginal = false; 

// 1. CARGAR DATOS
window.cargarConfiguracion = async function() {
    console.log("⚙️ Cargando configuración...");
    const checkFeria = document.getElementById('check-modo-feria');
    const inputTiempo = document.getElementById('input-tiempo-feria');
    const inputMotivo = document.getElementById('input-motivo-feria');
    const infoEstado = document.getElementById('info-estado-feria');

    if (checkFeria) {
        try {
            const docRef = doc(db, "configuracion_tiempodejuego", "ajustes_globales");
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                let estaActivo = data.modo_feria === true;
                
                // Chequeo de 24h
                if (estaActivo && data.fecha_activacion) {
                    const ahora = new Date();
                    const fechaActivacion = data.fecha_activacion.toDate();
                    const horasPasadas = (ahora - fechaActivacion) / (1000 * 60 * 60);

                    if (horasPasadas >= 24) {
                        estaActivo = false;
                        await setDoc(docRef, { modo_feria: false }, { merge: true });
                    }
                }

                window.estadoFeriaOriginal = estaActivo;
                checkFeria.checked = estaActivo;

                if (estaActivo) {
                    if(inputTiempo) inputTiempo.value = data.tiempo_limite || 5;
                    if(inputMotivo) inputMotivo.value = data.motivo || "";
                    if (infoEstado) {
                        infoEstado.innerHTML = `<span style="color: green;">✅ ACTIVO</span> | 👤 ${data.admin_activador}`;
                    }
                } else {
                    if(inputTiempo) inputTiempo.value = 5;
                    if(inputMotivo) inputMotivo.value = "";
                    if (infoEstado) infoEstado.innerHTML = "Estado: <span style='color:#666'>Desactivado</span>";
                }
            } else {
                window.estadoFeriaOriginal = false;
            }
        } catch (error) {
            console.error("Error cargando config:", error);
        }
    }
}

// 2. GUARDAR DATOS
window.guardarConfiguracionFeria = async function() {
    const check = document.getElementById('check-modo-feria');
    const inputTiempo = document.getElementById('input-tiempo-feria');
    const inputMotivo = document.getElementById('input-motivo-feria');
    const msg = document.getElementById('msg-feria');

    const nuevoEstado = check.checked;
    
    // Evitar guardar si ya estaba apagado
    if (nuevoEstado === false && window.estadoFeriaOriginal === false) {
        alert("⚠️ Ya está desactivado. No es necesario guardar.");
        return;
    }

    const minutos = parseInt(inputTiempo.value);
    const motivo = inputMotivo.value.trim();
    const nombreAdmin = document.getElementById('nombre-admin-sidebar')?.innerText || "Admin";

    // Validaciones al activar
    if (nuevoEstado === true) {
        if (minutos < 5 || minutos > 10) { alert("⚠️ Tiempo entre 5 y 10 min."); return; }
        if (motivo.length < 5) { alert("⚠️ Motivo obligatorio."); return; }
    }

    if(msg) msg.innerText = "⏳ Guardando...";

    try {
        const fechaActual = new Date();
        const datosGlobales = {
            modo_feria: nuevoEstado,
            ultima_modificacion: fechaActual
        };

        if (nuevoEstado) {
            datosGlobales.tiempo_limite = minutos;
            datosGlobales.motivo = motivo;
            datosGlobales.admin_activador = nombreAdmin;
            datosGlobales.fecha_activacion = fechaActual;
        } else {
            datosGlobales.tiempo_limite = 5;
            datosGlobales.motivo = "";
            datosGlobales.admin_activador = "";
            datosGlobales.fecha_activacion = null;
        }

        // Guardar configuración
        await setDoc(doc(db, "configuracion_tiempodejuego", "ajustes_globales"), datosGlobales, { merge: true });

        // Guardar historial
        await addDoc(collection(db, "historial_tiempodejuego"), {
            accion: nuevoEstado ? "ACTIVACION" : "DESACTIVACION",
            admin: nombreAdmin,
            motivo: nuevoEstado ? motivo : "Finalizado manual",
            tiempo_configurado: nuevoEstado ? minutos : null,
            fecha: fechaActual
        });

        window.estadoFeriaOriginal = nuevoEstado;

        if (nuevoEstado) {
            if(msg) { msg.innerText = "✅ ACTIVO"; msg.style.color = "green"; }
        } else {
            if(msg) { msg.innerText = "✅ DESACTIVADO"; msg.style.color = "green"; }
            inputMotivo.value = "";
            inputTiempo.value = 5;
        }
        cargarConfiguracion();

    } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar.");
    }
}

// =========================================================
// 2. GUARDAR (CON BLOQUEO DE REDUNDANCIA)
// =========================================================
window.guardarConfiguracionFeria = async function() {
    const check = document.getElementById('check-modo-feria');
    const inputTiempo = document.getElementById('input-tiempo-feria');
    const inputMotivo = document.getElementById('input-motivo-feria');
    const msg = document.getElementById('msg-feria');

    // Estado que el usuario QUIERE poner
    const nuevoEstado = check.checked;
    
    // 🛑 BLOQUEO INTELIGENTE:
    // Si el usuario quiere APAGAR (false) y en la base de datos YA ESTABA APAGADO (false)
    if (nuevoEstado === false && window.estadoFeriaOriginal === false) {
        alert("⚠️ El Modo Feria ya se encuentra DESACTIVADO.\nNo es necesario guardar de nuevo.");
        return; // Detiene la función aquí. No guarda nada.
    }

    const minutos = parseInt(inputTiempo.value);
    const motivo = inputMotivo.value.trim();
    const nombreAdmin = document.getElementById('nombre-admin-sidebar')?.innerText || "Administrador";

    // --- VALIDACIONES AL ACTIVAR ---
    if (nuevoEstado === true) {
        if (minutos > 10) { alert("⚠️ Máximo 10 minutos."); inputTiempo.value = 10; return; }
        if (minutos < 5) { alert("⚠️ Mínimo 5 minutos."); inputTiempo.value = 5; return; }
        if (motivo.length < 5) { alert("⚠️ Escribe el motivo para activar."); inputMotivo.focus(); return; }
    }

    if(msg) { msg.innerText = "⏳ Procesando..."; msg.style.color = "blue"; }

    try {
        const fechaActual = new Date();

        // 1. ACTUALIZAR CONFIGURACIÓN GLOBAL
        const datosGlobales = {
            modo_feria: nuevoEstado,
            ultima_modificacion: fechaActual
        };

        if (nuevoEstado) { // ACTIVANDO
            datosGlobales.tiempo_limite = minutos;
            datosGlobales.motivo = motivo;
            datosGlobales.admin_activador = nombreAdmin;
            datosGlobales.fecha_activacion = fechaActual;
        } else { // DESACTIVANDO
            datosGlobales.tiempo_limite = 5;
            datosGlobales.motivo = "";
            datosGlobales.admin_activador = "";
            datosGlobales.fecha_activacion = null;
        }

        await setDoc(doc(db, "configuracion_tiempodejuego", "ajustes_globales"), datosGlobales, { merge: true });

        // 2. HISTORIAL
        const datosHistorial = {
            accion: nuevoEstado ? "ACTIVACION" : "DESACTIVACION",
            admin: nombreAdmin,
            fecha: fechaActual
        };
        if (nuevoEstado) {
            datosHistorial.motivo = motivo;
            datosHistorial.tiempo_configurado = minutos;
        } else {
            datosHistorial.nota = "Finalizado manualmente.";
        }
        await addDoc(collection(db, "historial_tiempodejuego"), datosHistorial);

        // 3. ACTUALIZAR MEMORIA Y UI
        window.estadoFeriaOriginal = nuevoEstado; // <--- ¡Importante! Actualizamos la memoria

        if (nuevoEstado) {
            if(msg) { msg.innerText = `✅ ACTIVADO (${minutos} min).`; msg.style.color = "#d32f2f"; }
        } else {
            if(msg) { msg.innerText = `✅ DESACTIVADO correctamente.`; msg.style.color = "green"; }
            inputMotivo.value = "";
            inputTiempo.value = 5;
        }
        
        cargarConfiguracion(); // Refrescar textos

    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error de conexión.");
        if(msg) msg.innerText = "";
    }
}

//BIO DEL SWITCH (Modo Feria)
async function toggleModoFeria() {
    const check = document.getElementById('check-modo-feria');
    const estado = check.checked; // true o false

    try {
        // Guardamos o actualizamos en Firebase
        await setDoc(doc(db, "configuracion", "ajustes_globales"), {
            modo_feria: estado,
            ultima_modificacion: new Date()
        }, { merge: true });

        console.log(`🎡 Modo Feria cambiado a: ${estado ? "ENCENDIDO" : "APAGADO"}`);

    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error de conexión. No se guardó el cambio.");
        check.checked = !estado; // Regresamos el switch si falló
    }
}

// 3. REGISTRAR NUEVO ADMINISTRADOR
window.registrarNuevoAdmin = async function() {
    // Referencias a los elementos del HTML
    const btn = document.querySelector('button[onclick="registrarNuevoAdmin()"]');
    const msg = document.getElementById('msg-admin');
    
    // Obtenemos los valores
    const cedula = document.getElementById('new-admin-cedula').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();
    const nombre = document.getElementById('new-admin-nombre').value.trim().toUpperCase();
    const apellido = document.getElementById('new-admin-apellido').value.trim().toUpperCase();
    const email = document.getElementById('new-admin-email').value.trim().toLowerCase();
    const ciudad = document.getElementById('new-admin-ciudad').value.trim().toUpperCase();

    // --- VALIDACIONES ---
    if (!cedula) return alert("⚠️ Falta la Cédula.");
    if (!pass) return alert("⚠️ Falta la Contraseña.");
    if (pass.length < 4) return alert("⚠️ La contraseña es muy corta.");

    // Efecto de carga
    if(btn) btn.disabled = true;
    if(msg) { msg.innerText = "⏳ Guardando en base de datos..."; msg.style.color = "blue"; }

    try {
        // --- GUARDADO EN FIREBASE ---
        // Usamos la Cédula como ID del documento para que sea único
        await setDoc(doc(db, "administradores", cedula), {
            cedula: cedula,
            pass: pass, // Nota: Para mayor seguridad real se debería encriptar, pero para este MVP está bien así
            nombres: nombre,
            apellidos: apellido,
            email: email,
            ciudad: ciudad,
            rol: "admin",
            fecha_creacion: new Date()
        });

        // Éxito
        if(msg) { 
            msg.innerText = `✅ ¡Administrador ${nombre} registrado con éxito!`; 
            msg.style.color = "green"; 
        }

        // Limpiar formulario
        document.getElementById('new-admin-cedula').value = "";
        document.getElementById('new-admin-pass').value = "";
        document.getElementById('new-admin-nombre').value = "";
        document.getElementById('new-admin-apellido').value = "";
        document.getElementById('new-admin-email').value = "";
        document.getElementById('new-admin-ciudad').value = "";

    } catch (error) {
        console.error("Error registrando admin:", error);
        if(msg) { 
            msg.innerText = "❌ Error: No se pudo guardar. Revisa permisos o conexión."; 
            msg.style.color = "red"; 
        }
    } finally {
        if(btn) btn.disabled = false;
    }
}
// =========================================================
// 📑 CONTROL DE PESTAÑAS DE CONFIGURACIÓN
// =========================================================

window.cambiarTabConfig = function(tab) {
    // 1. Ocultar ambos contenidos
    document.getElementById('subtab-conf-juego').style.display = 'none';
    document.getElementById('subtab-conf-admins').style.display = 'none';

    // 2. Desactivar estilos de ambos botones
    document.getElementById('btn-conf-juego').classList.remove('active');
    document.getElementById('btn-conf-admins').classList.remove('active');

    // 3. Mostrar el seleccionado
    if (tab === 'juego') {
        document.getElementById('subtab-conf-juego').style.display = 'block';
        document.getElementById('btn-conf-juego').classList.add('active');
    } else if (tab === 'admins') {
        document.getElementById('subtab-conf-admins').style.display = 'block';
        document.getElementById('btn-conf-admins').classList.add('active');
    }
}