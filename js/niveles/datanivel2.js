// js/niveles/datanivel2.js

// 1. COORDENADAS (Estas son de prueba, luego las ajustarás a tu mapa 2)
const COORDENADAS = [

    // 🟢 TRAMO 1: Inicio y Talabartería
    { top: "15.14", left: "9.58" },   // 0: INICIO
    { top: "17.68", left: "13.36" },  // 1
    { top: "19.88", left: "16.48" },  // 2
    { top: "22.08", left: "19.74" },  // 3
    { top: "24.11", left: "22.86" },  // 4: Talleres de Talabartería 🧵

    // 🟢 TRAMO 2: Hacia Artezón
    { top: "26.65", left: "26.64" },  // 5
    { top: "28.85", left: "29.64" },  // 6
    { top: "32.57", left: "32.76" },  // 7
    { top: "37.48", left: "33.28" },  // 8
    { top: "42.72", left: "32.63" },  // 9
    { top: "46.79", left: "30.42" },  // 10: Sendero Artezón 🌿

    // 🟢 TRAMO 3: Bajada a Chachimbiro
    { top: "47.63", left: "26.12" },  // 11
    { top: "47.12", left: "22.08" },  // 12
    { top: "47.80", left: "18.05" },  // 13
    { top: "52.20", left: "15.57" },  // 14
    { top: "57.45", left: "15.96" },  // 15: Termas de Chachimbiro ♨️

    // 🟢 TRAMO 4: Hacia el Pantano
    { top: "59.82", left: "18.70" },  // 16
    { top: "61.51", left: "22.47" },  // 17
    { top: "66.42", left: "24.43" },  // 18
    { top: "71.66", left: "25.73" },  // 19: Bosque Sanshipamba (Trampa?) 🌳⚠️

    // 🟢 TRAMO 5: Ruta larga a Peguche
    { top: "73.35", left: "29.51" },  // 20
    { top: "73.69", left: "33.28" },  // 21
    { top: "74.54", left: "37.32" },  // 22
    { top: "74.37", left: "41.09" },  // 23
    { top: "73.35", left: "45.26" },  // 24
    { top: "71.32", left: "49.17" },  // 25
    { top: "69.63", left: "53.20" },  // 26
    { top: "67.77", left: "56.72" },  // 27: Cascada de Peguche 🌊

    // 🟢 TRAMO 6: Ascenso Final
    { top: "65.06", left: "60.11" },  // 28
    { top: "61.00", left: "62.06" },  // 29
    { top: "55.59", left: "62.58" },  // 30
    { top: "54.06", left: "66.09" },  // 31
    { top: "54.40", left: "70.13" },  // 32
    { top: "54.74", left: "74.17" },  // 33
    { top: "54.74", left: "78.07" },  // 34
    { top: "56.09", left: "81.59" },  // 35: Volcán Cubilche 🌋

    // 🏁 META
    { top: "56.43", left: "85.11" },  // 36: Pre-meta
    { top: "56.26", left: "89.53" }   // 37: META FINAL 🏆
];

