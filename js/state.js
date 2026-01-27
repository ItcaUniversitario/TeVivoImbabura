// js/state.js

export const gameState = {
    jugadoresRegistrados: 0,
    turnoActual: 1,
    fichasSeleccionadas: {},
    jugadoresPartida: [],
    nivelSeleccionado: 0,
    inventarioPartida: {},
    limiteCasillasActual: 0,
    intervaloAnimacionDado: null,
    musicaFondo: null
};

// --- SETTERS SEGUROS ---
export function setJugadoresRegistrados(cantidad) {
    gameState.jugadoresRegistrados = cantidad;
}

export function setNivelSeleccionado(nivel) {
    gameState.nivelSeleccionado = nivel;
}

export function setLimiteCasillas(limite) {
    gameState.limiteCasillasActual = limite;
}

// --- GETTERS ÚTILES ---
export function getJugadorActual() {
    if (gameState.jugadoresPartida.length === 0) return null;
    // turnoActual es 1-based, array es 0-based
    return gameState.jugadoresPartida[gameState.turnoActual - 1];
}

export function avanzarTurno() {
    gameState.turnoActual++;
    if (gameState.turnoActual > gameState.jugadoresPartida.length) {
        gameState.turnoActual = 1;
    }
}