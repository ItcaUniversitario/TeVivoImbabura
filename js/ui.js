// Importamos la conexión a la base de datos (db)
import { db } from "./firebase.js"; 

// CORRECCIÓN CLAVE: Agrupamos todas las funciones de Firestore en una sola importación
import { collection, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. FUNCIÓN DE NOTIFICACIÓN FLOTANTE (Toast) ---
export function mostrarToast(mensaje) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;

    toast.innerText = mensaje;
    toast.classList.add("mostrar");
    
    setTimeout(() => {
        toast.classList.remove("mostrar");
    }, 1500);
}


// --- 2. FUNCIÓN PARA CARGAR EL MARCADOR EN TIEMPO REAL ---
export function cargarMarcadorInicial() {
    const lista = document.getElementById('lista-jugadores-score');
    if (!lista) return;

    // Mensaje de carga
    lista.innerHTML = '<p style="font-size:0.9rem; color:#666; text-align: center;">Cargando viajeros...</p>';

    try {
        // 1. Definir la consulta ordenada
        const registrosRef = collection(db, "registros");
        
        // La consulta q ordena por puntuacion_total y limita a 10
        const q = query(
            registrosRef,
            orderBy("puntuacion_total", "desc"), 
            limit(10) 
        );

        // 2. Establecer el ESCUCHADOR EN TIEMPO REAL (onSnapshot)
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const jugadores = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                jugadores.push({
                    nombre: data.nombre,
                    // CORRECCIÓN LÓGICA: Leemos el campo puntuacion_total
                    score: data.puntuacion_total || 0 
                });
            });

            // 3. Renderizar la lista
            lista.innerHTML = ''; 

            if (jugadores.length === 0) {
                lista.innerHTML = '<p style="font-size:0.9rem; color:#666; text-align: center;">Aún no hay viajeros registrados.</p>';
                return;
            }

            jugadores.forEach(j => {
                const item = document.createElement('div');
                item.className = 'jugador-score-item';

                // Formatear nombre: Primer nombre y Apellido
                const partesNombre = j.nombre.split(' ');
                let nombreRender = partesNombre[0];
                if (partesNombre.length > 1) {
                    nombreRender += ' ' + partesNombre[1];
                }

                item.innerHTML = `
                    <span style="font-weight: bold; color: var(--color-tierra-oscura);">${nombreRender}</span>
                    <span style="color: var(--color-bosque-profundo);">${j.score} Pts</span>
                `;
                lista.appendChild(item);
            });
        });

        // Retornamos la función unsubscribe (por si la necesitamos para detener la escucha)
        return unsubscribe;

    } catch (error) {
        console.error("Error al establecer el listener de Firebase:", error);
        mostrarToast("❌ Error al cargar el marcador.");
        lista.innerHTML = '<p style="color: red; font-size:0.9rem; text-align: center;">Error de conexión.</p>';
    }
}

// --- 3. FUNCIÓN PARA MOSTRAR EL MODAL DE TÉRMINOS Y CONDICIONES ---
export function mostrarModalTerminos(callbackAceptar) {
    const modal = document.getElementById('modal-terminos');
    const btnAceptar = document.getElementById('btn-aceptar-terminos');
    const btnRechazar = document.getElementById('btn-rechazar-terminos');

    if (!modal || !btnAceptar || !btnRechazar) {
        console.warn("Elementos del modal no encontrados. Continuando.");
        callbackAceptar();
        return;
    }

    modal.style.display = 'flex'; // Muestra el modal

    const limpiarListeners = () => {
        btnAceptar.removeEventListener('click', manejarAceptar);
        btnRechazar.removeEventListener('click', manejarRechazar);
    };

    const manejarAceptar = () => {
        modal.style.display = 'none'; // Oculta el modal
        limpiarListeners();
        callbackAceptar(); // Llama a la función de guardado en game.js
    };

    const manejarRechazar = () => {
        modal.style.display = 'none';
        mostrarToast("⛔ Debes aceptar los términos y condiciones para empezar a jugar.");
        limpiarListeners();
    };

    btnAceptar.addEventListener('click', manejarAceptar);
    btnRechazar.addEventListener('click', manejarRechazar);
}