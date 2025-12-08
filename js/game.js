import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { mostrarModalTerminos, mostrarToast } from './ui.js';
// --- VARIABLES GLOBALES DE ESTADO (Fundamentales) ---
let jugadoresRegistrados = 0;
let turnoActual = 1;
let fichasSeleccionadas = {};
let intervaloAnimacionDado;
// --- NUEVAS VARIABLES DE ESTADO ---
export let jugadoresPartida = [];
export let nivelSeleccionado = 0;
export let inventarioPartida = {};
// 🔑 NUEVA VARIABLE GLOBAL PARA ALMACENAR EL LÍMITE DE CASILLAS
let limiteCasillasActual = 0;

window.ocultarModal = ocultarModal;
window.reanudarMovimiento = reanudarMovimiento;

// --- CONSTANTES DE RECOMPENSAS (Hacerlas accesibles a todo el módulo) ---
const RECOMPENSAS_DATA = [
    { key: 'helado', src: 'assets/recompensas/helado.png', color: '#FFDCE0' },
    { key: 'arbol', src: 'assets/recompensas/arbol.png', color: '#B2DFDB' },
    { key: 'poncho', src: 'assets/recompensas/poncho.png', color: '#D7CCC8' },
    { key: 'canoa', src: 'assets/recompensas/canoa.png', color: '#E3F2FD' },
    { key: 'algodon', src: 'assets/recompensas/algodon.png', color: '#FAFAFA' },
    // Agrega más si tienes más fichas/recompensas
];




//------------------------------------------------------------------------------------------------
// Variable global o en tu objeto de estado para almacenar las posiciones de las casillas
// Las coordenadas son porcentajes (0 a 100) para que funcionen bien con diferentes tamaños de pantalla
// Variable global que contiene las coordenadas para todos los niveles
const MAPA_COORDENADAS_POR_NIVEL = {
    // Estas son tus 42 coordenadas para el Nivel 1 (Índice 0 a 41)
    1: [
        {
            "top": 57,
            "left": 75
        },
        {
            "top": 59,
            "left": 78
        },
        {
            "top": 60,
            "left": 80
        },
        {
            "top": 62,
            "left": 83
        },
        {
            "top": 64,
            "left": 85
        },
        {
            "top": 65,
            "left": 88
        },
        {
            "top": 67,
            "left": 90
        },
        {
            "top": 68,
            "left": 92
        },
        {
            "top": 70,
            "left": 96
        },
        {
            "top": 74,
            "left": 95
        },
        {
            "top": 75,
            "left": 92
        },
        {
            "top": 77,
            "left": 89
        },
        {
            "top": 78,
            "left": 86
        },
        {
            "top": 78,
            "left": 83
        },
        {
            "top": 80,
            "left": 80
        },
        {
            "top": 79,
            "left": 77
        },
        {
            "top": 80,
            "left": 73
        },
        {
            "top": 79,
            "left": 70
        },
        {
            "top": 78,
            "left": 66
        },
        {
            "top": 77,
            "left": 63
        },
        {
            "top": 74,
            "left": 61
        },
        {
            "top": 73,
            "left": 58
        },
        {
            "top": 72,
            "left": 54
        },
        {
            "top": 71,
            "left": 52
        },
        {
            "top": 67,
            "left": 51
        },
        {
            "top": 66,
            "left": 55
        },
        {
            "top": 65,
            "left": 58
        },
        {
            "top": 63,
            "left": 60
        },
        {
            "top": 61,
            "left": 62
        },
        {
            "top": 57,
            "left": 62
        },
        {
            "top": 54,
            "left": 60
        },
        {
            "top": 52,
            "left": 58
        },
        {
            "top": 48,
            "left": 58
        },
        {
            "top": 45,
            "left": 59
        },
        {
            "top": 43,
            "left": 61
        },
        {
            "top": 40,
            "left": 64
        },
        {
            "top": 37,
            "left": 65
        },
        {
            "top": 33,
            "left": 65
        },
        {
            "top": 30,
            "left": 64
        },
        {
            "top": 27,
            "left": 62
        },
        {
            "top": 23,
            "left": 61
        },
        {
            "top": 19,
            "left": 59
        }


    ],
    // Nivel 2, 3 y 4 inician vacíos. Tendrás que mapearlos después.
    2: [],
    3: [],
    4: []
};

