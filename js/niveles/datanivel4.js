// js/niveles/datanivel2.js

// 1. COORDENADAS (Estas son de prueba, luego las ajustarás a tu mapa 2)
// Coordenadas Nivel 3 (Solo posiciones en %)
// 1. COORDENADAS (Estas son de prueba, luego las ajustarás a tu mapa 2)
const COORDENADAS = [

    { left: 59.79, top: 11.53 }, // 0: Salida
    { left: 62.33, top: 12.42 }, // 1
    { left: 64.29, top: 12.42 }, // 2
    { left: 66.47, top: 12.42 }, // 3
    { left: 68.66, top: 13.61 }, // 4: Hito 1 - Terraza de Cahuasquí
    { left: 70.51, top: 15.98 }, // 5
    { left: 71.77, top: 20.44 }, // 6: 
    { left: 83.18, top: 32.92 }, // 7
    { left: 85.48, top: 34.70 }, // 8
    { left: 86.98, top: 37.67 }, // 9 Hito 2 - Trueque o Cambeo
    { left: 88.13, top: 42.42 }, // 10
    { left: 89.75, top: 46.88 }, // 11: 
    { left: 91.13, top: 51.34 }, // 12
    { left: 92.74, top: 55.20 }, // 13 Hito 3 - Ruta del Vértigo
    { left: 91.47, top: 58.76 }, // 14
    { left: 89.29, top: 60.55 }, // 15: 
    { left: 87.21, top: 60.25 }, // 16: 
    { left: 73.50, top: 59.66 }, // 17
    { left: 71.66, top: 57.58 }, // 18
    { left: 69.47, top: 57.58 }, // 19  Hito 4 - Complejo Volcánico
    { left: 68.32, top: 62.63 }, // 20:
    { left: 67.74, top: 68.27 }, // 21
    { left: 66.47, top: 72.43 }, // 22
    { left: 64.06, top: 73.92 }, // 23 Hito 5 - Lago San Pablo
    { left: 62.10, top: 70.94 }, // 24: 
    { left: 60.60, top: 67.38 }, // 25
    { left: 59.68, top: 62.92 }, // 26
    { left: 58.29, top: 58.76 }, // 27
    { left: 56.45, top: 56.09 }, // 28: 
    { left: 20.05, top: 48.07 }, // 29
    { left: 18.32, top: 47.77 }, // 30
    { left: 16.47, top: 45.69 }, // 31:
    { left: 14.52, top: 43.61 }, // 32  Hito 6 - Gualimán
    { left: 12.21, top: 45.69 }, // 33
    { left: 10.14, top: 48.07 }, // 34
    { left: 8.41, top: 51.34 },  // 35
    { left: 5.99, top: 51.63 },  // 36: 
    { left: 3.57, top: 52.82 }   // 37: meta

];


