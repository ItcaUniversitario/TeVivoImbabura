// =========================================================
// ⚙️ MÓDULO: CONFIGURACIÓN (Modo Feria y Admins)
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================

// 1. IMPORTACIONES
import { db } from "../firebase.js"; 
import { doc, getDoc, setDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- UTILIDAD: ENCRIPTAR CONTRASEÑA (SHA-256) ---
// La necesitamos aquí para guardar la clave del nuevo admin de forma segura
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =========================================================
// 🎡 LÓGICA MODO FERIA
// =========================================================

// Variable global para recordar el estado inicial
window.estadoFeriaOriginal = false; 

// --- 1. CARGAR DATOS DEL MODO FERIA ---
window.cargarConfiguracion = async function() {
    console.log("⚙️ Cargando configuración de Modo Feria...");
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
                
                // Chequeo de seguridad: Desactivar automático si pasaron 24h
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

// --- 2. GUARDAR DATOS DEL MODO FERIA (CON BLOQUEO DE REDUNDANCIA) ---
window.guardarConfiguracionFeria = async function() {
    const check = document.getElementById('check-modo-feria');
    const inputTiempo = document.getElementById('input-tiempo-feria');
    const inputMotivo = document.getElementById('input-motivo-feria');
    const msg = document.getElementById('msg-feria');

    const nuevoEstado = check.checked;
    
    // 🛑 BLOQUEO INTELIGENTE: Si ya estaba apagado y lo quieren apagar de nuevo
    if (nuevoEstado === false && window.estadoFeriaOriginal === false) {
        alert("⚠️ El Modo Feria ya se encuentra DESACTIVADO.\nNo es necesario guardar de nuevo.");
        return; 
    }

    const minutos = parseInt(inputTiempo.value);
    const motivo = inputMotivo.value.trim();
    const nombreAdmin = document.getElementById('nombre-admin-sidebar')?.innerText || "Administrador";

    // Validaciones al activar
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

        // 2. GUARDAR EN EL HISTORIAL DE FERIAS
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
        window.estadoFeriaOriginal = nuevoEstado; 

        if (nuevoEstado) {
            if(msg) { msg.innerText = `✅ ACTIVADO (${minutos} min).`; msg.style.color = "#d32f2f"; }
        } else {
            if(msg) { msg.innerText = `✅ DESACTIVADO correctamente.`; msg.style.color = "green"; }
            inputMotivo.value = "";
            inputTiempo.value = 5;
        }
        
        window.cargarConfiguracion(); // Refrescar textos visuales

    } catch (error) {
        console.error("Error guardando:", error);
        alert("Error de conexión al guardar el Modo Feria.");
        if(msg) msg.innerText = "";
    }
}

// =========================================================
// 👤 REGISTRAR NUEVO ADMINISTRADOR
// =========================================================
window.registrarNuevoAdmin = async function() {
    const btn = document.querySelector('button[onclick="registrarNuevoAdmin()"]');
    const msg = document.getElementById('msg-admin');
    
    const cedula = document.getElementById('new-admin-cedula').value.trim();
    const pass = document.getElementById('new-admin-pass').value.trim();
    const nombre = document.getElementById('new-admin-nombre')?.value.trim().toUpperCase() || "ADMIN";
    const apellido = document.getElementById('new-admin-apellido')?.value.trim().toUpperCase() || "";
    const email = document.getElementById('new-admin-email')?.value.trim().toLowerCase() || "";
    const ciudad = document.getElementById('new-admin-ciudad')?.value.trim().toUpperCase() || "";

    // Validaciones
    if (!cedula) return alert("⚠️ Falta la Cédula.");
    if (!pass) return alert("⚠️ Falta la Contraseña.");
    if (pass.length < 4) return alert("⚠️ La contraseña es muy corta.");

    // Efecto de carga
    if(btn) btn.disabled = true;
    if(msg) { msg.innerText = "⏳ Guardando en base de datos..."; msg.style.color = "blue"; }

    try {
        const passwordHash = await sha256(pass);

        // Guardado en Firebase
        await setDoc(doc(db, "administradores", cedula), {
            cedula: cedula,
            pass: pass, // Guardado en texto plano según el código original
            password: passwordHash, // Guardado encriptado por seguridad
            nombres: nombre,
            apellidos: apellido,
            email: email,
            ciudad: ciudad,
            rol: "admin",
            fecha_creacion: new Date()
        });

        if(msg) { 
            msg.innerText = `✅ ¡Administrador ${nombre} registrado con éxito!`; 
            msg.style.color = "green"; 
        }

        // Limpiar formulario
        document.getElementById('new-admin-cedula').value = "";
        document.getElementById('new-admin-pass').value = "";
        if(document.getElementById('new-admin-nombre')) document.getElementById('new-admin-nombre').value = "";
        if(document.getElementById('new-admin-apellido')) document.getElementById('new-admin-apellido').value = "";
        if(document.getElementById('new-admin-email')) document.getElementById('new-admin-email').value = "";
        if(document.getElementById('new-admin-ciudad')) document.getElementById('new-admin-ciudad').value = "";

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
// 📑 CONTROL DE PESTAÑAS INTERNAS DE CONFIGURACIÓN
// =========================================================
window.cambiarTabConfig = function(tab) {
    // 1. Ocultar ambos contenidos
    const subJuego = document.getElementById('subtab-conf-juego');
    const subAdmins = document.getElementById('subtab-conf-admins');
    if(subJuego) subJuego.style.display = 'none';
    if(subAdmins) subAdmins.style.display = 'none';

    // 2. Desactivar estilos de ambos botones
    const btnJuego = document.getElementById('btn-conf-juego');
    const btnAdmins = document.getElementById('btn-conf-admins');
    if(btnJuego) btnJuego.classList.remove('active');
    if(btnAdmins) btnAdmins.classList.remove('active');

    // 3. Mostrar el seleccionado
    if (tab === 'juego') {
        if(subJuego) subJuego.style.display = 'block';
        if(btnJuego) btnJuego.classList.add('active');
    } else if (tab === 'admins') {
        if(subAdmins) subAdmins.style.display = 'block';
        if(btnAdmins) btnAdmins.classList.add('active');
    }
}