const CONTENIDO_CASILLAS_POR_NIVEL = {
    1: [
        // Casilla 0: INICIO (no especificado en tu data, lo mantenemos como inicial)
        {
            tipo: 'inicio',
            titulo: 'Inicio de la Aventura',
            descripcion: 'Comienzas tu viaje por la Provincia de Imbabura. ¡Mucha suerte!',
            recompensa: null
        },
        // Casilla 1: '1' en infoPoints
        {
            tipo: 'lugar_emblematico',
            titulo: 'HELADOS DE PAILA',
            imagen: 'assets/lugares/helados_paila.png',
            descripcion: 'Has llegado a la cuna de los famosos helados de paila. ¡Obtienes 5 puntos y 1 helado!',
            recompensa: {
                puntos: 5,
                item: 'helado'
            }
        },
        // Casilla 2: Vacía (se mantiene como un paso de camino normal)
        {
            tipo: 'camino',
            titulo: 'Ruta Sencilla',
            descripcion: 'Un camino simple, sin eventos. Continúa avanzando.',
            recompensa: null
        },
        // Casilla 3: '3' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Curioso: Helados',
            descripcion: 'Uno de los acompañantes más frecuentes en el consumo de los helados de paila es la quesadilla. ¡Ganas 5 puntos y 1 Helado!',
            recompensa: {
                puntos: 5,
                item: 'helado'
            }
        },
        // Casilla 4: '4' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Helados de Paila',
            pregunta: '¿Cuál es el nombre de la promotora de los helados de paila más reconocida?',
            opciones: ['María Chuga', 'Rosalía Suárez', 'Anita Benavides'],
            respuestaCorrecta: 1,
            recompensa: {
                correcta: { puntos: 5, item: 'helado', feedback: "¡Correcto! Rosalía Suárez es la pionera. Ganas 5 puntos y 1 Helado." },
                incorrecta: { puntosPerdidos: 3, feedback: "Respuesta incorrecta. La promotora más famosa es Rosalía Suárez. Pierdes 3 puntos." }
            }
        },
        // Casilla 5: '5' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Curioso: Economía',
            descripcion: 'La producción y comercialización de helados dinamiza la agricultura y la economía locales. ¡Ganas 5 puntos!',
            recompensa: {
                puntos: 5,
                item: 'helado'
            }
        },
        // Casilla 6: '6' en eventPoints (Trap con Helado)
        {
            tipo: 'evento',
            subtipo: 'trampa_item',
            titulo: 'Trampa del Antojo',
            condicionItem: 'helado',
            text_fail: '¡Se te antoja un helado! Te distraes pensando en volver a la paila. Retrocedes 1 casilla.',
            move_fail: -1,
            text_success: '¡Oh no! Por la emoción del viaje, se te cae el helado que traías. Pierdes 1 Helado, pero por suerte no retrocedes.',
            itemLost: 'helado',
            move_success: 0
        },
        // Casilla 7: '7' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Instrumentos',
            pregunta: '¿Cuál es el instrumento más característico en la elaboración de los helados de paila?',
            opciones: ['Paila de cobre', 'Banca de madera', 'Congelador'],
            respuestaCorrecta: 0,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Correcto! La paila de cobre es esencial. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. El instrumento clave es la paila de cobre. Pierdes 3 puntos." }
            }
        },
        // Casilla 8: '8' en infoPoints
        {
            tipo: 'lugar_emblematico',
            titulo: 'MIRADOR DE ANGOCHAGUA',
            imagen: 'assets/lugares/mirador_muchanajurumi.png',
            descripcion: 'Disfrutas de una vista espectacular desde el mirador Mucha Naju Rumi. ¡Obtienes 5 puntos y 1 árbol!',
            recompensa: {
                puntos: 5,
                item: 'arbol'
            }
        },
        // Casilla 9: '9' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Curioso: Mucha Naju Rumi',
            descripcion: 'El mirador Mucha Naju Rumi está a una altitud de 2880 msnm. ¡Ganas 5 puntos y 1 Árbol!',
            recompensa: {
                puntos: 5,
                item: 'arbol'
            }
        },
        // Casilla 10: Vacía
        {
            tipo: 'camino',
            titulo: 'Camino de Montaña',
            descripcion: 'El sendero se vuelve empinado. ¡Sigue adelante!',
            recompensa: null
        },
        // Casilla 11: '11' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Idioma',
            pregunta: '¿En qué lengua está escrito Mucha Naju Rumi?',
            opciones: ['Inglés', 'Alemán', 'Kichwa'],
            respuestaCorrecta: 2,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Correcto! Está en Kichwa. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 2, feedback: "Incorrecto. La lengua es Kichwa. Pierdes 2 puntos." }
            }
        },
        // Casilla 12: '12' en eventPoints (Trap de Movimiento)
        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: 'Neblina Desorientadora',
            descripcion: 'Una densa neblina cubre el mirador y te desorientas por completo. Regresas 3 casillas.',
            movimiento: -3
        },
        // Casilla 13: Vacía
        {
            tipo: 'camino',
            titulo: 'Descenso',
            descripcion: 'El camino es más fácil aquí. Aprovecha para descansar.',
            recompensa: null
        },
        // Casilla 14: '14' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Curioso: Volcanes',
            descripcion: 'Desde este mirador se pueden apreciar varios volcanes, tales como: Taita Imbabura, Cubilche, Cuzín. ¡Ganas 5 puntos y 1 Árbol!',
            recompensa: {
                puntos: 5,
                item: 'arbol'
            }
        },
        // Casilla 15: '15' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Traducción',
            pregunta: '¿Conoces la traducción de Mucha Naju Rumi al español?',
            opciones: ['Lugar donde se besan las rocas', 'Lugar donde se rompen las rocas', 'Lugar donde brincan las rocas'],
            respuestaCorrecta: 0,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Excelente! Significa 'Lugar donde se besan las rocas'. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. La traducción es 'Lugar donde se besan las rocas'. Pierdes 3 puntos." }
            }
        },
        // Casilla 16: '16' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Curioso: Flora',
            descripcion: 'En el trayecto al mirador se pueden observar una variedad de plantas y árboles como: achupallas, alisos, eucaliptos. ¡Ganas 5 puntos y 1 Árbol!',
            recompensa: {
                puntos: 5,
                item: 'arbol'
            }
        },
        // Casilla 17: '17' en eventPoints (Advantage)
        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: 'Atajo Secreto',
            descripcion: 'Descubres un camino menos empinado y tomas un atajo. ¡Avanzas 2 casillas!',
            movimiento: 2
        },
        // Casilla 18: '18' en infoPoints
        {
            tipo: 'lugar_emblematico',
            titulo: 'PLAZA DE PONCHOS',
            imagen: 'assets/lugares/plaza_deponchos.png',
            descripcion: 'Estás en el mercado artesanal más grande de Sudamérica. ¡Obtienes 5 puntos y 1 poncho!',
            recompensa: {
                puntos: 5,
                item: 'poncho'
            }
        },
        // Casilla 19: Vacía
        {
            tipo: 'camino',
            titulo: 'Pasaje Comercial',
            descripcion: 'Sientes el ambiente vibrante del comercio.',
            recompensa: null
        },
        // Casilla 20: '20' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Cultural',
            descripcion: 'Alrededor de la plaza de ponchos se pueden encontrar espacios culturales para vivir las costumbres y tradiciones locales. ¡Ganas 5 puntos y 1 Poncho!',
            recompensa: {
                puntos: 5,
                item: 'poncho'
            }
        },
        // Casilla 21: '21' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Fama',
            pregunta: '¿La plaza de ponchos de Otavalo es una de las ferias artesanales más grandes de América Latina?',
            opciones: ['Sí', 'No'],
            respuestaCorrecta: 0,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Así es! Es famosa en todo el continente. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. Es una de las más grandes y famosas. Pierdes 3 puntos." }
            }
        },
        // Casilla 22: '22' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato de Artesanía',
            descripcion: "Además de textiles, en la plaza puedes encontrar figuras talladas en 'tagua', una semilla tan dura que se la conoce como 'marfil vegetal'. ¡Ganas 5 puntos y 1 Poncho!",
            recompensa: {
                puntos: 5,
                item: 'poncho'
            }
        },
        // Casilla 23: '23' en infoPoints
        {
            tipo: 'lugar_emblematico',
            titulo: 'LAGUNA DE CUICOCHA',
            imagen: 'assets/lugares/lago_cuicocha.png',
            descripcion: 'Navegas por el "Lago de los Dioses". ¡Obtienes 5 puntos y 1 canoa!',
            recompensa: {
                puntos: 5,
                item: 'canoa'
            }
        },
        // Casilla 24: Vacía
        {
            tipo: 'camino',
            titulo: 'Rodeando el Lago',
            descripcion: 'El paisaje volcánico te impresiona.',
            recompensa: null
        },
        // Casilla 25: '25' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Cultural: Chacana',
            descripcion: 'En la Ruta Sagrada se pueden encontrar simbolismos de los pueblos originarios como la Chacana y el calendario lunar. ¡Ganas 5 puntos y 1 Canoa!',
            recompensa: {
                puntos: 5,
                item: 'canoa'
            }
        },
        // Casilla 26: '26' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Domo',
            pregunta: 'El domo interior más grande del lago Cuicocha, se llama:',
            opciones: ['Yaguarcocha', 'Cuicocha', 'Teodoro Wolf'],
            respuestaCorrecta: 2,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Correcto! Se llama Teodoro Wolf. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. El domo más grande es el Teodoro Wolf. Pierdes 3 puntos." }
            }
        },
        // Casilla 27: '27' en eventPoints (Trap con Poncho)
        {
            tipo: 'evento',
            subtipo: 'trampa_item',
            titulo: 'El Viento de la Laguna',
            condicionItem: 'poncho',
            text_fail: '¡El viento helado de la laguna te golpea! No tienes poncho para abrigarte y el soroche te marea. Pierdes 3 puntos.',
            pointsLost_fail: 3,
            text_success: '¡El viento helado de la laguna te golpea! Por suerte, usas tu poncho para abrigarte. ¡Te salvas de perder puntos, pero pierdes 1 Poncho!',
            itemLost: 'poncho',
            pointsLost_success: 0
        },
        // Casilla 28: '28' en infoPoints
        {
            tipo: 'lugar_emblematico',
            titulo: 'FÁBRICA IMBABURA',
            imagen: 'assets/lugares/fabrica_imbabura.png',
            descripcion: 'Visitas el histórico complejo textil. ¡Obtienes 5 puntos y 1 algodón!',
            recompensa: {
                puntos: 5,
                item: 'algodon'
            }
        },
        // Casilla 29: '29' en eventPoints (Advantage con Algodón)
        {
            tipo: 'evento',
            subtipo: 'ventaja_recompensa',
            titulo: 'Muestra de Algodón',
            descripcion: 'Llegas a la FÁBRICA IMBABURA, un lugar lleno de historia. ¡Ganas 3 puntos y una muestra de Algodón!',
            recompensa: {
                puntos: 3,
                item: 'algodon'
            }
        },
        // Casilla 30: '30' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Producción',
            pregunta: '¿Sabes qué tipo de telas se producían especialmente en Fábrica Imbabura?',
            opciones: ['Telas de poliester', 'Telas de algodón', 'Telas de poliester y algodón'],
            respuestaCorrecta: 1,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Correcto! Eran especialistas en telas de algodón. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. La producción principal era de telas de algodón. Pierdes 3 puntos." }
            }
        },
        // Casilla 31: '31' en eventPoints (Trap con Algodón)
        {
            tipo: 'evento',
            subtipo: 'trampa_item',
            titulo: 'Peligro de Maquinaria',
            condicionItem: 'algodon',
            text_fail: '¡Qué descuido! Te acercas demasiado a la maquinaria. Te llevas un susto y te obligan a retroceder 2 casillas.',
            move_fail: -2,
            text_success: '¡Por un descuido, una de las máquinas engancha tu materia prima! Logras rescatarla, pero pierdes 1 Algodón en el proceso.',
            itemLost: 'algodon',
            move_success: 0
        },
        // Casilla 32: '32' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Histórico: Fundación',
            descripcion: 'La fecha de fundación de la Fábrica Imbabura es 1924. ¡Ganas 5 puntos y 1 Algodón!',
            recompensa: {
                puntos: 5,
                item: 'algodon'
            }
        },
        // Casilla 33: '33' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Cantón',
            pregunta: '¿En qué cantón está localizada la Fábrica Imbabura?',
            opciones: ['Otavalo', 'Cotacachi', 'Antonio Ante'],
            respuestaCorrecta: 2,
            recompensa: {
                correcta: { puntos: 5, feedback: "¡Exacto! Se encuentra en Antonio Ante. Ganas 5 puntos." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. La fábrica está en el cantón Antonio Ante. Pierdes 3 puntos." }
            }
        },
        // Casilla 34: '34' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Histórico: Dinamización',
            descripcion: 'Fábrica Imbabura, en su época de apogeo dinamizó la producción agrícola de algodón de los valles de Salinas y el Chota. ¡Ganas 5 puntos y 1 Algodón!',
            recompensa: {
                puntos: 5,
                item: 'algodon'
            }
        },
        // Casilla 35: Vacía
        {
            tipo: 'camino',
            titulo: 'Tramo Final',
            descripcion: 'Estás cerca de la meta final, ¡sigue adelante!',
            recompensa: null
        },
        // Casilla 36: '36' en infoPoints
        {
            tipo: 'lugar_emblematico',
            titulo: 'MONTAÑA DE LUZ',
            imagen: 'assets/lugares/montaña_deluz.png',
            descripcion: 'Llegas a un lugar de paz y sanación. ¡Obtienes 10 puntos y 1 árbol simbólico!',
            recompensa: {
                puntos: 10,
                item: 'arbol'
            }
        },
        // Casilla 37: Vacía
        {
            tipo: 'camino',
            titulo: 'Sendero de Reflexión',
            descripcion: 'Un lugar tranquilo para recargar energías.',
            recompensa: null
        },
        // Casilla 38: '38' en questionPoints
        {
            tipo: 'pregunta',
            titulo: 'Pregunta: Historia Local',
            pregunta: '¿Cuál era el nombre original de la parroquia Pablo Arenas?',
            opciones: ['Cruzcacho', 'Angochagua', 'San Pablo'],
            respuestaCorrecta: 0,
            recompensa: {
                correcta: { puntos: 5, item: 'arbol', feedback: "¡Correcto! El nombre original era Cruzcacho. Ganas 5 puntos y 1 Árbol." },
                incorrecta: { puntosPerdidos: 3, feedback: "Incorrecto. La respuesta correcta es Cruzcacho. Pierdes 3 puntos." }
            }
        },
        // Casilla 39: '39' en eventPoints (Trap de Puntos)
        {
            tipo: 'evento',
            subtipo: 'trampa_puntos',
            titulo: 'Distracción en el Geoparque',
            descripcion: "¡El paisaje desde la 'Montaña de Luz' es espectacular! Te distraes tanto admirando el Geoparque que se te hace tarde. Pierdes 5 puntos.",
            pointsLost: 5
        },
        // Casilla 40: '40' en rewardPoints
        {
            tipo: 'dato_curioso',
            titulo: 'Dato Curioso: Productos Orgánicos',
            descripcion: 'En Montaña de Luz se ofrecen servicios de alimentación preparados con productos orgánicos, cultivados en el mismo lugar. ¡Ganas 5 puntos y 1 Árbol!',
            recompensa: {
                puntos: 5,
                item: 'arbol'
            }
        },
        // Casilla 41: '41' en finalMessage (Casilla Final)
        {
            tipo: 'fin',
            titulo: '¡FINAL DE LA AVENTURA!',
            descripcion: '¡Felicidades, has culminado la Aventura en Imbabura!',
            recompensa: null
        }
    ],
    2: [ /* Contenido del Nivel 2 */],
    3: [ /* Contenido del Nivel 3 */],
    4: [ /* Contenido del Nivel 4 */]
};








