// js/niveles/datanivel2.js

// 1. COORDENADAS (Estas son de prueba, luego las ajustarás a tu mapa 2)
// Coordenadas Nivel 3 (Solo posiciones en %)
// 1. COORDENADAS (Estas son de prueba, luego las ajustarás a tu mapa 2)
const COORDENADAS = [
    { left: 3.00, top: 45.05 }, // 0

    { left: 6.22, top: 45.97 },  // 1
    { left: 9.45, top: 45.74 },  // 2
    { left: 11.98, top: 45.74 }, // 3
    { left: 14.86, top: 46.43 }, // 4
    { left: 17.28, top: 46.66 }, // 5
    { left: 20.28, top: 45.74 }, // 6
    { left: 22.81, top: 43.90 }, // 7
    { left: 25.58, top: 41.83 }, // 8
    { left: 40.09, top: 41.37 }, // 9
    { left: 42.74, top: 41.37 }, // 10
    { left: 45.16, top: 42.06 }, // 11
    { left: 47.24, top: 45.28 }, // 12
    { left: 47.24, top: 50.81 }, // 13
    { left: 45.62, top: 54.72 }, // 14
    { left: 43.20, top: 58.86 }, // 15
    { left: 40.78, top: 60.47 }, // 16
    { left: 38.48, top: 63.92 }, // 17
    { left: 37.10, top: 69.21 }, // 18
    { left: 38.25, top: 74.50 }, // 19
    { left: 41.13, top: 74.96 }, // 20
    { left: 44.01, top: 74.73 }, // 21
    { left: 46.77, top: 74.96 }, // 22
    { left: 50.35, top: 74.50 }, // 23
    { left: 69.12, top: 64.84 }, // 24
    { left: 72.70, top: 65.76 }, // 25
    { left: 75.69, top: 65.99 }, // 26
    { left: 78.23, top: 66.45 }, // 27
    { left: 80.88, top: 64.84 }, // 28
    { left: 81.80, top: 59.32 }, // 29
    { left: 79.95, top: 54.95 }, // 30
    { left: 77.53, top: 54.03 }, // 31
    { left: 75.00, top: 53.11 }, // 32
    { left: 72.58, top: 50.81 }, // 33
    { left: 61.52, top: 28.49 },
    { left: 59.68, top: 25.27 },
    { left: 57.60, top: 21.58 },
    { left: 54.84, top: 22.74 },
    { left: 51.84, top: 22.74 },
    { left: 48.85, top: 22.04 },
    { left: 45.97, top: 21.58 },



];