const CASILLAS = // Contenido para el Nivel 2 (36 casillas en total)
    [
        // 0. INICIO (Solicitado)
        { tipo: 'inicio', titulo: 'Introcucción a: Rutas de Agua y Sabores', descripcion: 'Inicias el recorrido por los tesoros de la Ruta 3.' },
        // 1 DATO CURIOSO CARA DEL DIOS INTAG 
        {
            tipo: 'minijuego',
            subtipo: 'rompecabezas',
            recompensa_fija: 'terrazacahuasqui'
        },

        //2 DATO CURIOSO
        {
            tipo: 'dato_curioso',
            titulo: 'La Terraza Natural de Cahuasquí',
            descripcion: '¿Sabías que todo Cahuasquí está construido sobre una gigantesca terraza natural? ¡Es una joya geológica que revela los secretos de la formación de Imbabura!'
        },
        {
            tipo: 'casilla_vacia',
            titulo: 'Camino despejado'
        },

        // 4.  LUGAR EMBLEMATICO TERRAZA CAHUASQUI
        {
            tipo: 'lugar_emblematico',
            titulo: 'Terraza Cahuasquí',
            imagen: 'assets/imagenes/lugares/nivel4/terraza_cahuasqui.png',
            item: 'terrazacahuasqui'
        },

        // 5 TRAMPA
        // 5 TRAMPA: TORMENTA Y REFUGIO
        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '⛈️ ¡Tormenta Inesperada!',
            descripcion: 'El clima empeora de golpe. Tienes que volver al refugio para protegerte de la lluvia helada. ¡Retrocedes 1 casilla!',
            movimiento: -1
        },
        // 6 BOLETO DE PREN CON PREGUNTA  

       // CASILLA DE PARADA OBLIGATORIA (TREN DE LA LIBERTAD)
        {
            
            tipo: 'boleto_pregunta',
            titulo: 'Estación de Ibarra',
            destino: 'Cantón Pimampiro', // 🔥 Este texto es el que aparecerá en el Boleto VIP
            descripcion: '¡Has llegado a la estación del Tren de la Libertad! Responde correctamente la trivia para conseguir tu boleto y continuar tu viaje.',
                   },
        //  7 CAMINO LIBRE
        {
            tipo: 'casilla_vacia',
            titulo: 'Camino despejado'
        },

        // 8. ROMPECABEZAS 
        {
            tipo: 'minijuego',
            subtipo: 'rompecabezas',
            recompensa_fija: 'frutastrueque'
        },

        //9  LUGAR EMBLEMATICO  TRUEQUE PIMAMPIRO
        {
            tipo: 'lugar_emblematico',
            titulo: 'TRUEQUE DE PIMAMPIRO',
            imagen: 'assets/imagenes/lugares/nivel4/trueque_pimampiro.png',
            item: 'frutastrueque'
        },

        // 10 PREGUNTA ALEATORIA NORMAL  
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'pimampiro_trueque',
            titulo: '🤝 ¡Hora del Trueque!',
            descripcion: '¡Demuestra tu sabiduría! Participa en el intercambio ancestral de Pimampiro para poder continuar tu camino.',
        },
        //11  
       {
            tipo: 'evento',
            subtipo: 'ventaja_huacas',
            titulo: 'El Montículo Misterioso',
            descripcion: 'Te detienes frente a un inusual montículo de tierra a un lado del sendero. Recordando las leyendas de tesoros ancestrales en la zona, decides excavar un poco...'
        },

      // 12 TRAMPA DE TRUEQUE PIMAMPIRO
        { 
            tipo: 'evento', 
            subtipo: 'trampa_item', 
            titulo: '🤝 ¡Tiempo de Trueque!', 
            condicionItem: 'frutastrueque', 
            
            // Texto corto si falla (-1 casilla)
            text_fail: 'Sin frutas para participar, te quedas mirando maravillado y el tiempo vuela. Retrocedes 1 casilla.', 
            move_fail: -1, 
            
            // Texto corto si tiene éxito (0 casillas, pierde el ítem)
            text_success: '¡Buen trueque! Intercambias tus frutas en el mercado y aprovechas para tomar un merecido descanso aquí mismo.', 
            itemLost: 'frutastrueque', 
            move_success: 0 
        },
        //13 LUGAR EMBLEMATICO  RUTA DEL VÉRTIGO
        {
            tipo: 'lugar_emblematico',
            titulo: 'RUTA DEL VÉRTIGO',
            imagen: 'assets/imagenes/lugares/nivel4/ruta_vertigo.png',
            item: 'columpiovertigo'
        },
        //14 DATO CURIOSO
        {
            tipo: 'dato_curioso',
            titulo: '🎢 La Ruta del Vértigo',
            descripcion: '¡Vuela en canopies gigantes y columpios entre eucaliptos en Sigsipamba! Si miras hacia las quebradas, podrías avistar al majestuoso oso de anteojos.',
        },

       // 15 TRAMPA 
        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '🐻 ¡El Oso Guardián!',
            descripcion: '¡Un oso de anteojos bloquea el paso! Retrocedes 2 casillas en silencio para no molestarlo.',
            movimiento: -2
        },
        // 16 BOLETO CON PREGUNTA
        {
            
            tipo: 'boleto_pregunta',
            titulo: 'Estación de Ibarra',
            destino: 'Complejo Volcánico Imbabura', // 🔥 Este texto es el que aparecerá en el Boleto VIP
            descripcion: '¡Has llegado a la estación del Tren de la Libertad! Responde correctamente la trivia para conseguir tu boleto y continuar tu viaje.',
                   },
        // 17 PREGUNTA ALEATORIA 
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'ruta_del_vertigo',
            titulo: '🐻 Ojos de Guardián',
            descripcion: '¡Sobreviviste a la altura! Ahora demuestra qué lograste ver en las profundidades de las quebradas de Sigsipamba.',
        },
        // 18 
       {
            tipo: 'evento',
            subtipo: 'ventaja_huacas',
            titulo: 'El Montículo Misterioso',
            descripcion: 'Te detienes frente a un inusual montículo de tierra a un lado del sendero. Recordando las leyendas de tesoros ancestrales en la zona, decides excavar un poco...'
        },
        // 19  LUGAR EMBLEMATICO COMPLEJO VOLCANICO IMABABURA 
        {
            tipo: 'lugar_emblematico',
            titulo: 'Complejo Volcánico Imbabura',
            imagen: 'assets/imagenes/lugares/nivel4/complejo_volcanicoimbabura.png',
            item: 'complejovolcanico'
        },

        // 20 CASILLA ROMPECABEZAS
        {
            tipo: 'minijuego',
            subtipo: 'rompecabezas',

            recompensa_fija: 'lagosanpablo'
        },

        // 21 Dato curioso
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'volcan_imbabura',
            titulo: '🌋 La Huella del Taita',
            descripcion: '¡Has cruzado el complejo volcánico! Demuestra cuánto sabes sobre el volcán tutelar y su majestuoso paisaje.',
        },
        //22 TRAMPA 
       // 15 TRAMPA: EL CÓNDOR Y EL VOLCÁN
        { 
            tipo: 'evento', 
            subtipo: 'trampa_item', 
            titulo: '🦅 ¡El Guardián del Taita!', 
            condicionItem: 'complejovolcanico', 
            
            // Si NO tiene el ítem
            text_fail: 'Un Cóndor gigante bloquea el paso. Sin el Volcán Imbabura para el Taita, no puedes cruzar su territorio. Retrocedes 2 casillas.', 
            move_fail: -2, 
            
            // Si SÍ tiene el ítem
            text_success: '¡Ofrenda sagrada! Devuelves el Volcán Imbabura a su lugar. El Cóndor inclina su cabeza y te abre el camino.', 
            itemLost: 'complejovolcanico', 
            move_success: 0 
        },
        // 23 LUGAR EMBLEMATICO LAGO SAN PABLO
        {
            tipo: 'lugar_emblematico',
            titulo: 'Lago San Pablo',
            imagen: 'assets/imagenes/lugares/nivel4/lago_sanpablo.png',
            item: 'lagosanpablo'
        },

        // 24 
      {
            tipo: 'evento',
            subtipo: 'ventaja_huacas',
            titulo: 'El Montículo Misterioso',
            descripcion: 'Te detienes frente a un inusual montículo de tierra a un lado del sendero. Recordando las leyendas de tesoros ancestrales en la zona, decides excavar un poco...'
        },
        //25 PREGUNTA ALEATORIA  
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'lago_sanpablo',
            titulo: '💧 El Espejo de Agua',
            descripcion: 'Has dejado las orillas del San Pablo. ¡Demuestra que conoces los secretos y la importancia de este lago sagrado!',
        },

        // 26 DATO CURIOSO
        {
            tipo: 'dato_curioso',
            titulo: 'La Entrada Perfecta',
            descripcion: 'La majestuosa vista del Taita Imbabura y el lago San Pablo es tan increíble que la UNESCO la catalogó como "la entrada perfecta a un Geoparque".'
        },
        //27 TRAMPA
        {
            tipo: 'evento',
            subtipo: 'trampa_puntos',
            titulo: '🧶 ¡Artesanía Irresistible!',
            descripcion: 'Te quedas admirando los tejidos en la Plaza de los Ponchos y pierdes el último transporte a la estación. ¡Restas 80 puntos!',
            pointsLost: 100
        },

        // 28 BOLETO
       
          {
            
            tipo: 'boleto_pregunta',
            titulo: 'Estación de Ibarra',
            destino: 'Gualimán', // 🔥 Este texto es el que aparecerá en el Boleto VIP
            descripcion: '¡Has llegado a la estación del Tren de la Libertad! Responde correctamente la trivia para conseguir tu boleto y continuar tu viaje.',
                   },
        //29 DATO CURIOSO
        {
            tipo: 'dato_curioso',
            titulo: 'El Taita y su Warmi',
            descripcion: 'En el paisaje, el majestuoso volcán Taita Imbabura nunca está solo: siempre se presenta acompañado de su "Warmi" (esposa).'
        },
        //30 PREGUNTA ALEATORIA NORMAL

        {
            tipo: 'pregunta_aleatoria',
            categoria: 'gualiman',
            titulo: '🏺 El Enigma Ancestral',
            descripcion: '¡Gualimán está cerca! Demuestra tus conocimientos sobre el patrimonio y las pirámides antes de entrar al sitio sagrado.',
        },
        // 31 dato curioso
        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '🧗 ¡Sendero Resbaladizo!',
            descripcion: 'El camino hacia las tolas de Gualimán está lleno de lodo por la humedad de Intag. ¡Resbalas y retrocedes 2 casillas!',
            movimiento: -2
        },
        // 32  LUGAR EMBLEMATICO SALINAS
        {
            tipo: 'lugar_emblematico',
            titulo: 'Gualimán',
            imagen: 'assets/imagenes/lugares/nivel4/gualiman.png',
            item: 'ollabarrogualiman'
        },
        // 33 
       {
            tipo: 'evento',
            subtipo: 'ventaja_huacas',
            titulo: 'El Montículo Misterioso',
            descripcion: 'Te detienes frente a un inusual montículo de tierra a un lado del sendero. Recordando las leyendas de tesoros ancestrales en la zona, decides excavar un poco...'
        },
        // 34 Minijuego: ROMPECABEZAS
        {
            tipo: 'minijuego',
            subtipo: 'rompecabezas',
            recompensa_fija: 'ollabarrogualiman'
        },
        //35 DATO CURIOSO 
        {
            tipo: 'dato_curioso',
            titulo: 'Las Pirámides de Intag',
            descripcion: 'En Gualimán, Intag, se esconden antiguas "tolas" o pirámides ancestrales. ¡Un patrimonio arqueológico impresionante rodeado de naturaleza!'
        },
        //36 PREGUNTA ALEATORIA GUALIMAN 

        {
            tipo: 'pregunta_aleatoria',
            categoria: 'gualiman',
            titulo: '🏺 El Gran Legado',
            descripcion: '¡Pirámides exploradas! Responde la última prueba sobre las piezas ancestrales de Intag.',
        },
        //37 LEYENDA GLOBAL IMBABURA 
        { tipo: 'fin', titulo: '¡Leyenda de Imbabura!', descripcion: 'Has conquistado la Ruta Ancestral. Eres un experto viajero.', recompensa: { puntos: 500, trofeo: 'Gran Explorador' } }
    ];