// Variable que almacena el límite de casillas para el nivel 1 (42 casillas)
// Ya que la indexación de tu array va de 0 a 41.

// La casilla final es el índice 41 (casilla 42)
// --- 1. INICIAR JUEGO (Generar Formulario) ---
// Paso 1: Escoge número de jugadores
export function iniciarJuego(cantidad) {
    // La variable global 'jugadoresRegistrados' debe estar definida en game.js
    jugadoresRegistrados = cantidad;
    document.getElementById('pantalla-jugadores').style.display = 'none';

    const contenedor = document.getElementById('contenedor-inputs');
    contenedor.innerHTML = '';

    for (let i = 1; i <= cantidad; i++) {
        // Nota: Agregamos 'window.' a las funciones onclick para asegurar que las encuentre
        const htmlJugador = `
            <div class="ficha-jugador">
                <h3 class="titulo-ficha">👤 Datos del Viajero ${i}</h3>
                
                <div class="grupo-busqueda">
                    <input type="number" id="cedula-j${i}" class="input-imbabura" placeholder="Ingrese Cédula" oninput="if(this.value.length > 10) this.value = this.value.slice(0, 10);"> 
                    <button class="btn-imbabura primario" onclick="window.verificarCedula(${i})">🔍 Buscar</button>
                </div>

                <div id="mensaje-j${i}" class="mensaje-alerta">⚠️ Aún no estás registrado. Llena tus datos:</div>
                
               <div id="form-extra-j${i}" class="campos-restantes" style="display: none;">
                   <div class="grid-formulario">
                       <input type="text" id="nombre-j${i}" class="input-imbabura" placeholder="Nombre Completo *">
                       <input type="number" id="telefono-j${i}" class="input-imbabura" placeholder="Teléfono/Celular *" oninput="if(this.value.length > 10) this.value = this.value.slice(0, 10);">
                       <input type="email" id="email-j${i}" class="input-imbabura full-width" placeholder="Email *">
                       
                       <select id="genero-j${i}" class="input-imbabura">
                           <option value="" disabled selected>Género *</option>
                           <option value="MASCULINO">Masculino</option>
                           <option value="FEMENINO">Femenino</option>
                           <option value="OTRO">Otro</option>
                       </select>
                       
                       <input type="number" id="edad-j${i}" class="input-imbabura" placeholder="Edad *" min="1">
                       
                       <input type="text" id="ciudad-j${i}" class="input-imbabura" placeholder="Ciudad (Opcional)">
                   </div>
               </div>
            </div>`;
        contenedor.innerHTML += htmlJugador;
    }

    // Paso 2: Pantalla de Registro
    document.getElementById('pantalla-registro').style.display = 'block';
}

// --- 2. VERIFICAR CÉDULA ---
export async function verificarCedula(indice) {
    const inputCedula = document.getElementById(`cedula-j${indice}`);
    const cedulaValor = inputCedula.value.trim();

    if (cedulaValor === "") {
        mostrarToast("Por favor escribe un número de cédula.");
        return;
    }
    // --- CLAVE: CHEQUEO DE DUPLICIDAD EN LA SESIÓN ACTUAL ---
    for (let i = 1; i < indice; i++) {
        const cedulaAnterior = document.getElementById(`cedula-j${i}`).value.trim();
        if (cedulaValor === cedulaAnterior) {
            mostrarToast(`⛔ La cédula ${cedulaValor} ya fue registrada por el Jugador ${i}.`);
            return;
        }
    }
    // --------------------------------------------------------
    // Manejo seguro del botón
    const btn = event.target;
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "⌛"; btn.disabled = true;

    try {
        const docRef = doc(db, "registros", cedulaValor);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const datos = docSnap.data();
            mostrarToast(`¡Hola de nuevo, ${datos.nombre}! 👋`);
            document.getElementById(`mensaje-j${indice}`).style.display = 'none';
            document.getElementById(`form-extra-j${indice}`).style.display = 'block';

            document.getElementById(`nombre-j${indice}`).value = datos.nombre || "";
            document.getElementById(`telefono-j${indice}`).value = datos.telefono || "";
            document.getElementById(`email-j${indice}`).value = datos.email || "";
            document.getElementById(`genero-j${indice}`).value = datos.genero || "";

            // 🔑 CLAVE: RECUPERAR EL CAMPO EDAD DESDE FIREBASE Y MOSTRARLO EN EL INPUT
            document.getElementById(`edad-j${indice}`).value = datos.edad || "";

            document.getElementById(`ciudad-j${indice}`).value = datos.ciudad || "";
        } else {
            document.getElementById(`mensaje-j${indice}`).style.display = 'block';
            document.getElementById(`form-extra-j${indice}`).style.display = 'block';
            document.getElementById(`nombre-j${indice}`).value = "";
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarToast("Error conectando. Revisa la consola.");
    } finally {
        btn.innerHTML = textoOriginal; btn.disabled = false;
    }
}

// --- 3. INICIAR TABLERO (Maneja validaciones y llama al modal de TyC) ---
export async function iniciarTablero() {
    // Nota: El botón que disparó el evento ya no se manipula aquí, sino en aceptarTerminosYContinuar

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const numDiezRegex = /^\d{10}$/;

    // 1. Validaciones
    for (let i = 1; i <= jugadoresRegistrados; i++) {
        const formExtra = document.getElementById(`form-extra-j${i}`);
        const cedulaVal = document.getElementById(`cedula-j${i}`).value.trim();
        
        // Chequeo de duplicidad final
        for (let j = i + 1; j <= jugadoresRegistrados; j++) {
            const otraCedula = document.getElementById(`cedula-j${j}`).value.trim();
            if (cedulaVal === otraCedula) {
                mostrarToast(`⛔ Error: La misma cédula (${cedulaVal}) está en los Jugadores ${i} y ${j}.`);
                return;
            }
        }
        
        // Validaciones de campos de identidad
        if (cedulaVal === "") { mostrarToast(`⚠️ J${i}: Ingrese cédula.`); return; }
        if (!numDiezRegex.test(cedulaVal)) { mostrarToast(`⚠️ J${i}: Cédula de 10 dígitos.`); return; }
        if (formExtra.style.display === 'none' || formExtra.style.display === '') { mostrarToast(`⚠️ J${i}: Clic en "Buscar".`); return; }

        // Validaciones de campos de registro
        const nombre = document.getElementById(`nombre-j${i}`).value.trim();
        const telefono = document.getElementById(`telefono-j${i}`).value.trim();
        const email = document.getElementById(`email-j${i}`).value.trim();
        const genero = document.getElementById(`genero-j${i}`).value;
        const edad = document.getElementById(`edad-j${i}`).value;

        if (nombre === "") { mostrarToast(`⚠️ Falta Nombre Jugador${i}`); return; }
        if (telefono === "") { mostrarToast(`⚠️ Falta Teléfono Jugador${i}`); return; }
        if (!numDiezRegex.test(telefono)) { mostrarToast(`⚠️ Jugador${i}: Celular de 10 dígitos.`); return; }
        if (email === "") { mostrarToast(`⚠️ Falta Email Jugador${i}`); return; }
        if (!emailRegex.test(email)) { mostrarToast(`⚠️ Email inválido J${i}`); return; }
        if (genero === "") { mostrarToast(`⚠️ Falta Género Jugador${i}`); return; }
        if (edad === "") { mostrarToast(`⚠️ Falta Edad Jugador${i}`); return; } 
    }

    // 2. Si todas las validaciones pasan, mostrar el modal de Términos
    mostrarModalTerminos(aceptarTerminosYContinuar);
}

// --- 4. FUNCIONES DE NAVEGACIÓN Y FICHAS ---

export function volverSeleccion() {
    document.getElementById('pantalla-registro').style.display = 'none';
    document.getElementById('pantalla-jugadores').style.display = 'flex';
}

export function accesoAdmin() {
    window.location.href = 'admin.html';
}

// Helper interno (no se exporta porque solo se usa aquí)
function actualizarTituloFicha() {
    const nombreJugador = document.getElementById(`nombre-j${turnoActual}`).value;
    const primerNombre = nombreJugador.split(" ")[0];
    const titulo = document.getElementById('titulo-seleccion');
    if (titulo) {
        titulo.innerText = `👤 ${primerNombre}, elige tu ficha`;
        titulo.style.animation = 'none';
        titulo.offsetHeight;
        titulo.style.animation = 'fadeIn 0.5s ease';
    }
}

