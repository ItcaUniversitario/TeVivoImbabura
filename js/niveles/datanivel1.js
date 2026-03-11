// js/niveles/datanivel1.js
import { TIPOS_CASILLA, ITEMS } from '../constants.js';
// 1. DEFINICIÓN DE COORDENADAS (Debe estar declarada antes del export)
const COORDENADAS = [
    { left: 49.44, top: 58.46 },
    { left: 53.16, top: 61.51 },
    { left: 55.98, top: 65.23 },
    { left: 58.81, top: 67.26 },
    { left: 61.25, top: 69.46 },
    { left: 64.07, top: 72.17 },
    { left: 66.89, top: 74.88 },
    { left: 69.97, top: 77.08 },
    { left: 73.57, top: 79.79 },
    { left: 72.29, top: 84.35 },
    { left: 69.33, top: 86.22 },
    { left: 66.00, top: 88.42 },
    { left: 62.53, top: 90.62 },
    { left: 58.94, top: 91.97 },
    { left: 55.60, top: 92.82 },
    { left: 52.26, top: 93.66 },
    { left: 48.28, top: 94.00 },
    { left: 44.30, top: 93.15 },
    { left: 40.19, top: 92.31 },
    { left: 37.50, top: 89.60 },
    { left: 34.67, top: 86.55 },
    { left: 31.46, top: 83.85 },
    { left: 27.49, top: 83.51 },
    { left: 23.76, top: 80.97 },
    { left: 23.76, top: 75.89 },
    { left: 27.61, top: 73.35 },
    { left: 31.46, top: 72.00 },
    { left: 34.67, top: 69.29 },
    { left: 36.09, top: 65.91 },
    { left: 35.32, top: 60.49 },
    { left: 33.65, top: 55.42 },
    { left: 32.11, top: 51.19 },
    { left: 30.95, top: 46.95 },
    { left: 31.72, top: 41.88 },
    { left: 34.67, top: 38.66 },
    { left: 37.37, top: 35.62 },
    { left: 38.65, top: 30.71 },
    { left: 38.78, top: 25.12 },
    { left: 38.27, top: 20.72 },
    { left: 36.09, top: 15.82 },
    { left: 34.16, top: 10.40 },
    { left: 33.13, top: 4.99 },
];
// 2. DEFINICIÓN DE CASILLAS (Debe estar declarada antes del export)
const CASILLAS = [
    // CASILLA 8
    {
        tipo: 'inicio', // Ojo: Asegúrate que el tipo sea 'inicio'
        titulo: '🚩 BIENVENIDO A ESTA AVENTURA: Esencia del Norte',
        descripcion: '¡Bienvenidos a Imbabura! Prepárense para la aventura.',
        // 🔥 AQUÍ AGREGAS LA RUTA DEL VIDEO
        video: 'assets/video/inicio_nivel1.mp4'
    },
     // CASILLA 1
    {
        tipo: 'lugar_emblematico',
        titulo: 'HELADOS DE PAILA',
        imagen: 'assets/imagenes/lugares/nivel1/helados_paila.png',

        item: 'helado'
    },
     // CASILLA 2
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    }, 
     // CASILLA 3
     {
        tipo: 'dato_curioso',
        titulo: 'Dato Curioso: Helados',
        descripcion: 'Uno de los acompañantes más frecuentes en el consumo de los helados de paila es la quesadilla.'
    },
     // CASILLA 4
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Helados de Paila',
        pregunta: '¿Cuál es el nombre de la promotora de los helados de paila más reconocida?',
        opciones: ['María Chuga', 'Rosalía Suárez', 'Anita Benavides'],
        respuestaCorrecta: 1,
        recompensa: {
            correcta: {

                feedback: "¡Correcto! Rosalía Suárez es la pionera de esta tradición en Ibarra."
            },
            incorrecta: {

                feedback: "Incorrecto. La promotora histórica más famosa es Rosalía Suárez."
            }
        }
    },
     // CASILLA 5
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Curioso: Economía',
        descripcion: 'La producción y comercialización de helados dinamiza la agricultura y la economía locales.'
    },
     // CASILLA 6
    { tipo: 'evento', subtipo: 'trampa_item', titulo: 'Trampa del Antojo', condicionItem: 'helado', text_fail: '¡Se te antoja un helado! Te distraes pensando en volver a la paila. Retrocedes 1 casilla.', move_fail: -1, text_success: '¡Oh no! Por la emoción del viaje, se te cae el helado que traías. Pierdes 1 Helado, pero por suerte no retrocedes.', itemLost: 'helado', move_success: 0 },

    // CASILLA 7

    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Instrumentos',
        pregunta: '¿Cuál es el instrumento más característico en la elaboración de los helados de paila?',
        opciones: ['Paila de cobre', 'Banca de madera', 'Congelador'],
        respuestaCorrecta: 0,
        recompensa: {
            correcta: {

                feedback: "¡Correcto! La paila de cobre es esencial para la textura única."
            },
            incorrecta: {

                feedback: "Incorrecto. El instrumento clave y tradicional es la paila de cobre."
            }
        }
    },
     // CASILLA 8
    {
        tipo: 'lugar_emblematico',
        titulo: 'MIRADOR DE ANGOCHAGUA',
        imagen: 'assets/imagenes/lugares/nivel1/mirador_muchanajurumi.png',

        item: 'arbol'
    },
     // CASILLA 0
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Curioso: Mucha Naju Rumi',
        descripcion: 'El mirador Mucha Naju Rumi está a una altitud de 2880 msnm.'
    },
     // CASILLA 10
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    },
     // CASILLA 11
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Idioma',
        pregunta: '¿En qué lengua está escrito Mucha Naju Rumi?',
        opciones: ['Inglés', 'Shuar', 'Kichwa'],
        respuestaCorrecta: 2,
        recompensa: {
            correcta: {

                feedback: "¡Correcto! Está escrito en lengua Kichwa."
            },
            incorrecta: {

                feedback: "Incorrecto. La lengua originaria es el Kichwa."
            }
        }
    },
     // CASILLA 12
    {
        tipo: 'evento',
        subtipo: 'trampa_puntos',
        titulo: 'Neblina Desorientadora',
        descripcion: 'Una densa neblina cubre el mirador y te desorientas. Pierdes 30 puntos.',
        pointsLost: 30
    },
     // CASILLA 13
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    },
     // CASILLA 14
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Curioso: Volcanes',
        descripcion: 'Desde este mirador se pueden apreciar varios volcanes, tales como: Taita Imbabura, Cubilche, Cuzín.'
    },
     // CASILLA 15
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Traducción',
        pregunta: '¿Conoces la traducción de Mucha Naju Rumi al español?',
        opciones: ['Lugar donde se besan las rocas', 'Lugar donde se rompen las rocas', 'Lugar donde brincan las rocas'],
        respuestaCorrecta: 0,
        recompensa: {
            correcta: {

                feedback: "¡Excelente! Significa 'Lugar donde se besan las rocas'."
            },
            incorrecta: {

                feedback: "Incorrecto. La traducción correcta es 'Lugar donde se besan las rocas'."
            }
        }
    },
     // CASILLA 16
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Curioso: Flora',
        descripcion: 'En el trayecto al mirador se pueden observar una variedad de plantas y árboles como: achupallas, alisos, eucaliptos.'
    },
     // CASILLA 17
    {
        tipo: 'evento',
        subtipo: 'ventaja_movimiento',
        titulo: 'Energía de Chachimbiro',
        descripcion: 'Te sumerges en las aguas termales de Chachimbiro. ¡Sales renovado y con fuerzas para correr!',
        movimiento: 6
    },
     // CASILLA 18
    {
        tipo: 'lugar_emblematico',
        titulo: 'PLAZA DE PONCHOS',
        imagen: 'assets/imagenes/lugares/nivel1/plaza_deponchos.png',

        item: 'poncho'
    },
     // CASILLA 19
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    },
    // CASILLA 20
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Cultural',
        descripcion: 'Alrededor de la plaza de ponchos se pueden encontrar espacios culturales para vivir las costumbres y tradiciones locales.'
    },
    // CASILLA 21
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Fama',
        pregunta: '¿La plaza de ponchos de Otavalo es una de las ferias artesanales más grandes de América Latina?',
        opciones: ['Sí', 'No'],
        respuestaCorrecta: 0,
        recompensa: {
            correcta: {

                feedback: "¡Así es! Es famosa y reconocida en todo el continente."
            },
            incorrecta: {

                feedback: "Incorrecto. De hecho, es considerada una de las más grandes y famosas."
            }
        }
    },
    // CASILLA 22
    {
        tipo: 'dato_curioso',
        titulo: 'Dato de Artesanía',
        descripcion: "Además de textiles, en la plaza puedes encontrar figuras talladas en 'tagua', una semilla tan dura que se la conoce como 'marfil vegetal'."
    },
    // CASILLA 23
    {
        tipo: 'lugar_emblematico',
        titulo: 'LAGUNA DE CUICOCHA',
        imagen: 'assets/imagenes/lugares/nivel1/lago_cuicocha.png',

        item: 'canoa'
    },
    // CASILLA 24
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    },
    // CASILLA 25
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Cultural: Chacana',
        descripcion: 'En la Ruta Sagrada se pueden encontrar simbolismos de los pueblos originarios como la Chacana y el calendario lunar.'
    },
    // CASILLA 26
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Domo',
        pregunta: 'El domo interior más grande del lago Cuicocha, se llama:',
        opciones: ['Yaguarcocha', 'Cuicocha', 'Teodoro Wolf'],
        respuestaCorrecta: 2,
        recompensa: {
            correcta: {

                feedback: "¡Correcto! Se llama Teodoro Wolf."
            },
            incorrecta: {

                feedback: "Incorrecto. El domo más grande es el Teodoro Wolf."
            }
        }
    },
    // CASILLA 27
    { tipo: 'evento', subtipo: 'trampa_item', titulo: 'El Viento de la Laguna', condicionItem: 'poncho', text_fail: '¡El viento helado de la laguna te golpea! No tienes poncho para abrigarte y el soroche te marea. Pierdes 15 puntos.', pointsLost_fail: 15, text_success: '¡El viento helado de la laguna te golpea! Por suerte, usas tu poncho para abrigarte. ¡Te salvas de perder puntos, pero pierdes 1 Poncho!', itemLost: 'poncho', pointsLost_success: 0 },
    // CASILLA 28
    {
        tipo: 'lugar_emblematico',
        titulo: 'FÁBRICA IMBABURA',
        imagen: 'assets/imagenes/lugares/nivel1/fabrica_imbabura.png',

        item: 'algodon'
    },
    // CASILLA 29
    { tipo: 'evento', subtipo: 'ventaja_recompensa', titulo: 'Muestra de Algodón', descripcion: 'Llegas a la FÁBRICA IMBABURA, un lugar lleno de historia. ¡Ganas 30 puntos y una muestra de Algodón!', recompensa: { puntos: 30, item: 'algodon' } },
     // CASILLA 30
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Producción',
        pregunta: '¿Sabes qué tipo de telas se producían especialmente en la Fábrica Imbabura?',
        opciones: ['Telas de poliester', 'Telas de algodón', 'Telas de poliester y algodón'],
        respuestaCorrecta: 1,
        recompensa: {
            correcta: {

                feedback: "¡Correcto! Eran especialistas en telas de algodón."
            },
            incorrecta: {

                feedback: "Incorrecto. La producción principal era de telas de algodón."
            }
        }
    },
     // CASILLA 31
    { tipo: 'evento', subtipo: 'trampa_item', titulo: 'Peligro de Maquinaria', condicionItem: 'algodon', text_fail: '¡Qué descuido! Te acercas demasiado a la maquinaria. Te llevas un susto y te obligan a retroceder 2 casillas.', move_fail: -2, text_success: '¡Por un descuido, una de las máquinas engancha tu materia prima! Logras rescatarla, pero pierdes 1 Algodón en el proceso.', itemLost: 'algodon', move_success: 0 },
     // CASILLA 32
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Histórico: Fundación',
        descripcion: 'La fecha de fundación de la Fábrica Imbabura es 1924.'
    },
     // CASILLA 33
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Cantón',
        pregunta: '¿En qué cantón está localizada la Fábrica Imbabura?',
        opciones: ['Otavalo', 'Cotacachi', 'Antonio Ante'],
        respuestaCorrecta: 2,
        recompensa: {
            correcta: {

                feedback: "¡Exacto! Se encuentra en el cantón Antonio Ante."
            },
            incorrecta: {

                feedback: "Incorrecto. La fábrica está localizada en el cantón Antonio Ante."
            }
        }
    },
     // CASILLA 34
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Histórico: Dinamización',
        descripcion: 'Fábrica Imbabura, en su época de apogeo dinamizó la producción agrícola de algodón de los valles de Salinas y el Chota.'
    },
     // CASILLA 35
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    },
     // CASILLA 36
    {
        tipo: 'lugar_emblematico',
        titulo: 'MONTAÑA DE LUZ',
        imagen: 'assets/imagenes/lugares/nivel1/montaña_deluz.png',

        item: 'arbol'
    },
     // CASILLA 37
    {
        tipo: 'casilla_vacia',
        titulo: 'Camino despejado'
    },
     // CASILLA 38
    {
        tipo: 'pregunta',
        titulo: 'Pregunta: Historia Local',
        pregunta: '¿Cuál era el nombre original de la parroquia Pablo Arenas?',
        opciones: ['Cruzcacho', 'Angochagua', 'San Pablo'],
        respuestaCorrecta: 0,
        recompensa: {
            correcta: {

                feedback: "¡Correcto! El nombre original era Cruzcacho."
            },
            incorrecta: {

                feedback: "Incorrecto. La respuesta correcta es Cruzcacho."
            }
        }
    },
     // CASILLA 39
    { tipo: 'evento', subtipo: 'trampa_puntos', titulo: 'Distracción en el Geoparque', descripcion: "¡El paisaje desde la 'Montaña de Luz' es espectacular! Te distraes tanto admirando el Geoparque que se te hace tarde. Pierdes 30 puntos.", pointsLost: 30 },
    // CASILLA 40
    {
        tipo: 'dato_curioso',
        titulo: 'Dato Curioso: Productos Orgánicos',
        descripcion: 'En Montaña de Luz se ofrecen servicios de alimentación preparados con productos orgánicos, cultivados en el mismo lugar.'
    },
     // CASILLA 41
    {
        tipo: 'fin',
        titulo: '¡Meta Alcanzada!',
        descripcion: 'Has completado la ruta.',
        // 👇 ESTO ES LO QUE HACE QUE GANE (1000 Puntos)
        recompensa: {
            puntos: 500,
            item: null
        }
    }
];