const PREGUNTAS = [
    // --- TERRAZA CAHUASQUI ---
    {
        id: 1,
        categoria: 'cahuasqui',
        pregunta: "Cahuasquí es parroquia rural de:",
        opciones: ["Antonio Ante", "Pimampiro", "Urcuquí", "Ibarra"],
        correcta: 2 // Urcuquí
    },
    {
        id: 2,
        categoria: 'cahuasqui',
        pregunta: "Muy cerca de Cahuasquí se encuentra:",
        opciones: ["Planta hidroeléctrica Ambi", "Proyecto Geotérmico Chachimbiro", "Planta hidroeléctica Río Blanco", "Represa Manduriacu"],
        correcta: 1 // Proyecto Geotérmico Chachimbiro
    },
    {
        id: 3,
        categoria: 'cahuasqui',
        pregunta: "La terraza Cahuasquí está rodeada en todos sus flancos por:",
        opciones: ["Volcanes", "Quebradas", "Ríos caudalosos", "Lagos y lagunas"],
        correcta: 1 // Quebradas
    },

    // --- CAMBEO O TRUEQUE EN PIMAMPIRO ---
    {
        id: 4,
        categoria: 'pimampiro_trueque',
        pregunta: "El nombre completo del cantón Pimampiro es:",
        opciones: ["San Francisco de Pimampiro", "San Pedro de Pimampiro", "San Juan de Pimampiro", "San Miguel de Pimampiro"],
        correcta: 1 // San Pedro de Pimampiro
    },
    {
        id: 5,
        categoria: 'pimampiro_trueque',
        pregunta: "El Trueque o cambeo en Pimampiro es parte de su patrimonio:",
        opciones: ["Natural", "Geológico", "Cultural", "Arquitectónico"],
        correcta: 2 // Cultural
    },
    {
        id: 6,
        categoria: 'pimampiro_trueque',
        pregunta: "Una de las comunidades que participa tradicionalmente en el Trueque o Cambeo de Pimampiro es:",
        opciones: ["Chalguayacu", "Peguche", "Zuleta", "Ilumán"],
        correcta: 0 // Chalguayacu
    },

    //-----RUTA DEL VERTIGO------------------
    {
        id: 7,
        categoria: 'ruta_del_vertigo',
        pregunta: "El cánopy es la actividad turística relacionada con:",
        opciones: ["Saltar desde un puente", "Escalar una gran roca", "Lanzarse horizontalmente enganchado a un cable", "Navegar en rápidos de un río"],
        correcta: 2 // Lanzarse horizontalmente enganchado a un cable
    },
    {
        id: 8,
        categoria: 'ruta_del_vertigo',
        pregunta: "El sitio La Ruta del Vértigo está localizado en:",
        opciones: ["Zona de Intag", "Imbaya", "Sigsipamba", "Chaltura"],
        correcta: 2 // Sigsipamba
    },
    {
        id: 9,
        categoria: 'ruta_del_vertigo',
        pregunta: "El Mirador del Oso Andino y la Ruta del Vértigo son opciones turísticas de:",
        opciones: ["Otavalo", "Ibarra", "Pimampiro", "Cotacachi"],
        correcta: 2 // Pimampiro
    },

    // --- COMPLEJO VOLCANICO IMBABURA ---
    {
        id: 10,
        categoria: 'volcan_imbabura',
        pregunta: "Un volcán es clasificado como potencialmente activo mientras no haya superado desde su último proceso eruptivo:",
        opciones: ["10.000 años", "7.500 años", "5.000 años", "1.000 años"],
        correcta: 0 // 10.000 años
    },
    {
        id: 11,
        categoria: 'volcan_imbabura',
        pregunta: "Una de las fuentes de agua desde las profundidades del Imbabura es:",
        opciones: ["Araque", "Mojandita", "Eugenio Espejo", "Ilumán"],
        correcta: 0 // Araque
    },
    {
        id: 12,
        categoria: 'volcan_imbabura',
        pregunta: "Una de las rutas para subir a Warmi Imbabura es por:",
        opciones: ["El Abra", "La Compañía", "Paniquindra", "Zuleta"],
        correcta: 1 // La Compañía
    },

    // --- LAGO SAN PABLO---
    {
        id: 13,
        categoria: 'lago_sanpablo',
        pregunta: "La profundidad máxima aproximada del lago San Pablo es:",
        opciones: ["50m", "25m", "15m", "35m"],
        correcta: 0 // 50m
    },
    {
        id: 14,
        categoria: 'lago_sanpablo',
        pregunta: "La superficie aproximada que cubre el lago San Pablo es:",
        opciones: ["3,58 km2", "5,83 km2", "8,53 km2", "10,21 km2"],
        correcta: 1 // 5,83 km2
    },
    {
        id: 15,
        categoria: 'lago_sanpablo',
        pregunta: "¿Cuál de las siguientes comunidades está en la microcuenca del lago San Pablo?",
        opciones: ["Peribuela", "San Clemente", "Araque", "Natabuela"],
        correcta: 2 // Araque
    },

    // --- GUALIMAN ---
    {
        id: 16,
        categoria: 'gualiman',
        pregunta: "¿Qué elemento puede ser un vestigio arqueológico?",
        opciones: ["Olla de barro ancestral", "Una pintura de San Antonio", "Alpargates de cabuya", "Un tallado de madera moderno"],
        correcta: 0 // Olla de barro ancestral
    },
    {
        id: 17,
        categoria: 'gualiman',
        pregunta: "Gualimán está localizado en la parroquia:",
        opciones: ["García Moreno", "Cavas Galindo", "Peñaherrera", "Apuela"],
        correcta: 2 // Peñaherrera
    },
    {
        id: 18,
        categoria: 'gualiman',
        pregunta: "El principal atractivo arqueológico que destaca en la llanura de Gualimán son:",
        opciones: ["Las Tolas ceremoniales", "Monedas de oro españolas", "Armaduras de hierro coloniales", "Fósiles de dinosaurios"],
        correcta: 0 // Las Tolas ceremoniales
    }
];