// MODIFICACIÓN 3: Al terminar la Selección de Fichas, vamos al MAPA.
export function seleccionarFicha(numeroFicha) {
    const btnFicha = document.getElementById(`ficha-${numeroFicha}`);

    // 1. Efecto visual de selección (Desactivar y Marcar)
    if (btnFicha) {
        btnFicha.disabled = true; // Bloquea la ficha para que nadie más la use
        btnFicha.style.border = "3px solid #2E7D32"; // Marca con borde verde
    }

    // 2. Guardar selección (Se almacena la ficha elegida por el jugador actual)
    fichasSeleccionadas[`jugador_${turnoActual}`] = numeroFicha;

    // AÑADIR ESTO: Inyectar la ficha y la posición inicial en jugadoresPartida
    // Usamos turnoActual - 1 porque es el índice 0-based
    jugadoresPartida[turnoActual - 1].fichaId = numeroFicha;
    jugadoresPartida[turnoActual - 1].posicion = 0; // Inicia en la casilla 0
    jugadoresPartida[turnoActual - 1].id = turnoActual; // ID numérico para las fichas (1, 2, 3)
    // 3. Lógica de Avance de Turno
    if (turnoActual < jugadoresRegistrados) {

        // --- AVANCE AL SIGUIENTE JUGADOR ---
        turnoActual++;
        actualizarTituloFicha(); // Actualiza el título: "Hola [Jugador 2], elige..."


        // Archivo: game.js (dentro de function seleccionarFicha)

    } else {

        // 1. Elegir al primer jugador y guardar su nombre
        const nombrePrimerJugador = determinarJugadorInicial();

        // 2. Ocultar la pantalla de selección de personaje
        document.getElementById('pantalla-personaje').style.display = 'none';

        // 🏆 ¡AQUÍ! La función crea y posiciona las fichas en la Casilla 0
        crearFichasEnMapa();

        // 3. PASAR DIRECTAMENTE AL MAPA
        document.getElementById('contenedor-mapa').style.display = 'flex';
        document.getElementById('panel-derecho').style.display = 'block';

        // 🏆 MOSTRAR EL MENSAJE DEL JUGADOR INICIAL


        mostrarToast(`🎉 ¡Comienza ${nombrePrimerJugador}!`);

        renderizarScorePartida();
        mostrarPestana('score');
        actualizarInterfazPartida();
    }
}

// ////////////////////////////////////////////////////////////////////
// 5. FUNCIÓN DE GUARDADO (Se llama SOLO al aceptar los TyC)
// ////////////////////////////////////////////////////////////////////

// --- 3.1. PROCESO DE GUARDADO Y CONTINUACIÓN ---
async function aceptarTerminosYContinuar() {
    const btnJugar = document.querySelector('.btn-imbabura.primario');

    // 1. Inicializar arrays de partida
    jugadoresPartida = []; 
    inventarioPartida = {}; 

    for (let i = 1; i <= jugadoresRegistrados; i++) {
        const cedula = document.getElementById(`cedula-j${i}`).value.trim();
        const nombre = document.getElementById(`nombre-j${i}`).value.trim().toUpperCase();

        // Lógica de inventario base
        let inventarioBase = {};
        RECOMPENSAS_DATA.forEach(item => {
            inventarioBase[item.key] = 0;
        });
        inventarioPartida[cedula] = inventarioBase;

        // Llenar el array de la partida
        jugadoresPartida.push({
            cedula: cedula,
            nombre: nombre,
            puntos: 0,
        });
    }

    if (btnJugar) { btnJugar.innerHTML = "🚀 Guardando..."; btnJugar.disabled = true; }

    // 2. GUARDADO EN FIREBASE con los nuevos campos
    try {
        for (let i = 1; i <= jugadoresRegistrados; i++) {
            let cedula = document.getElementById(`cedula-j${i}`).value.trim();

            let datos = {
                nombre: document.getElementById(`nombre-j${i}`).value.trim().toUpperCase(), 
                telefono: document.getElementById(`telefono-j${i}`).value.trim(),
                email: document.getElementById(`email-j${i}`).value.trim(),
                genero: document.getElementById(`genero-j${i}`).value.toUpperCase(),
                edad: parseInt(document.getElementById(`edad-j${i}`).value.trim()),
                ciudad: document.getElementById(`ciudad-j${i}`).value.trim().toUpperCase(),
                registradoEn: new Date().toLocaleString(),
                
                // ⭐ MODIFICACIÓN CLAVE AQUÍ: Usamos la cadena de texto solicitada
                aceptaTerminos: "Acepta términos", 
                fechaAceptacionTerminos: new Date().toISOString(), 
            };

            await setDoc(doc(db, "registros", cedula), datos, { merge: true });
        }

        // 3. Transición de pantalla
        document.getElementById('pantalla-registro').style.display = 'none';
        document.getElementById('pantalla-video').style.display = 'flex';
        
        const video = document.getElementById('video-intro');
        if (video) {
            // Asegúrate de que verVideoTerminado esté definida y exportada en game.js
            video.addEventListener('ended', window.verVideoTerminado); 
            video.play().catch(error => {
                console.log("No se pudo iniciar el autoplay.");
                mostrarToast("▶ Haz clic en Play o 'Saltar' para continuar.");
            });
        }

    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        mostrarToast("❌ Error al guardar.");
    } finally {
        if (btnJugar) { btnJugar.innerHTML = "¡A JUGAR! 🚀"; btnJugar.disabled = false; }
    }
}




// Paso 5: Al seleccionar el Nivel, vamos a SELECCIÓN DE PERSONAJE.
export function cargarNivel(nivel) {
    // 1. Validación de Nivel
    // Aquí podrías filtrar las fichas disponibles según el nivel, si aplica
    if (nivel !== 1) {
        mostrarToast("⛔ Este nivel aún está en construcción.");
        return;
    }



    // 2. Guardar estado
    nivelSeleccionado = nivel;
    turnoActual = 1;
    fichasSeleccionadas = {}; // Reiniciamos las fichas seleccionadas de la partida anterior

    // 3. Ocultar la pantalla de niveles
    document.getElementById('pantalla-niveles').style.display = 'none';

    // 🏆 CLAVE 1: MOSTRAR la pantalla de transición (2 segundos)
    const pantallaInter = document.getElementById('pantalla-interstitial');
    if (pantallaInter) {
        pantallaInter.style.display = 'flex';
    }

    // 🏆 CLAVE 2: Iniciar el temporizador para la transición a SELECCIÓN DE PERSONAJE
    setTimeout(() => {

        // --- 4. Transición a la pantalla de personaje (Después de 2s) ---

        // Ocultar la pantalla de transición
        if (pantallaInter) {
            pantallaInter.style.display = 'none';
        }

        // Inicializamos la selección para el Jugador 1
        actualizarTituloFicha();

        // Mostrar la pantalla de selección de personaje
        document.getElementById('pantalla-personaje').style.display = 'flex';

    }, 2000); // 2000 milisegundos = 2 segundos



    for (let i = 1; i <= 5; i++) { // Asumiendo que tienes 5 fichas (1 a 5)
        const btnFicha = document.getElementById(`ficha-${i}`);
        if (btnFicha) {
            btnFicha.disabled = false; // Habilita el botón
            btnFicha.style.border = "2px solid var(--color-tierra-clara)"; // Restaura el borde original
            // Asegúrate de remover cualquier clase de "seleccionado" si usas clases
            btnFicha.classList.remove('ficha-seleccionada');
        }
    }
}
//------------------------------------------------------------------------------------------------
// NUEVA FUNCIÓN: Al terminar el video, vamos a la SELECCIÓN DE NIVEL.
export function verVideoTerminado() {

    // Pausa el video y remueve el listener si el usuario hace clic en 'Saltar'
    const video = document.getElementById('video-intro');
    if (video) {
        video.pause();
        video.removeEventListener('ended', verVideoTerminado);
    }

    document.getElementById('pantalla-video').style.display = 'none';

    // Paso 4: Vamos a Niveles
    document.getElementById('pantalla-niveles').style.display = 'flex';
}

// --- FUNCIÓN DE NAVEGACIÓN ENTRE PESTAÑAS ---
export function mostrarPestana(tabId) {
    // 1. Ocultar todos los contenidos de pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('activo');
    });

    // 2. Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('activo');
    });

    // 3. Mostrar el contenido y activar el botón
    const contenido = document.getElementById(`tab-${tabId}`);
    if (contenido) {
        contenido.classList.add('activo');
    }

    // 4. Activar el botón que fue presionado
    const botonPresionado = event.target;
    if (botonPresionado) {
        botonPresionado.classList.add('activo');
    }
}



// En js/game.js

function renderizarScorePartida() {
    const container = document.getElementById('score-partida-container');
    // const recompensasContainer = document.getElementById('recompensas-container'); <-- YA NO NECESITAS ESTO
    const labelNivel = document.getElementById('label-nivel');


    // --- REEMPLAZA EL CONTENIDO DE TU FUNCIÓN COMPLETA CON ESTO ---

    if (labelNivel) labelNivel.innerText = `Ruta Nivel ${nivelSeleccionado}`;
    if (!container) return;

    // 1. Limpieza inicial del contenedor
    container.innerHTML = '';

    if (jugadoresPartida.length === 0) {
        container.innerHTML = '<p style="font-size:0.9rem; color:#666; text-align: center;">No hay jugadores en esta partida.</p>';
        return;
    }

    // 2. Generación del contenido (Grid de 3 columnas/2 filas)
    jugadoresPartida.forEach((jugador, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'jugador-score-partida'; // Usa la clase Grid
        scoreItem.id = `partida-score-j${index + 1}`;

        const fichaId = fichasSeleccionadas[`jugador_${index + 1}`];
        const cedulaJugador = jugador.cedula;
        const primerNombre = jugador.nombre.split(" ")[0]; // Primer nombre

        // --- 🚨 INICIO DEL BLOQUE A REEMPLAZAR (Generación de Recompensas) ---

        let recompensasHtml = '';
        // Ahora, 'itemsObtenidos' es el OBJETO DE CONTEO { 'helado': 1, 'arbol': 2, ... }
        // Usa 'inventarioPartida' que ya fue inicializado con todos los ítems en 0.
        const itemsObtenidos = inventarioPartida[cedulaJugador] || {};

        // Obtiene las claves del objeto (helado, arbol, poncho, etc.)
        const clavesRecompensas = Object.keys(itemsObtenidos);

        // Recorremos las claves ÚNICAS para generar los iconos
        // Usamos el array completo de RECOMPENSAS_DATA para garantizar el orden si es necesario,
        // pero principalmente iteramos sobre lo que el jugador pueda tener para optimizar.

        clavesRecompensas.forEach(itemKey => {
            const cantidad = itemsObtenidos[itemKey]; // OBTIENE LA CANTIDAD (0, 1, 2, etc.)
            const itemData = RECOMPENSAS_DATA.find(r => r.key === itemKey);

            // 🚨 CLAVE: Solo renderizar si el jugador tiene 1 o más de la recompensa
            if (itemData && cantidad > 0) {
                recompensasHtml += `
                    <div class="recompensa-item-wrapper">
                        <div class="recompensa-icono-miniatura" 
                              style="background-image: url('${itemData.src}'); background-color: ${itemData.color};">
                            
                            <span class="recompensa-contador-badge">${cantidad}</span>
                            
                        </div>
                    </div>
                `;
            }
        });

        // --- 🚨 FIN DEL BLOQUE A REEMPLAZAR (El resto del código sigue igual) ---

        scoreItem.innerHTML = `
    <!-- COLUMNA 1: FICHA (Ocupa 2 filas) -->
    <div class="ficha-wrapper">
        <img src="assets/fichas/ficha_${fichaId}.png" 
             alt="Ficha" 
             style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--color-bosque-claro); object-fit: contain;">
    </div>
    
    <!-- COLUMNA 2 (1fr) -->
    
    <!-- FILA 1: NOMBRE Y PUNTAJE -->
    <div class="info-jugador-principal">
        <div class="nombre-wrapper">
            ${primerNombre}
        </div>
        
        <span class="puntaje-wrapper">
            ${jugador.puntos} Pts
        </span>
    </div>
    
    <!-- FILA 2: RECOMPENSAS -->
    <div class="recompensas-jugador-individual">
        ${recompensasHtml}
    </div>
`;
        container.appendChild(scoreItem);
    });



}



