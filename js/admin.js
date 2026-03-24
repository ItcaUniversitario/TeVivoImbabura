// =========================================================
// 🎛️ MÓDULO PRINCIPAL: ORQUESTADOR DEL PANEL ADMIN
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================
// 1. IMPORTACIONES DE TUS SUBMÓDULOS (¡Esto conecta todo!)
import "./admins/dashboard_admin.js";
import "./admins/usuarios_admin.js";
import "./admins/ranking_admin.js";
import "./admins/historial_partidas_admin.js";
import "./admins/certificados_admin.js";
import "./admins/config_tiempo_admin.js";
// 1. IMPORTACIONES BÁSICAS (Solo lo necesario para el Login)
import { db, auth } from "./firebase.js"; 
import { collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// =========================================================
// 🔐 SISTEMA DE LOGIN
// =========================================================
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

        // 2. Buscar el nombre del admin en Firestore para mostrarlo en el menú
        try {
            const q = query(collection(db, "administradores"), where("email", "==", inputEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const adminData = querySnapshot.docs[0].data();
                const nombreCompleto = `${adminData.nombres} ${adminData.apellidos || ''}`;
                const labelNombre = document.getElementById('nombre-admin-sidebar');
                if(labelNombre) labelNombre.innerText = nombreCompleto;
            } else {
                document.getElementById('nombre-admin-sidebar').innerText = "Administrador";
            }
        } catch (errName) {
            console.error("No se pudo cargar el nombre del admin", errName);
        }
        
        // 3. Ocultar pantalla de login y mostrar el panel principal
        document.getElementById('overlay-login').style.display = 'none';
        const mainLayout = document.querySelector('.admin-layout');
        if(mainLayout) {
            mainLayout.style.filter = 'none';
            mainLayout.style.pointerEvents = 'auto';
            mainLayout.style.opacity = '1';
        }

        // 4. Cargar el Dashboard por defecto al entrar
        if(typeof window.cargarDashboard === 'function') {
            window.cargarDashboard();
        }
       
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

// Permitir login presionando "Enter"
document.addEventListener("DOMContentLoaded", () => {
    const passInput = document.getElementById('admin-pass');
    if(passInput) {
        passInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") window.validarIngreso();
        });
    }
});

// =========================================================
// 🧭 NAVEGACIÓN Y MENÚ LATERAL (ROUTER)
// =========================================================
window.cambiarModulo = function(id) {
    console.log(`Navegando a módulo: ${id}`);

    // 1. Ocultar todos los paneles y quitar estilos de botones activos
    document.querySelectorAll('.panel-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));

    // 2. Calcular cuál es el ID del panel a mostrar
    let idPanelDestino = 'panel-' + id;
    if (id === 'admin') {
        idPanelDestino = 'panel-configuracion'; 
    }

    // 3. Mostrar el nuevo panel y activar el botón
    const panel = document.getElementById(idPanelDestino);
    const btn = document.getElementById('nav-' + id);
    
    if(panel) panel.classList.add('active');
    if(btn) btn.classList.add('active');

    // 👇👇👇 NUEVO: CERRAR EL MENÚ EN MÓVILES AL HACER CLIC 👇👇👇
    if (window.innerWidth <= 992) { // Si la pantalla es tamaño tablet o celular
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
    // 👆👆👆 ---------------------------------------------- 👆👆👆

    // 4. DELEGAR LA CARGA DE DATOS A LOS SUBMÓDULOS
    if(id === 'inicio') {
        if(typeof window.cargarDashboard === 'function') window.cargarDashboard();
    }
    if(id === 'db') {
        if(typeof window.cargarRegistrosFusionados === 'function') window.cargarRegistrosFusionados();
    }
    if(id === 'score') {
        if(typeof window.cargarScoreGlobal === 'function') window.cargarScoreGlobal();
    }
    if(id === 'historial') {
        if(typeof window.cargarHistorial === 'function') window.cargarHistorial();
    }
    if(id === 'certificados') {
        if(typeof window.cambiarSubTab === 'function') window.cambiarSubTab('generar'); 
        if(typeof window.cargarTablaCertificados === 'function') window.cargarTablaCertificados();
    }
    if(id === 'admin') {
        if(typeof window.cargarConfiguracion === 'function') window.cargarConfiguracion(); 
    }
}
// =========================================================
// 📱 CONTROLES DE INTERFAZ (UI)
// =========================================================

// Botón hamburguesa para celulares
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if(sidebar) {
        sidebar.classList.toggle('open');
    }
}


// =========================================================
// 🛡️ OBSERVADOR DE SESIÓN (Persistencia al recargar F5)
// =========================================================

onAuthStateChanged(auth, (user) => {
    const overlay = document.getElementById('overlay-login');
    const mainLayout = document.querySelector('.admin-layout');

    if (user) {
        // 1. El usuario ya está logueado (o acaba de entrar)
        console.log("Sesión activa:", user.email);
        
        if(overlay) overlay.style.display = 'none';
        if(mainLayout) {
            mainLayout.style.filter = 'none';
            mainLayout.style.pointerEvents = 'auto';
            mainLayout.style.opacity = '1';
        }

        // 2. Intentar recuperar el nombre del admin si no está puesto
        const labelNombre = document.getElementById('nombre-admin-sidebar');
        if(labelNombre && labelNombre.innerText === "Cargando...") {
            // Reutilizamos la lógica de búsqueda por email que ya tienes en validarIngreso
            obtenerNombreAdmin(user.email);
        }

        // 3. Cargar Dashboard automáticamente
        window.cargarDashboard();

    } else {
        // El usuario no está logueado o cerró sesión
        if(overlay) overlay.style.display = 'flex';
        console.log("No hay sesión activa.");
    }
});

// Función auxiliar para no repetir código
async function obtenerNombreAdmin(email) {
    try {
        const q = query(collection(db, "administradores"), where("email", "==", email));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const data = snap.docs[0].data();
            document.getElementById('nombre-admin-sidebar').innerText = `${data.nombres} ${data.apellidos || ''}`;
        }
    } catch (e) { console.error("Error recuperando nombre:", e); }
}

// =========================================================
// 🚪 CERRAR SESIÓN REAL
// =========================================================
window.cerrarSesionTotal = async function() {
    if(confirm("¿Estás seguro de que quieres salir del panel?")) {
        try {
            await signOut(auth);
            window.location.reload(); // Recarga para limpiar todo el estado
        } catch (error) {
            console.error("Error al salir:", error);
        }
    }
}

// Función para mostrar esqueletos de carga en cualquier tabla
window.mostrarSkeleton = function(idContenedor, columnas = 10, filas = 5) {
    const cuerpo = document.getElementById(idContenedor);
    if (!cuerpo) return;

    let skeletonHTML = "";
    for (let i = 0; i < filas; i++) {
        skeletonHTML += `<tr class="skeleton-row">`;
        for (let j = 0; j < columnas; j++) {
            // Variamos el ancho de la barrita aleatoriamente para estética
            const randomWidth = [30, 50, 75][Math.floor(Math.random() * 3)];
            skeletonHTML += `<td><div class="skeleton-content w-${randomWidth}"></div></td>`;
        }
        skeletonHTML += `</tr>`;
    }
    cuerpo.innerHTML = skeletonHTML;
}