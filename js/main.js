// //////////////////////////////////////////////////
// 1. IMPORTAMOS LA FUNCIÓN DEL DADO
// //////////////////////////////////////////////////

// Importamos las funciones de los otros archivos
import * as Game from './game.js'; 
import * as UI from './ui.js';
import { cargarMarcadorInicial } from './ui.js'; 

console.log("🔌 Cargando Main.js...");

// 2. Asignación al objeto Window (para que los 'onclick' lo vean)
window.iniciarJuego = Game.iniciarJuego;
window.verificarCedula = Game.verificarCedula;
window.iniciarTablero = Game.iniciarTablero;
window.volverSeleccion = Game.volverSeleccion;
window.accesoAdmin = Game.accesoAdmin;
window.seleccionarFicha = Game.seleccionarFicha;
window.cargarNivel = Game.cargarNivel;
window.mostrarToast = UI.mostrarToast; 
window.mostrarPestana = Game.mostrarPestana;



// 🚨 CORRECCIÓN CLAVE: Asigna la función principal del dado (tirarDado) a window
window.tirarDado = Game.tirarDado; // <-- ¡Asegúrate de que 'tirarDado' se exporte en game.js!


// Agrega la llamada al evento si no está:
window.addEventListener('load', cargarMarcadorInicial);
// --- 3. CONEXIÓN DE EVENTOS (Listener Robusto) ---
// Este evento se dispara cuando el HTML está completamente cargado
window.addEventListener('DOMContentLoaded', () => {
    
    // A. Conectar el botón de Saltar Video
    const btnSaltar = document.getElementById('btn-saltar-video');
    if (btnSaltar) {
        // Si el botón existe, le asignamos la función directamente
        btnSaltar.addEventListener('click', Game.verVideoTerminado);
        console.log("-> Botón Saltar Video Conectado.");
    }
    
    // B. Conectar los botones de 1, 2, 3 Jugadores (si no usamos onclick en el HTML)
    // No es necesario ya que el HTML usa onclick directamente, pero esta es la forma segura.
    
    // C. Conectar el botón del Dado (si existe)
    const btnDado = document.querySelector('.btn-dado');
    if (btnDado) {
         // Debes definir la función lanzarDado en game.js
         btnDado.addEventListener('click', Game.lanzarDado);
         console.log("-> Botón Dado Conectado.");
    }
});

console.log("✅ Sistema listo: Funciones conectadas.");