// --- FUNCIÓN MAESTRA: ACTUALIZA INTERFAZ POR TURNO ---
export function actualizarInterfazPartida() {
    const cedulaJugadorTurno = jugadoresPartida[turnoActual - 1].cedula;
    const nombreJugadorTurno = jugadoresPartida[turnoActual - 1].nombre.split(" ")[0];

    // 1. Marcar quién tiene el turno activo en el Scoreboard
    document.querySelectorAll('.jugador-score-partida').forEach((el, index) => {
        el.classList.remove('turno-activo');
        if (index + 1 === turnoActual) {
            el.classList.add('turno-activo');
        }
    });

    // 2. Actualizar el Label de turno
    document.getElementById('nombre-jugador-turno').innerText = nombreJugadorTurno;

    // 3. Renderizar el inventario del jugador actual
    renderizarRecompensas(cedulaJugadorTurno);
}

// En js/game.js
// Función que dibuja las recompensas del jugador
// En js/game.js
// Función que dibuja las recompensas del jugador
function renderizarRecompensas(cedulaJugador) {
    const recompensasContainer = document.getElementById('recompensas-container');
    if (!recompensasContainer) return;

    recompensasContainer.innerHTML = '';

    // 1. Obtener el objeto de conteo de ítems del jugador actual
    const itemsObtenidos = inventarioPartida[cedulaJugador] || {};
    const itemsKeys = Object.keys(itemsObtenidos);
    const maxSlots = 6;
    let slotCount = 0; // Contador para saber cuántos slots hemos llenado

    // 2. Iterar sobre los ítems que el jugador POSEE (cantidad > 0)
    for (const itemKey of itemsKeys) {
        const cantidad = itemsObtenidos[itemKey];

        // 🚨 CLAVE: Solo procesar si la cantidad es mayor que 0
        if (cantidad > 0 && slotCount < maxSlots) {
            const itemData = RECOMPENSAS_DATA.find(r => r.key === itemKey);

            if (itemData) {
                // SLOTS LLENOS
                const contenidoHTML = `
                    <img src="${itemData.src}" alt="${itemKey}" style="width: 80%; height: 80%; object-fit: contain;">
                    <span class="recompensa-contador-badge">${cantidad}</span>
                `;
                const slotClass = 'recompensa-slot-lleno';
                const color = itemData.color;

                recompensasContainer.innerHTML += `
                    <div class="recompensa-slot ${slotClass}" style="background: ${color};">
                        ${contenidoHTML}
                    </div>
                `;
                slotCount++;
            }
        }
    }

    // 3. Rellenar los slots vacíos si no hay 6 ítems únicos
    while (slotCount < maxSlots) {
        recompensasContainer.innerHTML += `
            <div class="recompensa-slot recompensa-slot-vacio" style="background: #f0f0f0;">
                </div>
        `;
        slotCount++;
    }
}

//-----------------------------------------------------------------------------------------------------------

function determinarJugadorInicial() {
    const numJugadores = jugadoresPartida.length;

    // Genera un índice aleatorio
    const indiceInicial = Math.floor(Math.random() * numJugadores);

    // Establece el turno (1-based index)
    turnoActual = indiceInicial + 1;

    const nombreInicial = jugadoresPartida[indiceInicial].nombre;

    // ❌ IMPORTANTE: ELIMINAR O COMENTAR el mostrarToast() que estaba aquí.

    return nombreInicial; // Devuelve el nombre para usarlo después.
}





/**
 * Crea las fichas de 1 a 3 jugadores y las coloca en la Casilla 0.
 * Todas las fichas se superponen en el punto central de la coordenada.
 */
function crearFichasEnMapa() {
    const contenedorFichas = document.getElementById('contenedor-fichas');
    contenedorFichas.innerHTML = '';

    const coordenadasNivel = MAPA_COORDENADAS_POR_NIVEL[nivelSeleccionado];
    if (!coordenadasNivel || coordenadasNivel.length === 0) return;

    // La coordenada de la Casilla 0
    const inicio = coordenadasNivel[0];

    // ❌ LÓGICA ELIMINADA: Ya no se calcula offset.

    jugadoresPartida.forEach((jugador) => {
        const fichaImg = document.createElement('img');

        fichaImg.id = `ficha-jugador-${jugador.id}`;
        fichaImg.className = 'ficha-juego';
        fichaImg.src = `assets/fichas/ficha_${jugador.fichaId}.png`;

        // Posicionar exactamente en el centro de la coordenada mapeada
        fichaImg.style.top = `${inicio.top}%`;
        fichaImg.style.left = `${inicio.left}%`; // <-- SIN OFFSET

        contenedorFichas.appendChild(fichaImg);
    });
}
/**
 * Mueve la ficha de un jugador a su nueva casilla en el mapa.
 * Si las fichas caen en la misma casilla, se superponen.
 */
function moverFicha(jugadorId, nuevaCasillaIndex) {
    const ficha = document.getElementById(`ficha-jugador-${jugadorId}`);
    if (!ficha) return;

    const coordenadasNivel = MAPA_COORDENADAS_POR_NIVEL[nivelSeleccionado];

    if (!coordenadasNivel || nuevaCasillaIndex < 0 || nuevaCasillaIndex >= coordenadasNivel.length) {
        console.error(`Casilla ${nuevaCasillaIndex} fuera de rango o Nivel ${nivelSeleccionado} no mapeado.`);
        return;
    }

    const coordenadas = coordenadasNivel[nuevaCasillaIndex];

    // Posicionar en el centro exacto de la coordenada mapeada (Superposición)
    ficha.style.top = `${coordenadas.top}%`;
    ficha.style.left = `${coordenadas.left}%`;
}



//_-------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
// --- NUEVAS FUNCIONES PARA EL JUEGO DE MESA ---
// Rotaciones en grados (X, Y) necesarias para mostrar cada cara hacia adelante
const ROTACIONES_FINAL = {
    1: 'rotateX(0deg) rotateY(0deg)',     // Cara 1
    2: 'rotateY(-90deg)',                 // Cara 2
    3: 'rotateX(-90deg)',                 // Cara 3
    4: 'rotateX(90deg)',                  // Cara 4
    5: 'rotateY(90deg)',                  // Cara 5
    6: 'rotateY(180deg)',                 // Cara 6
};

/**
 * Muestra el cubo 3D y aplica la animación de rodado infinito, 
 * utilizando las etiquetas <img> en lugar de puntos Unicode.
 */
function animarRodadoDado() {
    const display = document.getElementById('resultado-dado-display');
    if (!display) return;

    display.style.display = 'block';

    // 🚨 CLAVE: Inyectamos la estructura del CUBO 3D con las imágenes
    // La estructura inyectada coincide con el HTML que nos proporcionaste:
    display.innerHTML = `
        <div id="dado-cubo" class="rodando">
            <div class="cara cara-1"><img src="assets/dado/dado1.png" alt="Cara 1"></div>
            <div class="cara cara-2"><img src="assets/dado/dado2.png" alt="Cara 2"></div>
            <div class="cara cara-3"><img src="assets/dado/dado3.png" alt="Cara 3"></div>
            <div class="cara cara-4"><img src="assets/dado/dado4.png" alt="Cara 4"></div>
            <div class="cara cara-5"><img src="assets/dado/dado5.png" alt="Cara 5"></div>
            <div class="cara cara-6"><img src="assets/dado/dado6.png" alt="Cara 6"></div>
        </div>
    `;

    // El elemento dado-cubo ya está girando gracias a la clase 'rodando' en CSS
}

// -------------------------------------------------------------
// Necesitas esta función para detener el bucle
// Nota: La variable 'intervaloAnimacionDado' debe ser definida globalmente 
// si se utiliza un setInterval para un "rodado avanzado", pero se mantiene por ahora.
function detenerAnimacionDado() {
    if (intervaloAnimacionDado) {
        clearInterval(intervaloAnimacionDado);
    }
}

/**
 * Fija el resultado de la tirada aplicando una rotación suave 3D final.
 * @param {number} resultado - El número obtenido del dado (1 a 6).
 */
function renderizarDado(resultado) {
    const cubo = document.getElementById('dado-cubo');

    if (cubo) {
        // 1. Quitar la animación de giro infinito
        cubo.classList.remove('rodando');

        // 2. Aplicar la rotación final, agregando un poco de giro extra (ej. 1080 grados)
        // Nota: Asegúrate de que translateZ(5vw) coincida con el CSS. Si usaste 3vw en el CSS, 
        // ¡deberías usar 3vw aquí también! Se mantiene 5vw como estaba originalmente.
        const rotacionBase = ROTACIONES_FINAL[resultado];
        cubo.style.transform = `${rotacionBase} translateZ(5vw) rotateX(1080deg) rotateY(1080deg)`;

        // El transition: transform 1.5s ease-out en el CSS hará que esto se vea como un rodado suave.
    }
}
// -------------------------------------------------------------
/**
 * Simula el lanzamiento de un dado de 6 caras.
 * @returns {number} El resultado del dado (1 a 6).
 */