const CASILLAS = // Contenido para el Nivel 2 (36 casillas en total)
    [
        // 0. INICIO (Solicitado)
        { tipo: 'inicio', titulo: 'Introducción a: Valles de Bienestar', descripcion: 'Inicias el recorrido por los tesoros de la Ruta 2.' },
        //1
        {
            tipo: 'dato_curioso',
            titulo: '📍 Destino Urcuquí',
            descripcion: 'En la parroquia de Tumbabiro se encuentra Chachimbiro, un paraíso termal donde puedes disfrutar de servicios turísticos únicos y artesanías locales.',
        },

        //2 mini juego cuatro imagenes 
        // Minijuego: Identificar Chachimbiro
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '♨️ Desafío Termal',
            pregunta: 'Estas aguas de Urcuquí son famosas por ser volcánicas y medicinales. ¿Cuál es la foto de las Termas de Chachimbiro?',

            // RUTA CORREGIDA SEGÚN TU CAPTURA:
            imagenCorrecta: 'assets/imagenes/minijuego/chachimbiro.png',

        },
        // 3 trampa 
        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '🚗 ¡Sin Parqueadero!',
            descripcion: '¡Estacionamiento lleno! No cabe ni un auto. Te toca regresar a buscar sitio. Retrocedes 2 casillas.',
            movimiento: -2
        },
        // 4. LUGAR EMBLEMÁTICO (Solicitado)
        {
            tipo: 'lugar_emblematico',
            titulo: 'Termas de Chachimbiro',
            imagen: 'assets/imagenes/lugares/nivel2/termas_chachimbiro.png',
            item: 'piscina'
        },

        // 5
        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: 'Ruta de los Lagos',
            descripcion: 'Divisas el valle a lo lejos y aprovechas el terreno despejado.',
            movimiento: 5
        },
        // 6 CASILLA UNIR PAREJAS
        // CASILLA A: El accidente
        {
            tipo: 'minijuego',
            subtipo: 'unir_parejas',
            modo: 'aleatorio',
            titulo: '💥 ¡Se abrió el cierre!',
            descripcion: 'Tanto ajetreo en el camino hizo que la mochila se abriera. <b>Ayúdanos a recoger todo</b> y guardarlo en el bolsillo del lugar que corresponde.',

        },
        //7
        {
            tipo: 'pregunta_aleatoria', // Nuevo tipo
            categoria: 'ruta_termal',   // Conecta con las 3 preguntas de arriba
            titulo: 'Vereda de Piedra',
            descripcion: 'Para cruzar este sendero ancestral, demuestra tus conocimientos sobre la Ruta Termal.',
            recompensa: 'piscina' // O la recompensa visual que prefieras
        },
        // 8. Dato Curioso (Antes de llegar al Artezón)
        {
            tipo: 'dato_curioso',
            titulo: '🎢 ¡A las nubes!',
            descripcion: 'En el centro recreativo Artezón puedes subirte a uno de los columpios más grandes de Imbabura. ¡Una experiencia extrema con una vista increíble!',
        },
        //9  Minijuego: Identificar el Sendero Artezón
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '🌿 El Pulmón de Atuntaqui',
            pregunta: 'Ubicado en Antonio Ante, este lugar es un refugio natural lleno de árboles y senderos tranquilos. ¿Cuál es el Parque Sendero Artezón?',

            // RUTA EXACTA (según tu captura):
            imagenCorrecta: 'assets/imagenes/minijuego/parquesenderoartezon.png',

        },
        // 10. LUGAR EMBLEMÁTICO (Solicitado)
        {
            tipo: 'lugar_emblematico',
            titulo: 'Sendero El Artezón',
            imagen: 'assets/imagenes/lugares/nivel2/sendero_artezon.png',
            item: 'sendero'
        },
        //11
        {
            id: 11,
            tipo: 'pregunta_aleatoria',
            categoria: 'artezon', // Conecta con las preguntas de arriba
            titulo: 'Sendero Artezón',
            descripcion: 'Explora la naturaleza de San Roque. Responde correctamente para avanzar.',
            recompensa: 'sendero'
        }, // 12 dato curioso
        {
            tipo: 'dato_curioso',
            titulo: '👞 Arte en Cuero',
            descripcion: 'Desde sencillos llaveros hasta sillas de montar y botas hechas a mano; la maestría de la talabartería te espera en los centros artesanales locales.',
        },
        // 13 Minijuego: Identificar la Talabartería
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '🧵 Maestros del Cuero',
            pregunta: 'La Esperanza es famosa por sus monturas y trabajos en cuero fino. ¿Cuál de estas fotos corresponde a una Talabartería?',

            // RUTA SEGÚN TU CAPTURA:
            imagenCorrecta: 'assets/imagenes/minijuego/talabarteria.png',


        },
        //14
        {
            tipo: 'evento',
            subtipo: 'trampa',
            titulo: '🧶 Distracción en el Taller',
            descripcion: 'Te detuviste a admirar una montura finamente labrada y perdiste tiempo valioso. ¡Pierdes 20 puntos!',
            pointsLost: 20
        },
        // 15. LUGAR EMBLEMÁTICO (Solicitado)
        {
            tipo: 'lugar_emblematico',
            titulo: 'Talleres de Talabartería',
            imagen: 'assets/imagenes/lugares/nivel2/talleres_talabarteria.png',
            item: 'silla'
        },

        //16
        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: 'Barrio Obrero',
            descripcion: 'Escuchas el martilleo del cuero y consigues unas botas nuevas muy resistentes.',
            movimiento: 3
        },
        //17
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'talabarteria', // Conecta con tus preguntas ID 7, 8 y 9
            titulo: 'Barrio Obrero: Arte en Cuero',
            descripcion: 'Escuchas el martilleo del cuero... Para cruzar este taller, demuestra tu conocimiento sobre la Talabartería.',
            recompensa: 'silla' // Key de la recompensa definida en tu array RECOMPENSAS
        },
        // 18 Minijuego: Identificar la Cascada de Peguche
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '🌊 La Cascada Sagrada',
            pregunta: 'Este lugar en Otavalo es vital para el baño ritual del Inti Raymi. ¿Puedes reconocer la Cascada de Peguche?',

            // RUTA EXACTA (Ojo con el .JPG mayúscula que vi en tu carpeta)
            imagenCorrecta: 'assets/imagenes/minijuego/cascadapeguche.png',


        },
        // 19. LUGAR EMBLEMÁTICO (Solicitado)
        {
            tipo: 'lugar_emblematico',
            titulo: 'Cascada de Peguche',
            imagen: 'assets/imagenes/lugares/nivel2/cascada_peguche.png',
            item: 'cascada'
        },

        // 20 CASILLA UNIR PAREJAS: El experto
        {
            tipo: 'minijuego',
            subtipo: 'unir_parejas',
            modo: 'aleatorio',
            titulo: '🧭 El Kit del Aventurero',
            descripcion: 'Un buen viajero siempre va preparado. Demuestra tu experiencia: <b>Conecta cada herramienta</b> con el destino donde será indispensable.',

        },
        // 21 Dato curioso: Post-visita a la Talabartería
        // Dato curioso: Post-Cascada de Peguche
        {
            tipo: 'dato_curioso',
            titulo: '✨ Sanación Ancestral',
            descripcion: 'Durante las festividades indígenas, puedes participar en ceremonias de purificación, rituales sagrados que conectan al ser humano con la naturaleza.',
        },
        //22
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'cascada_peguche', // Conecta con las preguntas de arriba
            titulo: 'Cascada de Peguche',
            descripcion: 'Has llegado a un sitio sagrado de purificación. Responde correctamente para continuar tu camino.',
            recompensa: 'cascada' // Clave de la recompensa visual configurada en data.js
        },
        //23
        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: '🏔️ Cima Cubilche',
            descripcion: '¡Vistas increíbles y camino libre!',
            movimiento: 4
        },
        //24
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'volcan_cubilche',
            titulo: 'Cima del Cubilche',
            descripcion: 'Has llegado a los cráteres sagrados. Demuestra tu conocimiento sobre este volcán para ganar tu recompensa.',
            recompensa: 'volcan'
        },
        // 25 Minijuego: Identificar el Volcán Cubilche
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '🏔️ El Vecino del Imbabura',
            pregunta: 'Este volcán inactivo descansa justo al lado del Taita Imbabura y guarda lagunas en su cima. ¿Cuál es el Cubilche?',

            // RUTA EXACTA (según tu captura):
            imagenCorrecta: 'assets/imagenes/minijuego/volcancubilche.png',


        },
        // 26 Dato curioso: Post-Cascada de Peguche
        {
            tipo: 'dato_curioso',
            titulo: '👁️ Vista de Gigantes',
            descripcion: 'Desde la cima del volcán Cubilche puedes apreciar lo imponente del Taita Imbabura y disfrutar de un paisaje espectacular en 360°.',
        },
        // 27. LUGAR EMBLEMÁTICO (Solicitado)
        {
            tipo: 'lugar_emblematico',
            titulo: 'Volcán Cubilche',
            imagen: 'assets/imagenes/lugares/nivel2/volcan_cubilche.png',
            descripcion: 'Cerro sagrado de energía renovadora.',
            item: 'volcan'
        },
        //28
        {
            tipo: 'evento',
            subtipo: 'decision_trampa',
            titulo: '🏔️ El Desafío del Cubilche',
            descripcion: '¡Una tormenta repentina te atrapa cerca de las lagunas! Tienes que tomar una decisión difícil para continuar:',
            opcionA: {
                texto: 'Perder 100 puntos (Esfuerzo extremo)',
                puntos: -100,
                mov: 0
            },
            opcionB: {
                texto: 'Retroceder 6 casillas (Buscar refugio)',
                puntos: 0,
                mov: -6
            }
        },
        // 29 dato curioso
        {
            tipo: 'dato_curioso',
            titulo: '🗿 Petroglifos Ancestrales',
            descripcion: 'Entre los símbolos representados en los petroglifos de Shanshipamba están ammonites, aves y monos. En algunos casos, intentan representar el paisaje del entorno.',
        },
        // 30 CASILLA UNIR PAREJAS: Revisión final
        {
            tipo: 'minijuego',
            subtipo: 'unir_parejas',
            modo: 'aleatorio',
            titulo: '✅ Check-in de Equipaje',
            descripcion: 'Antes de seguir avanzando, hagamos un inventario rápido. <b>¿Recuerdas para qué sirve cada cosa</b> que traes cargando?',

        },
        //31
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'shanshipamba',
            titulo: 'Petroglifos de Shanshipamba',
            descripcion: 'Has descubierto rocas con grabados milenarios. Descifra su origen para continuar.',
            recompensa: 'petroglifo'
        },
        // 32 Minijuego: Identificar Shanshipamba
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '⛪ El Valle Escondido',
            pregunta: 'Ubicado en Pimampiro, este lugar es famoso por ser una meseta verde y plana rodeada de montañas profundas. ¿Cuál es Shanshipamba?',

            // RUTA EXACTA (según tu captura):
            imagenCorrecta: 'assets/imagenes/minijuego/shanshipamba.png',


        },
        //33
       {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: '🌲 Atajo a Shanshipamba',
            descripcion: 'Encuentras un sendero antiguo que corta camino hacia el bosque sagrado.',
            movimiento: 2
        }, 
        // 34 DATO CURIOSO
        {
            tipo: 'dato_curioso',
            titulo: 'Entorno de Shanshipamba ❄️',
            descripcion: 'El clima en el entorno de Shanshipamba es frío, propicio para actividades agrícolas, pastizales, ganadería, producción de quesos o cría de truchas.',
        },
        // 35. LUGAR EMBLEMÁTICO (Solicitado)
        {
            tipo: 'lugar_emblematico',
            titulo: 'Bosque Sanshipamba',
            imagen: 'assets/imagenes/lugares/nivel2/sanshipamba_pimampiro.png',
            item: 'petroglifo'
        },
        //36
        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '🎩 ¡Viento traicionero!',
            descripcion: '¡No puede ser! Un fuerte viento del cerro se llevó tu sombrero y tus mapas. Tienes que bajar corriendo a buscarlos. Retrocedas 5 casillas.',
            movimiento: -5
        },
        // 37. META (Solicitado)
        { tipo: 'fin', titulo: '¡Leyenda de Imbabura!', descripcion: 'Has conquistado la Ruta Ancestral. Eres un experto viajero.', recompensa: { puntos: 500, trofeo: 'Gran Explorador' } }
    ];