const PREGUNTAS = [

    {
        id: 1,
        pregunta: "¿Quién fue la promotora de los helados de paila más reconocida en Ibarra?",
        opciones: ['María Chuga', 'Rosalía Suárez', 'Anita Benavides', 'Tránsito Amaguaña'],
        correcta: 1 // Rosalía Suárez
    },
    {
        id: 2,
        pregunta: "¿Cuál es el instrumento más característico en la elaboración de los helados de paila?",
        opciones: ['Paila de cobre', 'Banca de madera', 'Congelador eléctrico', 'Olla de barro'],
        correcta: 0 // Paila de cobre
    },
    {
        id: 3,
        pregunta: "¿Cómo se define el proceso de producción de los tradicionales helados de paila?",
        opciones: ['Artesanal', 'Químico y artificial', 'Experimental', 'Industrial y masivo'],
        correcta: 0 // Artesanal
    },
    {
        id: 4,
        pregunta: "¿En qué ciudad ecuatoriana nació la famosa tradición de los helados de paila?",
        opciones: ['Cuenca', 'Guayaquil', 'Ibarra', 'Quito'],
        correcta: 2 // Ibarra
    },
    {
        id: 5,
        pregunta: "¿Cuál es la base principal para dar sabor a los helados de paila artesanales?",
        opciones: ['Esencias artificiales', 'Variedad de frutas naturales', 'Vegetales seleccionados', 'Frutos secos'],
        correcta: 1 // Variedad de frutas naturales
    },

    //MIRADOR MUCHA NAJU RUMI

    {
        id: 6,
        pregunta: "¿En qué parroquia rural del cantón Ibarra se encuentra ubicado el mirador Muchanaju Rumi?",
        opciones: ['Angochagua', 'San Antonio', 'La Esperanza', 'Salinas'],
        correcta: 0 // Angochagua
    },
    {
        id: 7,
        pregunta: "¿Cuál es el significado al español del nombre kichwa 'Muchanaju Rumi'?",
        opciones: ['Rocas que caen', 'Lugar donde se besan las rocas', 'Montaña de cristal', 'Río de piedras'],
        correcta: 1 // Lugar donde se besan las rocas
    },
    {
        id: 8,
        pregunta: "¿En qué idioma está nombrado el atractivo turístico conocido como Muchanaju Rumi?",
        opciones: ['Español', 'Awa Pit', 'Kichwa', 'Shuar Chicham'],
        correcta: 2 // Kichwa
    },
    {
        id: 9,
        pregunta: "¿Qué tipo de formación geográfica es el Muchanaju Rumi en la zona de Angochagua?",
        opciones: ['Una laguna volcánica', 'Un mirador natural', 'Una cascada escondida', 'Un valle profundo'],
        correcta: 1 // Un mirador natural
    },
    {
        id: 10,
        pregunta: "Si visitas el 'Lugar donde se besan las rocas' en Imbabura, ¿a qué sitio te refieres?",
        opciones: ['Muchanaju Rumi', 'Cascada de Peguche', 'Lechero de Otavalo', 'Arbolito de Ibarra'],
        correcta: 0 // Muchanaju Rumi
    },

    // --- PLAZA DE PONCHOS ---
    {
        id: 11,
        pregunta: "¿En qué ciudad se ubica la Plaza de Ponchos?",
        opciones: ['Ibarra', 'Otavalo', 'Cotacachi', 'Atuntaqui'],
        correcta: 1
    },
    {
        id: 12,
        pregunta: "¿Qué bebida tradicional se disfruta en la Plaza de Ponchos?",
        opciones: ['Horchata', 'Chicha del Yamor', 'Colada Morada', 'Morocho'],
        correcta: 1
    },
    {
        id: 13,
        pregunta: "¿Por qué es famosa la Plaza de Ponchos?",
        opciones: ['Feria tecnológica', 'Feria artesanal', 'Mercado de flores', 'Centro moderno'],
        correcta: 1
    },
    // LAGUNA CUICOCHA
    {
        id: 14,
        pregunta: "El domo interior más grande del lago Cuicocha se llama:",
        opciones: ['Yaguarcocha', 'Isla Yerovi', 'Teodoro Wolf', 'Cotacachi'],
        correcta: 2 // Teodoro Wolf
    },
    {
        id: 15,
        pregunta: "¿Qué estructura geológica se formó tras la erupción del volcán Cotacachi?",
        opciones: ['Un valle seco', 'Una caldera volcánica', 'Un río de lava', 'Una montaña de arena'],
        correcta: 1 // Una caldera volcánica
    },
    {
        id: 16,
        pregunta: "¿Cómo se llama el sendero que rodea la Laguna de Cuicocha?",
        opciones: ['Ruta Sagrada', 'Sendero del Cóndor', 'Camino del Inca', 'Ruta de las Flores'],
        correcta: 0 // Ruta Sagrada
    },

    //FABRICA IMBABURA

    {
        id: 17,
        pregunta: "¿Cómo se llama el complejo histórico ubicado en Antonio Ante?",
        opciones: ['Fábrica Imbabura', 'Fábrica Ibarra', 'Fábrica Otavalo', 'Fábrica Cotacachi'],
        correcta: 0 // Fábrica Imbabura
    },
    {
        id: 18,
        pregunta: "¿En qué cantón se localiza la Fábrica Imbabura?",
        opciones: ['Ibarra', 'Otavalo', 'Antonio Ante', 'Cotacachi'],
        correcta: 2 // Antonio Ante
    },
    {
        id: 19,
        pregunta: "¿Qué se producía originalmente en la Fábrica Imbabura?",
        opciones: ['Zapatos de cuero', 'Telas de algodón y lana', 'Muebles de madera', 'Artesanías de barro'],
        correcta: 1 // Telas de algodón y lana
    },
    {
        id: 20,
        pregunta: "¿Qué funciona hoy en día en las instalaciones de la Fábrica?",
        opciones: ['Un hospital', 'Un mercado', 'Un centro cultural y museo', 'Una escuela'],
        correcta: 2 // Un centro cultural y museo
    },
    {
        id: 21,
        pregunta: "¿De qué material eran las telas que se fabricaban principalmente?",
        opciones: ['Seda', 'Sintético', 'Algodón y lana', 'Lino'],
        correcta: 2 // Algodón y lana
    },

    //MONTAÑA DE LUZ 
    {
        id: 22,
        pregunta: "¿En qué parroquia rural se localiza el mirador natural **Montaña de Luz**?",
        opciones: ['Pablo Arenas', 'Salinas', 'Cahuasquí', 'Lita'],
        correcta: 0 // Pablo Arenas
    },
    {
        id: 23,
        pregunta: "¿Cuál era el nombre original de la parroquia donde se encuentra la **Montaña de Luz**?",
        opciones: ['Cruzcacho', 'Angochagua', 'Pimampiro', 'Urcuquí'],
        correcta: 0 // Cruzcacho
    },
    {
        id: 24,
        pregunta: "¿Qué reconocimiento de la UNESCO tiene la provincia donde se ubica el mirador **Montaña de Luz**?",
        opciones: [
            'Patrimonio de la Humanidad',
            'Geoparque Mundial',
            'Reserva de la Biósfera',
            'Maravilla del Mundo'
        ],
        correcta: 1 // Geoparque Mundial
    },
    {
        id: 25,
        pregunta: "¿Cómo se define geográficamente al sitio conocido como **Montaña de Luz**?",
        opciones: ['Una laguna volcánica', 'Un mirador natural', 'Un centro cultural', 'Una cascada'],
        correcta: 1 // Un mirador natural
    }
]