function lanzarDado() {
    return Math.floor(Math.random() * 6) + 1;
}


// -------------------------------------------------------------
// FUNCIÓN PRINCIPAL DEL DADO Y MOVIMIENTO (Exportada)
// -------------------------------------------------------------
// FUNCIÓN PRINCIPAL DEL DADO Y MOVIMIENTO (Exportada)
export function tirarDado() {
    const botonDado = document.getElementById('boton-dado');
    const displayDado = document.getElementById('resultado-dado-display');
if (!musicaFondo) { // Verifica si la música ya se inició
        iniciarMusicaFondo();
    }
    if (botonDado) {
        botonDado.disabled = true;
        botonDado.innerText = 'Rodando...';
    }

    const jugadorActual = jugadoresPartida[turnoActual - 1];
    
    // ⭐ CLAVE: LLAMADA AL SONIDO AQUÍ
    reproducirSonidoDado();

    // INICIAR SIMULACIÓN VISUAL
    animarRodadoDado();
    // 🔑 CLAVE: CÁLCULO DINÁMICO Y ALMACENAMIENTO GLOBAL
    const contenidoNivelActual = CONTENIDO_CASILLAS_POR_NIVEL[nivelSeleccionado];
    // Calcula el índice final (longitud - 1) y lo guarda globalmente.
    limiteCasillasActual = contenidoNivelActual ? contenidoNivelActual.length - 1 : 0;

    // ----------------------------------------------------
    // TIMEOUT 1 (1.5s): Detiene el dado y obtiene resultado
    // ----------------------------------------------------
    setTimeout(() => {

        detenerAnimacionDado();
        const resultadoDado = lanzarDado();

        renderizarDado(resultadoDado);
        mostrarToast(`🎲 ${jugadorActual.nombre.split(" ")[0]} tiró un ${resultadoDado}!`);

        // ----------------------------------------------------
        // TIMEOUT 2 (1.0s): Mueve la ficha
        // ----------------------------------------------------
        setTimeout(() => {

            if (displayDado) displayDado.style.display = 'none';

            const pasos = resultadoDado;
            const jugadorId = jugadorActual.id;

            // 🔑 USAMOS EL LÍMITE ALMACENADO GLOBALMENTE
            animarMovimiento(jugadorId, pasos, limiteCasillasActual);

        }, 1000);
    }, 1500);
}

// --- FUNCIÓN DE UTILIDAD: REPRODUCIR SONIDO ---
function reproducirSonidoDado() {
    // Asegúrate de que la ruta del archivo sea correcta
    const audio = new Audio('assets/audio/sonido_dado.mp3'); 
    
    // El try/catch es para manejar errores de autoplay en algunos navegadores
    audio.play().catch(error => {
        console.error("Error al reproducir el sonido del dado:", error);
        // Puedes agregar aquí un manejo de error si es crítico
    });
}

//__________________________________________________________________________________________________________________________________
//----------------------------------------------------------------------------------------------------------
//--------------------------------------NIVEL 1--------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------
// --- Datos de Referencia (Asegúrate de que tus datos estén accesibles) ---

// --- NUEVAS VARIABLES GLOBALES PARA MÚSICA DE FONDO ---
let musicaFondo = null; // Almacenará el objeto Audio
const URL_MUSICA_FONDO = 'assets/audio/audio_TevivoImbabura.mp3';

/**
 * Inicia la música de fondo en loop (solo si no está iniciada).
 */
function iniciarMusicaFondo() {
    if (!musicaFondo) {
        musicaFondo = new Audio(URL_MUSICA_FONDO);
        musicaFondo.loop = true; // Hace que la música se repita
        musicaFondo.volume = 0.4; // Ajusta el volumen a un nivel bajo
    }
    
    // Intenta reproducir (manejo de errores de autoplay)
    musicaFondo.play().catch(error => {
        console.warn("Autoplay de música de fondo bloqueado. El usuario deberá interactuar primero.", error);
    });
}

/**
 * Controla la pausa y reanudación de la música.
 * @param {boolean} pausar - true para pausar, false para reanudar.
 */
function controlarMusicaFondo(pausar) {
    if (musicaFondo) {
        if (pausar) {
            musicaFondo.pause();
        } else {
            // Reanuda la música
            musicaFondo.play().catch(error => {
                console.warn("Error al reanudar la música.", error);
            });
        }
    }
}




// const MAPA_COMPLETO_NIVEL_1 = [ ... ] // El array que combina coordenadas y contenido.

// --- Variables de Estado Ficticias (Debes reemplazarlas con tus variables reales) ---
let puntuacionActual = 0;
let inventario = { helado: 0, arbol: 0, poncho: 0, canoa: 0, algodon: 0 };
let posicionJugador = 0; // La casilla actual del jugador.

// -------------------------------------------------------------
// --- Funciones del Core del Juego (Ficticias para el ejemplo) ---
// -------------------------------------------------------------

// Variable global 'turnoActual' (1-based index) ya existe.

export function actualizarPuntuacion(puntos) {
    // Usamos el turno actual (menos 1 para el índice 0-based) para obtener el jugador.
    const jugadorActual = jugadoresPartida[turnoActual - 1];

    if (jugadorActual) {
        // 1. Sumar los puntos al objeto real del jugador en la partida
        jugadorActual.puntos += puntos;

        console.log(`Puntuación de ${jugadorActual.nombre} actualizada: ${jugadorActual.puntos}`);

        // 2. 🔑 CLAVE: Actualizar la interfaz del scoreboard de la partida
        // (Asumo que esta función existe y debe ser llamada)
        renderizarScorePartida();

        // La variable 'puntuacionActual' que tenías puede eliminarse.
    }
}
// Variable global 'turnoActual' (1-based index) ya existe.

export function actualizarInventario(item, cantidad = 1) {
    const jugadorActual = jugadoresPartida[turnoActual - 1];
    if (!jugadorActual) return;

    const cedulaJugador = jugadorActual.cedula;

    // 1. Acceder al inventario global usando la cédula
    if (inventarioPartida[cedulaJugador]) {
        inventarioPartida[cedulaJugador][item] = (inventarioPartida[cedulaJugador][item] || 0) + cantidad;
    }

    console.log(`Inventario de ${jugadorActual.nombre} actualizado: ${cantidad} de ${item}.`);

    // 2. 🔑 CLAVE: Actualizar la interfaz del scoreboard
    renderizarScorePartida();
    // Además, si el jugador ve su inventario en otra pestaña, llama a:
    // renderizarRecompensas(cedulaJugador);
}
// Variable global 'turnoActual' ya existe.

// CÓDIGO CORREGIDO:
// FUNCIÓN 1: CORREGIDA
export function moverJugador(movimiento) {
    const jugadorActual = jugadoresPartida[turnoActual - 1];

    if (jugadorActual) {
        // 🔑 CLAVE: Actualizar la posición del objeto de jugador real.
        jugadorActual.posicion += movimiento;

        // Asegurar que la posición no baje de 0
        if (jugadorActual.posicion < 0) {
            jugadorActual.posicion = 0;
        }

        console.log(`Movimiento forzado. Nueva posición de ${jugadorActual.nombre}: ${jugadorActual.posicion}`);

        // Mover la ficha visualmente.
        moverFicha(jugadorActual.id, jugadorActual.posicion);
    }
}
// Variable global 'turnoActual' y 'botonDado' deben ser accesibles aquí.

// MODIFICACIÓN CLAVE: Esta función ahora SOLO oculta el modal y reinicia el dado.
// El avance de turno se gestiona en 'reanudarMovimiento' o 'animarMovimiento'.
// CÓDIGO CORREGIDO:
// FUNCIÓN 2: CORREGIDA
export function ocultarModal() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
controlarMusicaFondo(false);
    const botonDado = document.getElementById('boton-dado');

    // 1. Resetear el botón
    if (botonDado) {
        botonDado.disabled = false;
        botonDado.innerText = 'TIRAR DADO';
    }

    // 🏆 LÓGICA DE AVANCE DE TURNO (CRÍTICA) 🏆
    // Esto se ejecuta cuando el movimiento terminó completamente.
    turnoActual++;
    if (turnoActual > jugadoresPartida.length) {
        turnoActual = 1;
    }

    actualizarInterfazPartida();
}


// -------------------------------------------------------------
// --- FUNCIÓN PRINCIPAL PARA MOSTRAR EL MODAL ---
// -------------------------------------------------------------

/**
 * Muestra el modal con el contenido de la casilla actual.
 * @param {number} casillaIndex - El índice de la casilla en el mapa (0 a 41).
 */
