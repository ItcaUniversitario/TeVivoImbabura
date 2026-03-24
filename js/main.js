// ==========================================
// ARCHIVO: js/main.js
// ==========================================

// 1. IMPORTACIONES CORRECTAS
// Importamos cada cosa de su archivo original para evitar errores
import * as Game from './game.js'; 
import * as Auth from './auth.js'; 
import * as Mechanics from './mechanics.js';
import * as UI from './ui.js';
import { cargarMarcadorInicial } from './ui.js'; 

console.log("🔌 Cargando Main.js y conectando módulos...");

// =====================================================
// 2. ASIGNACIÓN GLOBAL (VITAL PARA EL HTML)
// =====================================================

// Funciones de Inicio y Registro (Están en auth.js)
window.prepararPantallaRegistro = Auth.prepararPantallaRegistro;
window.verificarCedula = Auth.verificarCedula;
window.iniciarTablero = Auth.iniciarTablero;
window.volverSeleccion = Auth.volverSeleccion;
window.accesoAdmin = Auth.accesoAdmin;
window.guardarPuntosFinales = Auth.guardarPuntosFinales;
window.cargarRankingGlobal = Auth.cargarRankingGlobal;

// Funciones del Juego y Flujo (Están en game.js)
window.seleccionarFicha = Game.seleccionarFicha;
window.cargarNivel = Game.cargarNivel;
window.mostrarPestana = Game.mostrarPestana;
window.verVideoTerminado = Game.verVideoTerminado;
window.mostrarResumenFinal = Game.mostrarResumenFinal;

// 🔥 ESTAS ERAN LAS QUE FALTABAN PARA QUE GUARDARA:
window.aplicarRecompensa = Game.aplicarRecompensa;
window.ocultarModal = Game.ocultarModal;
window.terminarPartida = Game.terminarPartida; // <--- Fundamental para el final

// Funciones de Mecánicas (Están en mechanics.js)
window.tirarDado = Mechanics.tirarDado;
window.reanudarMovimiento = Mechanics.reanudarMovimiento;

// Funciones de UI
window.mostrarToast = UI.mostrarToast; 

// =====================================================
// 3. EVENTOS AL CARGAR LA PÁGINA
// =====================================================

// Cargar UI del ranking inicial
window.addEventListener('load', cargarMarcadorInicial);

window.addEventListener('DOMContentLoaded', () => {
    console.log("✅ DOM Cargado. Conectando botones...");

    // A. Botón Saltar Video
    const btnSaltar = document.getElementById('btn-saltar-video');
    if (btnSaltar) {
        btnSaltar.addEventListener('click', Game.verVideoTerminado);
    }
    
    // B. Botón del Dado
    const btnDado = document.querySelector('.btn-dado');
    if (btnDado) {
         btnDado.addEventListener('click', Mechanics.tirarDado); 
    }
});

// =====================================================
// 4. LÓGICA DE MINIJUEGOS (PAREJAS)
// =====================================================
// Esta lógica necesita acceder a 'window.aplicarRecompensa', 
// que ahora sí existe gracias a la sección 2.

window.estadoMinijuego = {
    seleccionIzq: null,
    seleccionDer: null,
    paresEncontrados: 0,
    totalPares: 0,
    datosCasilla: null
};

window.manejarClickUnion = function(lado, idLogico, elementoHtml) {
    if (elementoHtml.classList.contains('correcto')) return;

    if (lado === 'izq') {
        if (window.estadoMinijuego.seleccionIzq) {
            window.estadoMinijuego.seleccionIzq.el.classList.remove('seleccionado');
        }
        window.estadoMinijuego.seleccionIzq = { id: idLogico, el: elementoHtml };
    } else {
        if (window.estadoMinijuego.seleccionDer) {
            window.estadoMinijuego.seleccionDer.el.classList.remove('seleccionado');
        }
        window.estadoMinijuego.seleccionDer = { id: idLogico, el: elementoHtml };
    }
    
    elementoHtml.classList.add('seleccionado');

    if (window.estadoMinijuego.seleccionIzq && window.estadoMinijuego.seleccionDer) {
        verificarPareja();
    }
};

function verificarPareja() {
    const izq = window.estadoMinijuego.seleccionIzq;
    const der = window.estadoMinijuego.seleccionDer;
    const contenedor = document.querySelector('.contenedor-unir-parejas');
    
    if(contenedor) contenedor.style.pointerEvents = 'none';

    if (izq.id === der.id) {
        // ✅ CORRECTO
        izq.el.classList.remove('seleccionado');
        der.el.classList.remove('seleccionado');
        izq.el.classList.add('correcto');
        der.el.classList.add('correcto');
        
        window.estadoMinijuego.seleccionIzq = null;
        window.estadoMinijuego.seleccionDer = null;
        if(contenedor) contenedor.style.pointerEvents = 'auto';

        window.estadoMinijuego.paresEncontrados++;

        // GANÓ EL MINIJUEGO
        if (window.estadoMinijuego.paresEncontrados === window.estadoMinijuego.totalPares) {
            UI.mostrarToast("✨ ¡Conexiones perfectas!");
            setTimeout(() => {
                // Ahora esto NO fallará porque ya conectamos la función arriba
                window.aplicarRecompensa(window.estadoMinijuego.datosCasilla.recompensa);
                window.ocultarModal();
            }, 1000); 
        }

    } else {
        // ❌ ERROR
        izq.el.classList.add('error');
        der.el.classList.add('error');

        setTimeout(() => {
            izq.el.classList.remove('error', 'seleccionado');
            der.el.classList.remove('error', 'seleccionado');
            window.estadoMinijuego.seleccionIzq = null;
            window.estadoMinijuego.seleccionDer = null;
            if(contenedor) contenedor.style.pointerEvents = 'auto';
        }, 800);
    }
}

// Ventana de términos global
window.mostrarModalTerminos = (callbackAceptar) => {
    const modal = document.getElementById('modal-terminos');
    const btnAceptar = document.getElementById('btn-aceptar');
    const btnRechazar = document.getElementById('btn-rechazar');

    if(!modal) return;

    modal.style.display = 'block';

    const manejarAceptar = () => {
        modal.style.display = 'none';
        btnAceptar.removeEventListener('click', manejarAceptar);
        btnRechazar.removeEventListener('click', manejarRechazar);
        callbackAceptar(); 
    };

    const manejarRechazar = () => {
        modal.style.display = 'none';
        UI.mostrarToast("Debes aceptar los términos para continuar.");
        btnAceptar.removeEventListener('click', manejarAceptar);
        btnRechazar.removeEventListener('click', manejarRechazar);
    };

    btnAceptar.addEventListener('click', manejarAceptar);
    btnRechazar.addEventListener('click', manejarRechazar);
};