// 3. RECOMPENSAS NIVEL 4
const RECOMPENSAS = [
    { key: 'terrazacahuasqui', nombre: 'Terraza de Cahuasquí', src: 'assets/imagenes/recompensas/terrazacahuasqui.png', color: '#FFDCE0' },
    { key: 'frutastrueque', nombre: 'Bandeja de Frutas', src: 'assets/imagenes/recompensas/frutastrueque.png', color: '#B2DFDB' },
    { key: 'columpiovertigo', nombre: 'Columpio', src: 'assets/imagenes/recompensas/columpiovertigo.png', color: '#D7CCC8' },
    { key: 'complejovolcanico', nombre: 'Vocán Imbabura', src: 'assets/imagenes/recompensas/complejovolcanico.png', color: '#E3F2FD' },
    { key: 'lagosanpablo', nombre: 'Lago de San Pablo', src: 'assets/imagenes/recompensas/lagosanpablo.png', color: '#FAFAFA' },
    { key: 'ollabarrogualiman', nombre: 'Olla de Barro de Gualimán', src: 'assets/imagenes/recompensas/ollabarrogualiman.png', color: '#FAFAFA' }
];
// 4. MINI-JUEGO (PAREJAS) - SOLO NIVEL 4
const PAREJAS = [
    // --- 🌾 PARA LA INGENIERÍA DE CAHUASQUÍ ---
    { izquierda: '⛰️ Terrazas Agrícolas', derecha: 'Ingeniería Preincaica' },
    { izquierda: '♨️ Energía Geotérmica', derecha: 'Proyecto Chachimbiro' },
    { izquierda: '🏞️ Rodeado de Quebradas', derecha: 'Paisaje de Cahuasquí' },

    // --- 🤝 PARA LA TRADICIÓN DE PIMAMPIRO ---
    { izquierda: '🍅 Canasta de Productos', derecha: 'Moneda de Intercambio' },
    { izquierda: '🤝 Manos Unidas', derecha: 'Tradición del Trueque' },
    { izquierda: '☀️ Ciudad del Sol', derecha: 'Tierra de Pimampiro' },

    // --- 🧗 PARA LA ADRENALINA (RUTA DEL VÉRTIGO) ---
    { izquierda: '🪢 Arnés y Mosquetón', derecha: 'Cánopy Extremo' },
    { izquierda: '🐻 Mirador Natural', derecha: 'Hogar del Oso Andino' },
    { izquierda: '🌉 Puente Colgante', derecha: 'Ruta del Vértigo' },

    // --- 🌋 PARA LA MAJESTUOSIDAD DEL IMBABURA ---
    { izquierda: '🏔️ Guardián Protector', derecha: 'Taita Imbabura' },
    { izquierda: '💧 Fuente Subterránea', derecha: 'Vertiente de Araque' },
    { izquierda: '🥾 Sendero de Ascenso', derecha: 'Ruta de La Compañía' },

    // --- 🌊 PARA LA PAZ DEL LAGO SAN PABLO ---
    { izquierda: '🌊 Aguas Tranquilas', derecha: 'Imbakucha' },
    { izquierda: '📏 50 Metros', derecha: 'Profundidad Máxima' },
    { izquierda: '⛵ Bote de Totora', derecha: 'Navegar en el Lago' },

    // --- 🏺 PARA EL MISTERIO DE GUALIMÁN ---
    { izquierda: '⛰️ Montículo de Tierra', derecha: 'Tolas Ceremoniales' },
    { izquierda: '🏺 Olla de Barro Ancestral', derecha: 'Vestigio Arqueológico' },
    { izquierda: '🗺️ Mapa de Peñaherrera', derecha: 'Llanura de Gualimán' }
];

// 5. VIDEOS NIVEL 3
const VIDEOS = {
    intro: 'assets/video/nivel4/intro_nivel4.mp4',
    fin: 'assets/video/nivel4/fin_nivel4.mp4'
};
// 6. IMÁGENES PARA EL ROMPECABEZAS (Usamos corchetes [ ] porque es una lista)
const IMAGENES_ROMPECABEZAS = [
    'assets/imagenes/minijuego/terrazacahuasqui.png',
    'assets/imagenes/minijuego/eltrueque.png',
    'assets/imagenes/minijuego/rutadelvertigo.png',
    'assets/imagenes/minijuego/complejovolcanicoimbabura.png',
    'assets/imagenes/minijuego/lagosanpablo.png',
    'assets/imagenes/minijuego/gualiman.png'
];

// EXPORTACIÓN
export const NIVEL_4_DATA = {
    coordenadas: COORDENADAS,
    casillas: CASILLAS,
    preguntas: PREGUNTAS,
    recompensas: RECOMPENSAS,
    parejas: PAREJAS,
    videos: VIDEOS,
    imagenesrompecabezas: IMAGENES_ROMPECABEZAS // ¡Añadido aquí para que el juego lo pueda usar!
};