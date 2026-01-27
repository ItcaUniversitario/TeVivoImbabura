// 1. IMPORTAR APP
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// 2. IMPORTAR BASE DE DATOS (Firestore)
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 3. IMPORTAR AUTENTICACIÓN (Auth) 👈 ¡ESTA ES LA QUE TE FALTA!
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app); // 👈 Asegúrate de tener esto también
// Variables globales
let globalScoreData = [];

// --- UTILIDAD: ENCRIPTAR CONTRASEÑA (SHA-256) ---
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- FUNCIÓN 1: LOGIN SEGURO (BASE DE DATOS) ---
window.validarIngreso = async function() {
    // 1. Obtenemos lo que escribió el usuario TAL CUAL
    const inputEmail = document.getElementById('admin-user').value.trim(); 
    const inputPass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('msg-error');

    // Validación básica visual
    if (!inputEmail || !inputPass) {
        errorMsg.style.display = 'block';
        errorMsg.innerText = "⚠️ Por favor ingresa correo y contraseña";
        return;
    }

    try {
        // 2. Firebase verifica directamente el correo y clave
        await signInWithEmailAndPassword(auth, inputEmail, inputPass);
        
        // ¡ÉXITO!
        console.log("Login correcto: " + inputEmail);
        
        // Ocultar login y mostrar panel
        document.getElementById('overlay-login').style.display = 'none';
        document.getElementById('panel-principal').style.filter = 'none';
        document.getElementById('panel-principal').style.pointerEvents = 'auto';
        document.getElementById('panel-principal').style.opacity = '1';

        // Cargar datos
        cargarRegistrosFusionados();
        cargarScoreGlobal();

    } catch (error) {
        // Imprimir todo el error en la consola para depurar
        console.error("🔥 ERROR COMPLETO:", error); 

        errorMsg.style.display = 'block';

        // Si tenemos un código de error conocido, mostramos mensaje amigable
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMsg.innerText = "⛔ Correo o contraseña incorrectos";
        } else if (error.code === 'auth/too-many-requests') {
            errorMsg.innerText = "⏳ Demasiados intentos. Espera un momento.";
        } else if (error.code === 'auth/network-request-failed') {
            errorMsg.innerText = "📡 Error de red (Revisa tu internet o firewall)";
        } else {
            // SI EL CÓDIGO ES UNDEFINED, MOSTRAMOS EL MENSAJE REAL
            errorMsg.innerText = "❌ Error: " + (error.message || "Desconocido");
        }
    }
}

function iniciarSesionExitosa(overlay, panel) {
    document.getElementById('msg-error').style.display = 'none';
    overlay.style.display = 'none';
    panel.style.filter = 'none';
    panel.style.pointerEvents = 'auto';
    panel.style.opacity = '1';
    
    // Cargar datos
    cargarRegistrosFusionados();
    cargarScoreGlobal();
}

function mostrarError(txt) {
    const lbl = document.getElementById('msg-error');
    lbl.innerText = "⛔ " + txt;
    lbl.style.display = 'block';
}

// --- FUNCIÓN 2: CARGAR REGISTROS (FUSIÓN PÚBLICO + PRIVADO) ---
async function cargarRegistrosFusionados() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const totalLabel = document.getElementById('total-registros');
    cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align:center">🔄 Cargando datos seguros...</td></tr>';

    try {
        const [publicosSnap, privadosSnap] = await Promise.all([
            getDocs(collection(db, "ranking_publico")),
            getDocs(collection(db, "usuarios_privados"))
        ]);

        totalLabel.innerHTML = publicosSnap.size;
        cuerpoTabla.innerHTML = '';

        // Crear mapa de privados
        const mapaPrivados = {};
        privadosSnap.forEach(doc => mapaPrivados[doc.id] = doc.data());

        publicosSnap.forEach((doc) => {
            const dataPub = doc.data();
            const id = doc.id;
            const dataPriv = mapaPrivados[id] || {}; // Datos privados o vacío

            const fecha = dataPriv.registradoEn ? new Date(dataPriv.registradoEn).toLocaleString() : "S/F";
            const acepta = dataPriv.aceptaTerminos ? "✅ SI" : "❌ NO";

            cuerpoTabla.innerHTML += `
                <tr>
                    <td><small>${fecha}</small></td>
                    <td><strong>${id}</strong></td>
                    <td>${dataPriv.edad || '-'}</td>
                    <td>${dataPub.nombre || 'ANÓNIMO'}</td>
                    <td>${dataPriv.telefono || '-'}</td>
                    <td>${dataPriv.email || '-'}</td>
                    <td>${dataPriv.genero || '-'}</td>
                    <td>${dataPriv.ciudad || '-'}</td>
                    <td>${acepta}</td>
                    <td>${fecha}</td>
                </tr>`;
        });
        window.filtrarTabla();

    } catch (error) {
        console.error(error);
        cuerpoTabla.innerHTML = `<tr><td colspan="10" style="color:red; text-align:center">
            ⛔ <b>Modo Seguro Activado:</b> No se pueden leer datos privados.<br>
            <small>Abre el candado en Firebase si necesitas descargar el reporte completo.</small>
        </td></tr>`;
    }
}