// 2. CONFIGURACIÓN DE RECOMPENSAS
const RECOMPENSAS = [
    // NIVEL 1
    { key: 'helado', src: 'assets/imagenes/recompensas/helado.png', color: '#FFDCE0' },
    { key: 'arbol', src: 'assets/imagenes/recompensas/arbol.png', color: '#B2DFDB' },
    { key: 'poncho', src: 'assets/imagenes/recompensas/poncho.png', color: '#D7CCC8' },
    { key: 'canoa', src: 'assets/imagenes/recompensas/canoa.png', color: '#E3F2FD' },
    { key: 'algodon', src: 'assets/imagenes/recompensas/algodon.png', color: '#FAFAFA' },

]

// 6. VIDEOS POR NIVEL (INTRO Y FIN)
const VIDEOS = {
    intro: 'assets/video/nivel1/inicio_nivel1.mp4',
    fin: 'assets/video/nivel1/fin_nivel1.mp4'
};


// ==========================================
// EXPORTACIÓN UNIFICADA
// ==========================================
export const NIVEL_1_DATA = {
    coordenadas: COORDENADAS, // Asegúrate de que tu variable COORDENADAS exista arriba
    casillas: CASILLAS,       // Asegúrate de que tu variable CASILLAS exista arriba
    preguntas: PREGUNTAS,
    recompensas: RECOMPENSAS,
    videos: VIDEOS
};