const CASILLAS = // Contenido para el Nivel 2 (36 casillas en total)
    [
        // 0. INICIO (Solicitado)
        { tipo: 'inicio', titulo: 'Introcucción a: Rutas de Agua y Sabores', descripcion: 'Inicias el recorrido por los tesoros de la Ruta 3.' },
        // 1 DATO CURIOSO CARA DEL DIOS INTAG 
        {
            tipo: 'dato_curioso',
            titulo: '🧗‍♂️ El Sendero del Vértigo',

            descripcion: '¿Te atreves a caminar sobre la cara de un Dios? En Apuela, para llegar al caserío Pueblo Viejo, debes cruzar un sendero en "zig-zag" que atraviesa la inmensa roca con forma humana. ¡Es un camino lleno de vértigo y paisajes increíbles!',

        },
        //2 MINI JUEGO CUATRO IMAGENES
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio', // El juego buscará otras 3 fotos al azar para confundir

            titulo: '🗿 El Guardián de Piedra',

            // Pregunta específica para este lugar
            pregunta: 'En la nublada zona de Intag existe una inmensa escultura natural que mira al cielo. ¿Cuál es la verdadera Cara del Dios de Intag?',

            // La ruta correcta que me diste
            imagenCorrecta: 'assets/imagenes/minijuego/caradiosintag.png',

        },

        // 3   VENTAJA 
        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: '🍃 Sendero Oculto',
            descripcion: 'Mientras buscas la Cara del Dios Íntag, encuentras un antiguo sendero secreto de los ancestros que te permite avanzar más rápido.',
            movimiento: 4
        },
        // 4.  LUGAR EMBLEMATICO CARA DE DIOS INTAG
        {
            tipo: 'lugar_emblematico',
            titulo: 'Cara de Dios de Intag',
            imagen: 'assets/imagenes/lugares/nivel3/caradios_deintag.png',
            item: 'caraintag'
        },

        // 5 LEYENDA CARA DIOS INTAG 
        {
            tipo: 'leyenda',
            titulo: '🗿 El Guardián de Piedra',
            imagen: 'assets/imagenes/lugares/nivel3/caradios_deintag.png',

            // Historia más envolvente y "de leyenda"
            historia: 'Cuentan los abuelos que la montaña tiene ojos. Es un antiguo gigante de piedra que vigila el Valle de Intag, pero es tan tímido que ha dejado que el bosque le cubra el rostro para jugar a las escondidas.',

            instruccion: 'Aparta las hojas (🌿) y encuentra al Dios. ¡Cuidado con las ranas (🐸)!',
            icono_oculto: '🌿',
            icono_ganador: '🗿',
            icono_perdedor: '🐸'
        },
        // 6 TRAMPA 

        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '📸 ¡Selfie Accidentada!',
            descripcion: 'Por mirar el celular, tropezaste con una raíz y caíste rodando entre las hojas. Retrocedes 3 casillas.',
            movimiento: -3
        },
        //  7 PREGUNTA ALEATORIA
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'intag',
            titulo: 'Cara del Dios Intag',
            descripcion: 'El antiguo monolito te desafía. ¡Responde con sabiduría!',

        },

        // 8. DATO CURIOSO  CASCADA CONRAYARO
        {
            tipo: 'dato_curioso',
            titulo: '🌽 El Sabor de la Tulpa',

            descripcion: 'En Timbuyacu, la tradición se cocina a fuego lento. Mujeres líderes como María mantienen viva la costumbre de asar tortillas de maíz en el "tiesto" (plato de barro) sobre una "tulpa" humeante, luciendo con orgullo sus polleras y sombreros típicos.',

        },

        //9  LUGAR EMBLEMATICO  CASCADA CONRAYADO
        {
            tipo: 'lugar_emblematico',
            titulo: 'Cascada Conrayado',
            imagen: 'assets/imagenes/lugares/nivel3/cascada_conrayado.png',
            item: 'cascadaconrayaro'
        },

        // 10 TRAMPA 

        {
            tipo: 'evento',
            subtipo: 'trampa_puntos',
            titulo: '🥶 ¡Cambio de clima!',
            descripcion: 'El frío de la sierra te pegó de golpe y tuviste que comprar un abrigo urgente. Pierdes 30 puntos.',
            pointsLost: 30
        },
        //11  LEYENDA CASCADA CONRAYARO
        {
            tipo: 'leyenda',
            titulo: 'El Baño de Energía', // Título real sobre la costumbre local

            // Historia basada en la creencia de purificación de las cascadas andinas
            historia: 'Desde tiempos antiguos, los yachaks (sabios) dicen que el agua de Conrayaro tiene el poder de curar el alma. Si te bañas con respeto, la montaña te regala su fuerza.',

            instruccion: 'Toca las gotas para purificarte. ¡Cuidado con el Duende (👺)!',
            icono_oculto: '💧',
            icono_ganador: '✨',  // Representa la energía/limpieza
            icono_perdedor: '👺'  // Representa al Duende o Chuzalongo (emoji de máscara o duende)
        },

        //12 DATO CURIOSO CASCADA CONRAYARO
        {
            tipo: 'dato_curioso',
            titulo: '🌡️ La Ruta de los Contrastes',

            // Basado en el texto: Describe que el turismo es atraído por "el agua tibia de Timbuyacu y en contraste las caidas de agua limpia y fría como es el caso de la cascada Conrayaro."
            descripcion: '¡Aquí la aventura tiene dos temperaturas! La costumbre en esta ruta del Geoparque es vivir el contraste natural: relajarse primero en las "aguas tibias" de Timbuyacu y luego despertar los sentidos con el agua "limpia y fría" de la Cascada de Conrayaro.',

        },


        // 13 PREGUNTA ALEATORIA  CASCADA CONRAYARO 
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'cascada_conrayaro',
            titulo: '🌊 El Guardián de Conrayaro',
            descripcion: '¡La cascada te desafía! Responde con sabiduría.',
        },
        //14 CUY DE CHARTURA
        {
            tipo: 'lugar_emblematico',
            titulo: 'Cuy de Chaltura',
            imagen: 'assets/imagenes/lugares/nivel3/cuy_chaltura.png',
            item: 'cuychaltura'
        },

        // 15 VENTAJA 

        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: 'Energía de Chaltura',
            descripcion: '¡Qué rico! Un delicioso cuy asado te da fuerzas para correr más rápido.',
            movimiento: 4

        },
        // 16 DATO CURIOSO 
        {
            tipo: 'dato_curioso',
            titulo: 'El Festín en la Chacra',
            descripcion: 'En la chacra de Doña Rosita y Don Humberto, ¡todo es fresco! Entre plantas de taxo y babaco, Humberto es un experto usando la "hoz" para cortar alfalfa. Los cuyes, al oler su comida, saltan y afilan sus dientes emocionados por el banquete.',

        },
        // 17 PREGUNTA ALEATORIA 
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'cuy_chaltura',
            titulo: 'El Banquete del Cuy',
            descripcion: '¡El aroma a leña te llama! Demuestra tu experto sabor.',

        },
        // 18 LEYENDA CASCADA TAXOPAMBA
        {
            tipo: 'leyenda',
            titulo: '👺 El Duende de la Quebrada',
            historia: 'Los abuelos cuentan que la Cascada de Taxopamba es el hogar de un Duende travieso que lleva un sombrero grande. Dicen que a medio día, el agua se abre y deja ver una "paila de oro", pero el Duende la esconde rápido si te acercas con codicia.',

            instruccion: 'Busca la moneda entre las rocas (🪨). ¡Cuidado con el Sombrero (🎩) del duende!',
            icono_oculto: '🪨',
            icono_ganador: '🪙',
            icono_perdedor: '🎩'
        },
        // 19  CASCADA TAXOPAMBA
        {
            tipo: 'lugar_emblematico',
            titulo: 'Cascada Taxopamba',
            imagen: 'assets/imagenes/lugares/nivel3/cascada_taxopamba.png',
            item: 'cascadataxopamba'
        },

        // 20 CASILLA UNIR PAREJAS: El experto
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',

            titulo: '🌊 El Secreto de Otavalo',

            // Pregunta de ubicación
            pregunta: 'Camino a las Lagunas de Mojanda, se esconde una espectacular caída de agua rodeada de bosque nativo. ¿Cuál es la Cascada de Taxopamba?',
            imagenCorrecta: 'assets/imagenes/minijuego/cascadataxopamba.png',
        },

        // 21 Dato curioso
        {
            tipo: 'dato_curioso',
            titulo: '🚰 El Grifo Natural de Mojandita',
            descripcion: 'Para la comunidad de Mojandita, el agua no viene de tuberías comunes, ¡viene de las piedras! Su costumbre y vida diaria dependen de estas "vertientes de agua pura" que brotan milagrosamente de "rocas de un tamaño inmenso" del volcán Fuya Fuya.',
        },
        //22 TRAMPA 

        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '🦇 ¡Cueva Oscura!',
            descripcion: 'Un enjambre de murciélagos te asusta en la oscuridad y sales corriendo hacia atrás. Retrocedes 2 casillas.',
            movimiento: -2
        },
       // 23 tunel ingreso 
        { 
            tipo: 'camino', 
            titulo: '🚇 Entrada al Túnel', 
            descripcion: 'Te adentras en la oscuridad de un antiguo túnel de la montaña. El eco de tus pasos resuena mientras la luz del sol va desapareciendo poco a poco.' 
        },
        
        // 24 tunel salida 
        { 
            tipo: 'camino', 
            titulo: '☀️ Luz al Final del Túnel', 
            descripcion: '¡Por fin! Sales de la penumbra y el viento fresco de Imbabura te da la bienvenida. Retomas tu camino con energías renovadas.' 
        },
        //25 PREGUNTA ALEATORIA  
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'cascada_taxopamba',
            titulo: '🌋 El Secreto de Mojanda',
            descripcion: '¡Las rocas guardan agua pura! Responde con sabiduría.',
        },

        //26 LEYENDA
        {
            tipo: 'leyenda',
            titulo: '🌧️ La Laguna Brava de Puruhanta',
            historia: 'Cuentan que la Laguna de Puruhanta es muy celosa de su silencio. Si llegas haciendo ruido o lanzas piedras a sus aguas, ella despierta a la neblina para atraparte y lanza granizo para que te vayas.',

            instruccion: 'Toca las Truchas (🐟) en silencio. ¡Evita las Nubes (☁️)!',
            icono_oculto: '🐟',
            icono_ganador: '🤫',  // Emoji de silencio o calma
            icono_perdedor: '⚡'   // Rayo/Tormenta
        },
        //27 DATO CURIOSO
        {
            tipo: 'dato_curioso',
            titulo: '👴 El Maestro del Molino',

            descripcion: 'En Mariano Acosta, Don Luis es una leyenda viva. A pesar de su avanzada edad, explica con pasión cómo funciona su antiguo Molino de Piedra. ¡Gracias a él y a su harina, las "empanadas de viento" de la zona son famosas y deliciosas!',

        },

        // 28 trampa

        {
            tipo: 'evento',
            subtipo: 'trampa_movimiento',
            titulo: '🦆 ¡Patos bravos!',
            descripcion: 'Unos gansos guardianes del molino te persiguieron por el sendero. ¡A correr! Retrocedes 2 casillas.',
            movimiento: -2
        },
        // 29.MOLINO DE PIEDRA
        {
            tipo: 'lugar_emblematico',
            titulo: 'Molino de Piedra',
            imagen: 'assets/imagenes/lugares/nivel3/molino_depiedra.png',
            item: 'molinodepiedra'
        },
        //23 TRAMPA

        {
            tipo: 'evento',
            subtipo: 'trampa_puntos',
            titulo: '🥖 ¡Pan de leña!',
            descripcion: 'El olor te venció y gastaste tus monedas en pan recién horneado. Pierdes 30 puntos.',
            pointsLost: 30
        },
        // 31 dato curioso
        {
            tipo: 'dato_curioso',
            titulo: '⚒️ Los Escultores de Ruedas',

            descripcion: 'La tierra aquí es tan buena para los granos que la gente tuvo que ingeniárselas. Lo impresionante es que los artesanos locales no compran máquinas: ¡ellos mismos tallan a mano las rocas gigantes para convertirlas en ruedas de molino perfectas!',


        },
        // 32 LEYENDA MOLINO DE PIEDRA
        {
            tipo: 'leyenda',
            titulo: '🌊 El Secreto del Mar en la Montaña',

            // Historia real: Salinas se llama así por sus minas de sal. 
            // La leyenda geológica/mítica dice que el mar dejó su espíritu allí.
            historia: 'Hace miles de años, dicen que el Mar se enamoró de estas montañas y, antes de irse, les dio un beso salado. Por eso, aunque estamos lejos de la playa, en Salinas la tierra llora agua de sal y el viento tiene sabor a océano.',

            instruccion: 'Recoge la sal (🧂) del valle. ¡Sé rápido antes de que el Sol (☀️) te canse!',
            icono_oculto: '🧂',
            icono_ganador: '🌊',  // La ola (el espíritu del mar)
            icono_perdedor: '☀️'  // El sol fuerte del Valle del Chota
        },
        // 33 PREGUNTA ALEATORIA 
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'molino_piedra',
            titulo: '🥖 El Secreto de Don Luis',
            descripcion: '¡Las ruedas de piedra te desafían! Demuestra tu fuerza y sabiduría.',
        },
        // 34 Minijuego: CUATRO IMAGENES
        {
            tipo: 'minijuego',
            subtipo: 'cuatro_imagenes',
            modo: 'aleatorio',
            titulo: '⌛ Reliquia de Pimampiro',

            // Pregunta reducida
            pregunta: 'En Mariano Acosta, esta reliquia muele granos usando la fuerza del agua. ¿Cuál es?',

            imagenCorrecta: 'assets/imagenes/minijuego/molinodepiedra.png',
        },
        //35 DATO CURIOSO PARROQUI SALINAS
        {
            tipo: 'dato_curioso',
            titulo: '🧂 El Secreto de las Guardianas de la Sal',

            // Basado en el segundo párrafo de tu imagen:
            // Resalta el "conocimiento ancestral", el "filtrado y cocción" y las "mujeres afrodescendientes".
            descripcion: '¿Sabías que la sal no solo viene del mar? En Salinas, las mujeres afrodescendientes conservan un tesoro ancestral: saben cómo "sacar sal de la tierra". Usan una técnica antigua de filtrado y cocción en ollas para obtener este mineral, manteniendo vivo el patrimonio de sus abuelos.',

        },
        // 36  LUGAR EMBLEMATICO SALINAS
        {
            tipo: 'lugar_emblematico',
            titulo: 'Parroquia Salinas',
            imagen: 'assets/imagenes/lugares/nivel3/parroquia_salinas.png',
            item: 'canadeazucar'
        },
        //37 LEYENDA GLOBAL IMBABURA 

        {
            tipo: 'leyenda',
            titulo: '🏔️ El Romance de los Volcanes',

            historia: 'Hace mucho tiempo, el joven Taita Imbabura se enamoró de la bella Mama Cotacachi. De su amor eterno nació un hijo: el cerro Yanaurco. Hoy, cuando las nubes se despejan, se miran frente a frente protegiendo nuestras lagunas y sembrados.',

            instruccion: 'Une los Corazones (❤️) de la familia. ¡Evita la Neblina (🌫️)!',
            icono_oculto: '❤️',
            icono_ganador: '🏔️',  // La familia de montañas (Imbabura, Cotacachi, Yanaurco)
            icono_perdedor: '🌫️'   // La neblina/nube baja
        },
        // 38 PREGUNTA ALEATORIA 
        {
            tipo: 'pregunta_aleatoria',
            categoria: 'parroquia_salinas',
            titulo: '🧂 Sal de Tierra',
            descripcion: '¡Descubre el secreto de las guardianas de la sal para ganar!',
        },

        // 39. VENTAJA 
        {
            tipo: 'evento',
            subtipo: 'ventaja_movimiento',
            titulo: '🏁 ¡Meta a la Vista!',
            descripcion: 'La adrenalina te impulsa. ¡Das el salto final hacia la victoria!',
            movimiento: 1
        },

        //40
        { tipo: 'fin', titulo: '¡Leyenda de Imbabura!', descripcion: 'Has conquistado la Ruta Ancestral. Eres un experto viajero.', recompensa: { puntos: 500, trofeo: 'Gran Explorador' } }
    ];