// 2. BANCO DE PREGUNTAS NIVEL 2 (CON 4 OPCIONES)
const PREGUNTAS = [
    // VOLCAN CUBILCHE
    {
        id: 1,
        categoria: 'volcan_cubilche',
        pregunta: "¿La altitud del volcán Cubilche sobre el nivel del mar es?",
        opciones: ["2550", "4100", "3826", "3200"],
        correcta: 2 // 3826
    },
    {
        id: 2,
        categoria: 'volcan_cubilche',
        pregunta: "El volcán Cubilche está localizado entre los volcanes:",
        opciones: ["Cunrro e Imbabura", "Imbabura y Cusín", "Cunrro y Cusín", "Mojanda y Fuya Fuya"],
        correcta: 0 // Cunrro e Imbabura
    },
    {
        id: 3,
        categoria: 'volcan_cubilche',
        pregunta: "Para subir al volcán Cubilche una ruta segura es por:",
        opciones: ["San Antonio de Ibarra", "Zuleta", "El Priorato", "La Esperanza"],
        correcta: 1 // Zuleta
    },
    //CASCADA PEGUCHE
    {
        id: 4,
        categoria: 'cascada_peguche',
        pregunta: "La cascada Peguche es el desfoque natural de:",
        opciones: ["Laguna Yahuarcocha", "Lago Cuicocha", "Lago San Pablo", "Laguna de Mojanda"],
        correcta: 2 // Lago San Pablo
    },
    {
        id: 5,
        categoria: 'cascada_peguche',
        pregunta: "La cascada Peguche está localizada en el cantón:",
        opciones: ["Ibarra", "Otavalo", "Antonio Ante", "Pimampiro"],
        correcta: 1 // Otavalo
    },
    {
        id: 6,
        categoria: 'cascada_peguche',
        pregunta: "La altura aproximada de la cascada Peguche es:",
        opciones: ["30m", "40m", "20m", "10m"],
        correcta: 2 // 20m
    },
    //TALLERES DE TALABRTERIA 
    {
        id: 7,
        categoria: 'talabarteria',
        pregunta: "La Talabartería se refiere al trabajo artesanal con:",
        opciones: ["Madera", "Cerámica", "Cuero", "Vidrio soplado"],
        correcta: 2 // Cuero
    },
    {
        id: 8,
        categoria: 'talabarteria',
        pregunta: "En la provincia de Imbabura la Talabartería es predominante en:",
        opciones: ["Pimampiro", "Urcuquí", "Cotacachi", "Atuntaqui"],
        correcta: 2 // Cotacachi
    },
    {
        id: 9,
        categoria: 'talabarteria',
        pregunta: "Productos de Talabartería son:",
        opciones: ["Chompas, calzado, sillas de montar", "Souvenirs, correas, alforjas", "Todos los anteriores", "Solo billeteras y cinturones"],
        correcta: 2 // Todos los anteriores
    },
    // ARTEZON
    {
        id: 10,
        categoria: 'artezon',
        pregunta: "El sendero Artezón está localizado en la parroquia:",
        opciones: ["Chaltura", "Imbaya", "San Roque", "Natabuela"],
        correcta: 2 // San Roque
    },
    {
        id: 11,
        categoria: 'artezon',
        pregunta: "El sendero Artezón está localizado en el cantón:",
        opciones: ["Cotacachi", "Otavalo", "Antonio Ante", "Ibarra"],
        correcta: 2 // Antonio Ante
    },
    {
        id: 12,
        categoria: 'artezon',
        pregunta: "Junto al sendero Artezón puedes encontrar:",
        opciones: ["Juegos recreativos", "Pista de motos", "Bosque primario", "Centro comercial"],
        correcta: 0 // Juegos recreativos
    },
    //RUTA CHACHIMBIRO 
    {
        id: 13,
        categoria: 'ruta_termal',
        pregunta: "La ruta termal de Imbabura está localizada en el cantón:",
        opciones: ["Otavalo", "Urcuquí", "Pimampiro", "Cotacachi"],
        correcta: 1 // Urcuquí
    },
    {
        id: 14,
        categoria: 'ruta_termal',
        pregunta: "Las termas Chachimbiro están localizadas en la parroquia:",
        opciones: ["Pablo Arenas", "Cahuasquí", "Tumbabiro", "Salinas"],
        correcta: 2 // Tumbabiro
    },
    {
        id: 15,
        categoria: 'ruta_termal',
        pregunta: "Muy cerca de las termas Chachimbiro también se encuentra:",
        opciones: ["Nangulví", "Timbuyacu", "Yanayacu", "Aguas Hediondas"],
        correcta: 1 // Timbuyacu
    },

    //SANSHIPAMBA
    {
        id: 16,
        categoria: 'shanshipamba',
        pregunta: "Los petroglifos son:",
        opciones: ["Vestigios geológicos", "Vestigios arqueológicos", "Vestigios naturales", "Vestigios modernos"],
        correcta: 1 // Vestigios arqueológicos
    },
    {
        id: 17,
        categoria: 'shanshipamba',
        pregunta: "Shanshipamba es una comunidad localizada en:",
        opciones: ["Ibarra", "Cotacachi", "Pimampiro", "Urcuquí"],
        correcta: 2 // Pimampiro
    },
    {
        id: 18,
        categoria: 'shanshipamba',
        pregunta: "Los petroglifos son parte del patrimonio:",
        opciones: ["Cultural", "Biodiversidad", "Natural", "Turístico e industrial"],
        correcta: 0 // Cultural
    }
];
// 3. RECOMPENSAS NIVEL 2
const RECOMPENSAS = [
    { key: 'piscina', src: 'assets/imagenes/recompensas/piscina.png', color: '#FFDCE0' },
    { key: 'sendero', src: 'assets/imagenes/recompensas/sendero.png', color: '#B2DFDB' },
    { key: 'silla', src: 'assets/imagenes/recompensas/silla.png', color: '#D7CCC8' },
    { key: 'cascada', src: 'assets/imagenes/recompensas/cascada.png', color: '#E3F2FD' },
    { key: 'volcan', src: 'assets/imagenes/recompensas/volcan.png', color: '#FAFAFA' },
    { key: 'petroglifo', src: 'assets/imagenes/recompensas/petroglifo.png', color: '#FAFAFA' }
];
// 4. MINI-JUEGO (PAREJAS) NIVEL 2 - 5 COMBINACIONES POR LUGAR
const PAREJAS = [
    // --- 💦 TERMAS DE CHACHIMBIRO ---
    { izquierda: '🩳 Traje de Baño', derecha: 'Termas de Chachimbiro' },
    { izquierda: '🧴 Bloqueador Solar', derecha: 'Termas de Chachimbiro' },
    { izquierda: '🩴 Sandalias', derecha: 'Termas de Chachimbiro' },
    { izquierda: '🧼 Jabón Orgánico', derecha: 'Termas de Chachimbiro' },
    { izquierda: '🥤 Jugo Natural', derecha: 'Termas de Chachimbiro' },

    // --- 🌿 SENDERO ARTEZÓN ---
    { izquierda: '💧 Botella de Agua', derecha: 'Sendero Artezón' },
    { izquierda: '👟 Zapatillas de Correr', derecha: 'Sendero Artezón' },
    { izquierda: '🧢 Gorra para el Sol', derecha: 'Sendero Artezón' },
    { izquierda: '🗺️ Mapa de Ruta', derecha: 'Sendero Artezón' },
    { izquierda: '🍎 Manzana para el Camino', derecha: 'Sendero Artezón' },

    // --- 🛠️ TALLERES DE TALABARTERÍA ---
    { izquierda: '🧥 Chaqueta de Cuero', derecha: 'Talleres de Talabartería' },
    { izquierda: '👞 Botas Artesanales', derecha: 'Talleres de Talabartería' },
    { izquierda: '👜 Bolso de Piel', derecha: 'Talleres de Talabartería' },
    { izquierda: '🧤 Guantes Resistentes', derecha: 'Talleres de Talabartería' },
    { izquierda: 'ベルト Correa de Cuero', derecha: 'Talleres de Talabartería' },

    // --- 🌊 CASCADA PEGUCHE ---
    { izquierda: '🧥 Poncho de Aguas', derecha: 'Cascada Peguche' },
    { izquierda: '📸 Cámara de Fotos', derecha: 'Cascada Peguche' },
    { izquierda: '🎷 Flauta Andina', derecha: 'Cascada Peguche' },
    { izquierda: '🧣 Bufanda de Lana', derecha: 'Cascada Peguche' },
    { izquierda: '🕯️ Velas Rituales', derecha: 'Cascada Peguche' },

    // --- ⛰️ VOLCÁN CUBILCHE ---
    { izquierda: '🦯 Bastón de Trekking', derecha: 'Volcán Cubilche' },
    { izquierda: '🔭 Binoculares', derecha: 'Volcán Cubilche' },
    { izquierda: '🍫 Chocolate Energético', derecha: 'Volcán Cubilche' },
    { izquierda: '🧥 Abrigo Térmico', derecha: 'Volcán Cubilche' },
    { izquierda: '⛺ Carpa de Montaña', derecha: 'Volcán Cubilche' },

    // --- 🎒 SHANSHIPAMBA ---
    { izquierda: '🧺 Canasta de Frutas', derecha: 'Shanshipamba' },
    { izquierda: '👒 Sombrero de Paja', derecha: 'Shanshipamba' },
    { izquierda: '🌽 Maíz Tierno', derecha: 'Shanshipamba' },
    { izquierda: '🚜 Miniatura de Tractor', derecha: 'Shanshipamba' },
    { izquierda: '🍯 Miel de Abeja', derecha: 'Shanshipamba' }
];
// 5. VIDEOS NIVEL 2
const VIDEOS = {
    intro: 'assets/video/nivel2/intro_nivel2.mp4',
    fin: 'assets/video/nivel2/fin_nivel2.mp4'
};


// EXPORTACIÓN
export const NIVEL_2_DATA = {
    coordenadas: COORDENADAS,
    casillas: CASILLAS,
    preguntas: PREGUNTAS,
    recompensas: RECOMPENSAS,
    parejas: PAREJAS,
    videos: VIDEOS
};