export function mostrarModalCasilla(casillaIndex) {
    const casillaData = CONTENIDO_CASILLAS_POR_NIVEL[nivelSeleccionado][casillaIndex];
    if (!casillaData) return;

    const modal = document.getElementById('gameModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalImage = document.getElementById('modalImage');
    const optionsContainer = document.getElementById('modalOptionsContainer');
    const buttonsContainer = document.getElementById('modalButtons');
    // 🔑 CORRECCIÓN 1: Obtener la referencia al contenedor AR
    const arMessageContainer = document.getElementById('arMessageContainer');

    // 1. Limpiar el modal y prepararlo
    optionsContainer.innerHTML = '';
    buttonsContainer.innerHTML = '';
    modalImage.style.display = 'none';

    // 🔑 CORRECCIÓN 2: Limpiar el contenedor AR al inicio (CRÍTICO para que desaparezca en otras casillas)
    if (arMessageContainer) arMessageContainer.innerHTML = '';

    // 2. Lógica por Tipo de Casilla
    switch (casillaData.tipo) {

        case 'lugar_emblematico':
            // LUGAR EMBLEMÁTICO: Usa el título original.
            modalTitle.textContent = casillaData.titulo;
            modalDescription.innerHTML = casillaData.descripcion;

            if (casillaData.imagen) {
                modalImage.src = casillaData.imagen;
                modalImage.style.display = 'block';

                // 🏆 CLAVE 3: La variable arMessageContainer ya existe aquí
                if (arMessageContainer) {
                    arMessageContainer.innerHTML = `
                        <p class="mensaje-ar">¡Escanea la imagen para vivir una experiencia con realidad aumentada!</p>
                    `;
                }
            }
            // 1. Aplica la recompensa inmediatamente
            aplicarRecompensa(casillaData.recompensa);

            // 2. Inyectar el botón de reanudar
            const jugadorActual = jugadoresPartida[turnoActual - 1];
            buttonsContainer.innerHTML = `<button class="btn-imbabura" onclick="window.reanudarMovimiento(${jugadorActual.id})">¡Entendido!</button>`;
// ⭐ CLAVE: PAUSAR MÚSICA AQUÍ
            controlarMusicaFondo(true);
            break;
        case 'dato_curioso':
            // DATO CURIOSO: Título fijo y cierre automático (1.5s).
            modalTitle.textContent = '💡 Dato Curioso';
            modalDescription.innerHTML = casillaData.descripcion;

            aplicarRecompensa(casillaData.recompensa);

            // Cierre automático
            setTimeout(ocultarModal, 6000);
            break;

        case 'pregunta':
            // PREGUNTA: Título original, crea botones, cierre automático (1.5s) al contestar.
            modalTitle.textContent = casillaData.titulo; // Título original
            modalDescription.innerHTML = `<p>${casillaData.pregunta}</p>`;

            // 🔑 SOLUCIÓN: Crear Opciones de Respuesta en el contenedor correcto
            casillaData.opciones.forEach((opcion, index) => {
                const button = document.createElement('button');
                button.textContent = opcion;
                button.onclick = () => manejarRespuesta(casillaData, index);
                optionsContainer.appendChild(button);
            });

            // 🚨 CLAVE DE VISIBILIDAD: Asegurar que optionsContainer y modalButtons se muestren (si estaban ocultos)
            optionsContainer.style.display = 'flex'; // O 'block', según tu diseño

            break;

        case 'evento':
            // EVENTO: Título dinámico (Trampa/Buena Suerte) y cierre automático (1.5s).
            manejarEvento(casillaData, casillaIndex);
            break;

        case 'fin':
            // FINAL DEL JUEGO: Usa el título original.
            modalTitle.textContent = casillaData.titulo;
            modalDescription.innerHTML = casillaData.descripcion;
            buttonsContainer.innerHTML = '<button onclick="reiniciarJuego()">Volver al inicio</button>';
            break;

        default:
            // CASILLA SEGURA (Camino/Inicio): Usa el título original y cierre automático (1.0s).
            modalTitle.textContent = casillaData.titulo;
            modalDescription.innerHTML = casillaData.descripcion;

            // Cierre automático
            setTimeout(ocultarModal, 5000);
            break;
    }

    // 3. Mostrar el Modal (usando 'flex' para centrar)
    modal.style.display = 'flex';

}

// -------------------------------------------------------------
// --- Funciones de Lógica Específica ---
// -------------------------------------------------------------

export function aplicarRecompensa(recompensa) {
    if (!recompensa) return;

    if (recompensa.puntos) {
        actualizarPuntuacion(recompensa.puntos);
    }
    if (recompensa.item) {
        actualizarInventario(recompensa.item, 1);
    }
}

export function manejarRespuesta(preguntaData, respuestaSeleccionada) {
    const optionsContainer = document.getElementById('modalOptionsContainer');
    const modalDescription = document.getElementById('modalDescription');
    const botones = optionsContainer.querySelectorAll('button');

    // 1. Desactivar todos los botones inmediatamente
    optionsContainer.classList.add('respuesta-revelada');

    let resultado = {};
    let icono = "";
    let colorFeedback = "";
    const indiceCorrecto = preguntaData.respuestaCorrecta; // Obtenemos el índice correcto

    // Determinar si la respuesta es correcta
    if (respuestaSeleccionada === indiceCorrecto) {
        resultado = preguntaData.recompensa.correcta;
        actualizarPuntuacion(resultado.puntos);
        if (resultado.item) {
            actualizarInventario(resultado.item, 1);
        }

        // 🟢 Éxito
        icono = "✅ ¡Correcto!";
        colorFeedback = "#2E7D32";
        botones[respuestaSeleccionada].classList.add('opcion-correcta');

    } else {
        resultado = preguntaData.recompensa.incorrecta;
        actualizarPuntuacion(-resultado.puntosPerdidos); // Restar puntos

        // 🔴 Fracaso
        icono = "❌ ¡Incorrecto!";
        colorFeedback = "#D32F2F";

        // Aplica estilo de INCORRECTO al botón presionado por el usuario
        botones[respuestaSeleccionada].classList.add('opcion-incorrecta');

        // 🔑 CLAVE: Revela la respuesta correcta que el usuario NO eligió
        botones[indiceCorrecto].classList.add('respuesta-correcta-final');
    }

    // Mostrar el feedback
    modalDescription.innerHTML += `
        <hr style="margin-top: 15px;">
        <strong style="color: ${colorFeedback}; font-size: 1.1em;">${icono}</strong><br>
        <span style="font-style: italic;">${resultado.feedback}</span>
    `;

    // 🔑 CLAVE: Ocultar el contenedor de opciones para que solo quede el resultado
    optionsContainer.style.display = 'none';

    // Cierre automático después de 4 segundos
    setTimeout(ocultarModal, 4000);
}

// FUNCIÓN 3: CORREGIDA (Solo la parte de la comprobación del inventario)
export function manejarEvento(eventoData, casillaIndex) {
    const modal = document.getElementById('gameModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const buttonsContainer = document.getElementById('modalButtons');

    buttonsContainer.innerHTML = '';

    const jugadorActual = jugadoresPartida[turnoActual - 1];
    const cedulaJugador = jugadorActual ? jugadorActual.cedula : null;
    let textoFinal = "";
    let esTrampa = false;
    let esVentaja = false;

    // Lógica para eventos con condición de ítem (trampas que se anulan)
    if (eventoData.subtipo === 'trampa_item') {
        esTrampa = true; // Es trampa, aunque tenga éxito

        // 🔑 CLAVE CORREGIDA: Usar inventarioPartida con la cédula del jugador
        const tieneItem = inventarioPartida[cedulaJugador] && inventarioPartida[cedulaJugador][eventoData.condicionItem] > 0;

        if (tieneItem) {
            textoFinal = eventoData.text_success;
            // Actualizar inventario (perder ítem)
            actualizarInventario(eventoData.itemLost, -1);
        } else {
            textoFinal = eventoData.text_fail;
            if (eventoData.move_fail) {
                moverJugador(eventoData.move_fail); // Ahora esto funciona
            }
            if (eventoData.pointsLost_fail) {
                actualizarPuntuacion(-eventoData.pointsLost_fail);
            }
        }
    }
    // Lógica para eventos simples (trampa o ventaja de movimiento/puntos)
    else {
        textoFinal = eventoData.descripcion || eventoData.text;

        // Detectar si es Ventaja o Trampa
        if (eventoData.movimiento > 0 || eventoData.pointsGained > 0 || eventoData.subtipo === 'ventaja_recompensa' || eventoData.subtipo === 'ventaja_movimiento') {
            esVentaja = true;
        } else if (eventoData.movimiento < 0 || eventoData.pointsLost > 0 || eventoData.subtipo === 'trampa_movimiento' || eventoData.subtipo === 'trampa_puntos') {
            esTrampa = true;
        }

        // Ejecutar las consecuencias
        if (eventoData.movimiento) {
            moverJugador(eventoData.movimiento); // Ahora esto funciona
        }
        if (eventoData.pointsGained) {
            actualizarPuntuacion(eventoData.pointsGained);
            if (eventoData.rewardId) {
                actualizarInventario(eventoData.rewardId, 1);
            }
        }
        if (eventoData.pointsLost) {
            actualizarPuntuacion(-eventoData.pointsLost);
        }
    }

    // 1. 🏆 ASIGNACIÓN DEL TÍTULO FINAL
    if (esVentaja) {
        modalTitle.textContent = '🍀 Buena Suerte';
    } else if (esTrampa) {
        modalTitle.textContent = '🛑 Trampa';
    } else {
        modalTitle.textContent = '¡Evento!';
    }

    // 2. Mostrar el mensaje de la trampa/ventaja
    modalDescription.innerHTML = `<strong>¡Atención!</strong><br>${textoFinal}`;

    // 3. Cierre automático después de 1.5 segundos
    setTimeout(ocultarModal, 6000);
}
// ------------------------------------------------------------

// Añade esta nueva función a tu script
// Variable global 'nivelSeleccionado' ya existe
// Asegúrate de que 'db' esté correctamente importado de "./firebase.js"
export async function guardarPuntosFinales() {
    const nivelCompletado = nivelSeleccionado;

    // Solo aplicaremos la lógica de sobrescritura si estamos en el Nivel 1
    if (nivelCompletado !== 1) {
        mostrarToast("⚠️ Advertencia: La función de sobrescritura solo aplica para el Nivel 1.");
        // Si no es Nivel 1, usamos la lógica de comparación original
        // o simplemente no guardamos (depende de tu necesidad para Nivel 2, 3 y 4)
        // Por simplicidad, aquí se detiene si no es Nivel 1.
        return;
    }

    for (const jugador of jugadoresPartida) {
        const cedulaJugador = jugador.cedula;
        const puntosNivelActual = jugador.puntos; // Puntuación de la partida actual
        const docRef = doc(db, "registros", cedulaJugador);

        try {
            // 1. OBTENER el documento actual para no sobrescribir otros campos
            const docSnap = await getDoc(docRef);
            let datosExistentes = docSnap.exists() ? docSnap.data() : {};

            // Inicializar el objeto si no existe
            let estadoNiveles = datosExistentes.estado_niveles || {
                nivel_1: { score: 0, completado: false },
                nivel_2: { score: 0, completado: false },
                nivel_3: { score: 0, completado: false },
                nivel_4: { score: 0, completado: false }
            };

            // ----------------------------------------------------
            // 🏆 LÓGICA DE SOBRESCRITURA DE SCORE DEL NIVEL 1 🏆
            // ----------------------------------------------------
            const nivelKey = `nivel_${nivelCompletado}`;

            // 2. 🚨 CLAVE: Reemplazar directamente el score sin comparación.
            estadoNiveles[nivelKey] = {
                score: puntosNivelActual,
                completado: true // Marcar como completado
            };

            // ----------------------------------------------------
            // 🏁 LÓGICA DE RECALCULAR EL PUNTAJE TOTAL 🏁
            // ----------------------------------------------------

            let nuevaPuntuacionTotal = 0;

            // 3. Recalcular la puntuación total sumando el score guardado de CADA nivel
            for (let i = 1; i <= 4; i++) {
                const key = `nivel_${i}`;
                // Suma el score (el recién sobrescrito o el que ya existía).
                nuevaPuntuacionTotal += estadoNiveles[key]?.score || 0;
            }

            // 4. Construir el objeto para guardar
            let datosActualizar = {
                // A. Guardar el score total recalculado
                puntuacion_total: nuevaPuntuacionTotal,

                // B. Actualiza el mapa anidado con el score del Nivel 1
                estado_niveles: estadoNiveles
            };

            // 5. GUARDAR: Usamos { merge: true }
            await setDoc(docRef, datosActualizar, { merge: true });

        } catch (error) {
            console.error(`Error al guardar la puntuación final para ${jugador.nombre}:`, error);
            mostrarToast(`❌ Error al guardar puntos para ${jugador.nombre} en la base de datos.`);
        }
    }

    mostrarToast("🎉 ¡La partida ha terminado! El puntaje del Nivel 1 ha sido sobrescrito.");
}

// --- FUNCIONES DE ANIMACIÓN Y CONTROL DE FLUJO ---

export function animarMovimiento(jugadorId, pasosPendientes, limiteFinalCasilla) {
    const jugadorActual = jugadoresPartida.find(j => j.id === jugadorId);

    // Condición de PARADA: usa el parámetro limiteFinalCasilla
    if (pasosPendientes <= 0 || jugadorActual.posicion >= limiteFinalCasilla) {

        // Lógica de Fin de Nivel: usa el parámetro limiteFinalCasilla
        if (jugadorActual.posicion >= limiteFinalCasilla) {
            jugadorActual.posicion = limiteFinalCasilla;
            moverFicha(jugadorId, limiteFinalCasilla);
            guardarPuntosFinales();

            terminarPartida();
            return;
        }

        // Acceso escalable al contenido
        const casillaFinal = CONTENIDO_CASILLAS_POR_NIVEL[nivelSeleccionado][jugadorActual.posicion];

        if (casillaFinal && casillaFinal.tipo !== 'camino') {
            mostrarModalCasilla(jugadorActual.posicion);
        } else {
            ocultarModal();
        }
        return;
    }

    // Lógica de un solo paso
    const nuevaPosicion = jugadorActual.posicion + 1;

    // Se usa el parámetro limiteFinalCasilla
    const posicionAMover = Math.min(nuevaPosicion, limiteFinalCasilla);

    moverFicha(jugadorId, posicionAMover);
    jugadorActual.posicion = posicionAMover;

    // Verificar parada obligatoria (usa acceso escalable)
    const casillaActual = CONTENIDO_CASILLAS_POR_NIVEL[nivelSeleccionado][posicionAMover];

    if (casillaActual && casillaActual.tipo === 'lugar_emblematico') {
        jugadorActual.pasosPendientes = pasosPendientes - 1;
        mostrarModalCasilla(posicionAMover);
        return;
    }

    // Continuar la recursión
    setTimeout(() => {
        animarMovimiento(jugadorId, pasosPendientes - 1, limiteFinalCasilla);
    }, 500);
}

/**
 * Se llama desde el modal de parada obligatoria para continuar la animación.
 * @param {string} jugadorId - ID del jugador actual.
 */
// Esta función debe ejecutarse cuando se presiona el botón "¡Entendido!"
export function reanudarMovimiento(jugadorId) {
    const jugadorActual = jugadoresPartida.find(j => j.id === jugadorId);

    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
controlarMusicaFondo(false);
    const botonDado = document.getElementById('boton-dado');

    // Comprobar si quedan pasos por recorrer
    if (jugadorActual && jugadorActual.pasosPendientes > 0) {

        const pasosRestantes = jugadorActual.pasosPendientes;
        jugadorActual.pasosPendientes = 0;

        // Reanudar la animación con los pasos restantes
        // 🔑 USAMOS EL LÍMITE GLOBAL ALMACENADO: limiteCasillasActual
        animarMovimiento(
            jugadorId,
            pasosRestantes,
            limiteCasillasActual
        );

    } else {
        // No hay más pasos, se terminó el movimiento. AVANZAR TURNO.
        if (botonDado) {
            botonDado.disabled = false;
            botonDado.innerText = 'TIRAR DADO';
        }

        turnoActual++;
        if (turnoActual > jugadoresPartida.length) {
            turnoActual = 1;
        }

        actualizarInterfazPartida();
    }
}

//----------------------------------------------------------------------------------
// --- CONSTANTES NECESARIAS PARA EL FIN DEL JUEGO ---
// ⚠️ IMPORTANTE: REEMPLAZA ESTAS RUTAS CON LAS RUTAS REALES DE TU GIF Y VIDEO
const URL_GIF_VICTORIA = "assets/video/gif_finpartida.gif";
const URL_VIDEO_FINAL = "assets/video/final_juego.mp4";
const TIEMPO_GIF_MS = 2500; // Tiempo que el GIF estará visible (2.5 segundos)


/**
 * Gestiona el fin de la partida, la secuencia visual (GIF, Video) 
 * y el anuncio del ganador y puntuaciones.
 */
// Asegúrate de que la función exista en este archivo o esté importada
// function controlarMusicaFondo(pausar) { ... } 

function terminarPartida() {
    
    // ⭐ CLAVE: DETENER EL AUDIO DE FONDO INMEDIATAMENTE
    controlarMusicaFondo(true);
    // ---------------------------------------------------

    // 1. Ocultar la interfaz de juego activa (mapa y controles)
    document.getElementById('contenedor-mapa').style.display = 'none';

    // Oculta el panel de registro/selección de personajes si estuviera visible
    document.getElementById('pantalla-registro').style.display = 'none';
    document.getElementById('pantalla-personaje').style.display = 'none';

    // Referencias a los elementos de la pantalla final
    const pantallaFin = document.getElementById('pantalla-fin-partida');
    const gifVictoria = document.getElementById('gif-victoria');
    const videoFinal = document.getElementById('video-final');
    const scoreContainer = document.getElementById('score-final-container');
    const tituloGanador = document.getElementById('titulo-ganador');
    const resumenScores = document.getElementById('resumen-puntuaciones');

    // 2. Mostrar la pantalla de fin (Ahora dentro del panel central)
    pantallaFin.style.display = 'flex';
    pantallaFin.style.flexDirection = 'column';

    // A. Mostrar GIF de Victoria
    gifVictoria.src = URL_GIF_VICTORIA;
    gifVictoria.style.display = 'block';

    // B. Pausa y luego Video
    setTimeout(() => {
        gifVictoria.style.display = 'none'; // Ocultar GIF

        // Cargar y mostrar Video
        videoFinal.src = URL_VIDEO_FINAL;
        videoFinal.style.display = 'block';
        videoFinal.play();

        // C. Esperar a que el video termine para mostrar el score
        videoFinal.onended = () => {
            videoFinal.style.display = 'none'; // Ocultar Video

            // --- CÁLCULO DEL GANADOR Y SCORE ---

            // 1. Encontrar al jugador con la máxima puntuación
            const maxPuntuacion = Math.max(...jugadoresPartida.map(j => j.puntos));
            const ganadores = jugadoresPartida.filter(j => j.puntos === maxPuntuacion);

            // 2. Mostrar Título y Puntuaciones
            if (ganadores.length === 1) {
                tituloGanador.innerHTML = `🏆 ¡El ganador es <span style="color: #FFD700;">${ganadores[0].nombre}</span> con ${maxPuntuacion} puntos! 🎉`;
            } else if (ganadores.length > 1) {
                const nombresGanadores = ganadores.map(g => g.nombre).join(' y ');
                tituloGanador.innerHTML = `🤝 ¡Es un empate! Ganadores: <span style="color: #FFD700;">${nombresGanadores}</span> con ${maxPuntuacion} puntos. 🎉`;
            } else {
                tituloGanador.innerText = '¡Partida Terminada! No se pudo determinar el ganador.';
            }

            // 3. Generar la lista de puntuaciones ordenadas
            let scoresHTML = '<h2>Puntuaciones Finales:</h2><ul style="list-style: none; padding: 0;">';

            jugadoresPartida.forEach(jugador => {
                const isWinner = jugador.puntos === maxPuntuacion;
                const itemStyle = isWinner ? 'color: #FFD700; font-weight: bold; font-size: 1.1em;' : 'color: white; font-weight: normal;';

                scoresHTML += `
                    <li style="margin: 8px 0; ${itemStyle}">
                        <strong>${jugador.nombre}:</strong> ${jugador.puntos} puntos
                    </li>
                `;
            });
            scoresHTML += '</ul>';

            resumenScores.innerHTML = scoresHTML;
            scoreContainer.style.display = 'block';
        };

    }, TIEMPO_GIF_MS);
}