const PREGUNTAS = [
    // --- SALINAS DE IBARRA ---
    {
        id: 1,
        categoria: 'parroquia_salinas',
        pregunta: "La temperatura promedio de Salinas de Ibarra es:",
        opciones: ["19°C", "25°C", "12°C", "8°C"],
        correcta: 0 // 19°C
    },
    {
        id: 2,
        categoria: 'parroquia_salinas',
        pregunta: "El tren que llegaba hasta Salinas fue conocido como:",
        opciones: ["Libertad", "Andino", "Salinas", "Del Norte"],
        correcta: 0 // Libertad
    },
    {
        id: 3,
        categoria: 'parroquia_salinas',
        pregunta: "En el valle de Salinas prevalece población:",
        opciones: ["Mestiza", "Afrodescendiente", "Indígena", "Montubia"],
        correcta: 1 // Afrodescendiente
    },

    // --- CASCADA TAXOPAMBA ---
    {
        id: 4,
        categoria: 'cascada_taxopamba',
        pregunta: "La cascada Taxopamba está localizada en el cantón:",
        opciones: ["Antonio Ante", "Otavalo", "Cotacachi", "Ibarra"],
        correcta: 1 // Otavalo
    },
    {
        id: 5,
        categoria: 'cascada_taxopamba',
        pregunta: "Para llegar a la cascada Taxopamba debe llegar a la comunidad:",
        opciones: ["El Topo", "Araque", "Mojandita", "Peguche"],
        correcta: 2 // Mojandita
    },
    {
        id: 6,
        categoria: 'cascada_taxopamba',
        pregunta: "La altura combinada de la caída de agua de Taxopamba es:",
        opciones: ["25m", "10m", "15m", "35m"],
        correcta: 0 // 25m
    },

    // --- CARA DEL DIOS DE INTAG ---
    {
        id: 7,
        categoria: 'intag',
        pregunta: "La Cara del Dios de Intag está localizada en el cantón:",
        opciones: ["Ibarra", "Cotacachi", "Urcuquí", "Otavalo"],
        correcta: 1 // Cotacachi
    },
    {
        id: 8,
        categoria: 'intag',
        pregunta: "La Cara del Dios de Intag está en la parroquia rural:",
        opciones: ["García Moreno", "Peñaherrera", "Apuela", "Cuellaje"],
        correcta: 2 // Apuela
    },
    {
        id: 9,
        categoria: 'intag',
        pregunta: "En la cima de la Cara del Dios de Intag está la comunidad:",
        opciones: ["Pueblo Viejo", "Pueblo Nuevo", "Monteolivo", "Chalguayacu"],
        correcta: 0 // Pueblo Viejo
    },

    // --- CHALTURA Y EL CUY ---
    {
        id: 10,
        categoria: 'cuy_chaltura',
        pregunta: "El cuy es un plato propio de la gastronomía de la región:",
        opciones: ["Costa", "Sierra", "Oriente", "Insular"],
        correcta: 1 // Sierra
    },
    {
        id: 11,
        categoria: 'cuy_chaltura',
        pregunta: "La parroquia rural de Chaltura está localizada en el cantón:",
        opciones: ["Ibarra", "Otavalo", "Antonio Ante", "Urcuquí"],
        correcta: 2 // Antonio Ante
    },
    {
        id: 12,
        categoria: 'cuy_chaltura',
        pregunta: "La edad apropiada de faenamiento del cuy es:",
        opciones: ["tres meses", "cuatro meses", "cinco meses", "seis meses"],
        correcta: 0 // tres meses
    },

    // --- CASCADA CONRAYARO ---
    {
        id: 13,
        categoria: 'cascada_conrayaro',
        pregunta: "La cascada Conrayaro está localizada en el cantón:",
        opciones: ["Cotacachi", "Urcuquí", "Pimampiro", "Antonio Ante"],
        correcta: 1 // Urcuquí
    },
    {
        id: 14,
        categoria: 'cascada_conrayaro',
        pregunta: "Para llegar a la cascada Conrayaro debe pasar por las termas:",
        opciones: ["Nangulví", "Chachimbiro", "Timbuyacu", "Santa Agua"],
        correcta: 2 // Timbuyacu
    },
    {
        id: 15,
        categoria: 'cascada_conrayaro',
        pregunta: "La cascada Conrayaro está dentro del polígono del complejo volcánico:",
        opciones: ["Imbabura", "Cubilche", "Chachimbiro", "Cotacachi"],
        correcta: 2 // Chachimbiro
    },

    // --- MOLINO DE PIEDRA ---
    {
        id: 16,
        categoria: 'molino_piedra',
        pregunta: "El molino de piedra funciona a base de:",
        opciones: ["Energía eléctrica", "Manivela", "Agua", "Viento"],
        correcta: 2 // Agua
    },
    {
        id: 17,
        categoria: 'molino_piedra',
        pregunta: "El molino de piedra sirve para triturar:",
        opciones: ["Caña de azúcar", "Granos", "Carnes", "Hierbas"],
        correcta: 1 // Granos
    },
    {
        id: 18,
        categoria: 'molino_piedra',
        pregunta: "El Molino de piedra se encuentra localizado en la parroquia:",
        opciones: ["Sigsipamba", "Chugá", "Mariano Acosta", "Ambuquí"],
        correcta: 2 // Mariano Acosta
    }
];