// --- FUNCIÓN 3: CARGAR SCORE GLOBAL ---
async function cargarScoreGlobal() {
    const cuerpo = document.getElementById('cuerpo-tabla-score');
    const total = document.getElementById('total-registros-score');
    globalScoreData = [];

    try {
        // Leemos ranking_publico ordenado
        const q = query(collection(db, "ranking_publico"), orderBy("puntuacion_total", "desc"));
        const snap = await getDocs(q);

        total.innerHTML = snap.size;
        cuerpo.innerHTML = '';

        snap.forEach(doc => {
            const d = doc.data();
            const lvls = d.estado_niveles || {};
            // Extraer puntos seguros
            const p1 = lvls.nivel_1?.puntos || 0;
            const p2 = lvls.nivel_2?.puntos || 0;
            const p3 = lvls.nivel_3?.puntos || 0;
            const p4 = lvls.nivel_4?.puntos || 0;

            globalScoreData.push({
                cedula: doc.id,
                nombre: d.nombre,
                total: d.puntuacion_total || 0,
                n1: p1, n2: p2, n3: p3, n4: p4
            });
        });

        // Renderizar
        globalScoreData.forEach((j, i) => {
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
        });

    } catch (e) {
        cuerpo.innerHTML = '<tr><td colspan="8">Error cargando scores</td></tr>';
    }
}

// --- FUNCIÓN 4: CREAR NUEVO ADMIN (NUEVA PESTAÑA) ---
window.registrarNuevoAdmin = async function() {
    const cedula = document.getElementById('new-admin-cedula').value.trim();
    const nombre = document.getElementById('new-admin-nombre').value.trim();
    const apellido = document.getElementById('new-admin-apellido').value.trim();
    const email = document.getElementById('new-admin-email').value.trim();
    const edad = document.getElementById('new-admin-edad').value;
    const ciudad = document.getElementById('new-admin-ciudad').value.trim();
    const pass = document.getElementById('new-admin-pass').value;
    
    const msgLabel = document.getElementById('msg-admin');

    // Validar
    if (!cedula || !nombre || !pass) {
        msgLabel.style.color = "red";
        msgLabel.innerText = "⛔ Faltan datos (Cédula, Nombre o Contraseña)";
        return;
    }

    msgLabel.style.color = "blue";
    msgLabel.innerText = "⏳ Creando...";

    try {
        const passwordHash = await sha256(pass);

        await setDoc(doc(db, "administradores", cedula), {
            nombres: nombre, apellidos: apellido, email: email,
            edad: edad, ciudad: ciudad, password: passwordHash,
            rol: "admin", creadoPor: "Panel Admin", fecha: new Date().toISOString()
        });

        msgLabel.style.color = "green";
        msgLabel.innerText = "✅ ¡Administrador creado!";
        // Limpiar
        document.getElementById('new-admin-cedula').value = "";
        document.getElementById('new-admin-pass').value = "";

    } catch (error) {
        console.error(error);
        if (error.code === 'permission-denied') {
            msgLabel.style.color = "red";
            msgLabel.innerText = "⛔ Error de Permisos: Abre el candado en Firebase (write: true).";
        } else {
            msgLabel.style.color = "red";
            msgLabel.innerText = "❌ Error: " + error.message;
        }
    }
}

// --- UTILIDADES DE INTERFAZ Y EXPORTACIÓN ---

window.mostrarPestana = function(id) {
    document.querySelectorAll('.tab-content').forEach(d => d.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-'+id+'-content').classList.add('active');
    document.getElementById('tab-'+id+'-btn').classList.add('active');
    
    if(id === 'db') window.filtrarTabla();
    if(id === 'score') cargarScoreGlobal();
}

window.exportarExcel = function() {
    let html = document.getElementById("tabla-jugadores").outerHTML.replace(/ /g, '%20');
    let a = document.createElement('a');
    a.href = 'data:application/vnd.ms-excel,' + html;
    a.download = 'Reporte_Jugadores.xls';
    a.click();
}

window.exportarExcelScore = function() {
    let html = document.getElementById("tabla-score").outerHTML.replace(/ /g, '%20');
    let a = document.createElement('a');
    a.href = 'data:application/vnd.ms-excel,' + html;
    a.download = 'Reporte_Score.xls';
    a.click();
}

window.filtrarTabla = function() {
    const texto = document.getElementById('filtro-texto').value.toUpperCase();
    const ciudad = document.getElementById('filtro-ciudad').value.toUpperCase();
    const edad = document.getElementById('filtro-edad').value;

    const filas = document.querySelectorAll('#cuerpo-tabla tr');
    let contador = 0;

    filas.forEach(fila => {
        if(fila.cells.length < 2) return;
        const txtFila = fila.innerText.toUpperCase();
        
        // Búsqueda simple en todo el texto de la fila
        if(txtFila.includes(texto) && txtFila.includes(ciudad) && (edad === "" || txtFila.includes(edad))) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });
    document.getElementById('total-registros').innerText = contador;
}

window.limpiarFiltros = function() {
    document.getElementById('filtro-texto').value = "";
    document.getElementById('filtro-ciudad').value = "";
    document.getElementById('filtro-edad').value = "";
    window.filtrarTabla();
}

// Enter para Login
document.addEventListener("DOMContentLoaded", () => {
    const passInput = document.getElementById('admin-pass');
    if(passInput) {
        passInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") window.validarIngreso();
        });
    }
});