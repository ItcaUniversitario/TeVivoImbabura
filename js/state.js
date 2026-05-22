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
    musicaFondo: null,
    idPartidaActual: null,   // Aquí guardaremos el ID del grupo (Ej: PARTIDA_ABC_123)
    timestampInicio: null
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
    // 1. Verificamos que existan jugadores para evitar errores
    if (!gameState || !gameState.jugadoresPartida || gameState.jugadoresPartida.length === 0) return;

    // 2. Freno de emergencia: Si TODOS ya llegaron a la meta, detenemos los turnos
    const todosTerminaron = gameState.jugadoresPartida.every(j => j.haTerminado);
    if (todosTerminaron) return; 

    // 3. El ciclo buscador: Avanzamos de turno, pero si el jugador ya terminó, lo saltamos
    let intentos = 0; 
    const totalJugadores = gameState.jugadoresPartida.length;

    do {
        // Tu lógica original de sumar 1 al turno
        gameState.turnoActual++;
        if (gameState.turnoActual > totalJugadores) {
            gameState.turnoActual = 1;
        }
        intentos++;
        
    // La condición del 'while' dice: "Repite el salto SI este jugador ya tiene haTerminado en true"
    } while (gameState.jugadoresPartida[gameState.turnoActual - 1].haTerminado === true && intentos < totalJugadores);

    console.log(`➡️ Pasando turno. Ahora juega el Jugador ${gameState.turnoActual}`);
}