// 3. RECOMPENSAS NIVEL 2
const RECOMPENSAS = [
    { key: 'caraintag', src: 'assets/imagenes/recompensas/caraintag.png', color: '#FFDCE0' },
    { key: 'cuychaltura', src: 'assets/imagenes/recompensas/cuychaltura.png', color: '#B2DFDB' },
    { key: 'cascadataxopamba', src: 'assets/imagenes/recompensas/cascadataxopamba.png', color: '#D7CCC8' },
    { key: 'molinodepiedra', src: 'assets/imagenes/recompensas/molinodepiedra.png', color: '#E3F2FD' },
    { key: 'cascadaconrayaro', src: 'assets/imagenes/recompensas/cascadaconrayaro.png', color: '#FAFAFA' },
    { key: 'canadeazucar', src: 'assets/imagenes/recompensas/canadeazucar.png', color: '#FAFAFA' }
];
// 4. MINI-JUEGO (PAREJAS) - SOLO NIVEL 3
const PAREJAS = [
    // --- 🚂 PARA EL CALOR DE SALINAS ---
    { izquierda: '🎟️ Boleto de Tren', derecha: 'Estación de la Libertad' },
    { izquierda: '🥁 Tambor de Bomba', derecha: 'Ritmo Afrodescendiente' },
    { izquierda: '🧢 Gorra para el Sol', derecha: 'Valle de Salinas (19°C)' },

    // --- 🐹 PARA EL SABOR DE CHALTURA ---
    { izquierda: '🍽️ Plato de Barro', derecha: 'Cuy Asado con Papas' },
    { izquierda: '🌿 Atado de Alfalfa', derecha: 'Alimentar a los Cuyes' },
    { izquierda: '🌽 Maíz Tostado', derecha: 'Entrada Tradicional' },

    // --- 💦 PARA LAS CASCADAS (Taxopamba y Conrayaro) ---
    { izquierda: '🥾 Botas de Trekking', derecha: 'Sendero a Taxopamba' },
    { izquierda: '🧖 Toalla Seca', derecha: 'Termas Timbuyacu' },
    { izquierda: '📸 Cámara Impermeable', derecha: 'Foto en Conrayaro' },

    // --- 🗿 PARA EL MISTERIO DE INTAG ---
    { izquierda: '☕ Termo de Café', derecha: 'Aroma de Intag' },
    { izquierda: '🔭 Binoculares', derecha: 'Ver la Cara del Dios' },
    { izquierda: '☁️ Repelente', derecha: 'Selva de Apuela' },

    // --- 🌾 PARA LA HISTORIA (MOLINO DE PIEDRA) ---
    { izquierda: '🌾 Costal de Trigo', derecha: 'Molino de Mariano Acosta' },
    { izquierda: '💧 Rueda de Agua', derecha: 'Energía Hidráulica' },
    { izquierda: '🕰️ Reloj Antiguo', derecha: 'Historia de 100 Años' }
];

// 5. VIDEOS NIVEL 3
const VIDEOS = {
    intro: 'assets/video/nivel3/intro_nivel3.mp4',
    fin: 'assets/video/nivel3/fin_nivel3.mp4'
};


// EXPORTACIÓN
export const NIVEL_3_DATA = {
    coordenadas: COORDENADAS,
    casillas: CASILLAS,
    preguntas: PREGUNTAS,
    recompensas: RECOMPENSAS,
    parejas: PAREJAS,
    videos: VIDEOS
};