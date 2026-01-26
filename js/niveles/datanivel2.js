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

const CASILLAS= // Contenido para el Nivel 2 (36 casillas en total)
[
    // 0. INICIO (Solicitado)
    { tipo: 'inicio', titulo: 'Rutas Ancestrales', descripcion: 'Inicias el recorrido por los tesoros de la Ruta 2.', recompensa: null },

    // 1-3. Camino y Desafíos
    { tipo: 'camino', titulo: 'Sendero de Ibarra', descripcion: 'Caminas con tranquilidad.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'tres_imagenes', titulo: '👁️ Ojo de Águila', pregunta: '¿Cuál es el Volcán Cubilche?', opcionesImagenes: ['assets/lugares/nivel2/volcan_cubilche.jpg', 'assets/lugares/nivel2/volcan1.jpeg', 'assets/lugares/nivel2/volcan2.jpg', 'assets/lugares/nivel2/volcan3.jpg'], indiceCorrecto: 0, recompensa: { puntos: 50 } },
    { tipo: 'camino', titulo: 'Paso de Montaña', descripcion: 'El aire es más puro aquí.', recompensa: null },
   
    // 4. LUGAR EMBLEMÁTICO (Solicitado)
    { tipo: 'lugar_emblematico', titulo: 'Volcán Cubilche', imagen: 'assets/lugares/nivel2/volcan_cubilche.jpg', descripcion: 'Cerro sagrado de energía renovadora.', recompensa: { puntos: 100, item: 'piedra_sagrada' } },

    // 
    { tipo: 'camino', titulo: 'Ruta de los Lagos', descripcion: 'Divisas el valle a lo lejos.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'tres_imagenes', titulo: '👁️ Ojo de Águila', pregunta: '¿Cuál es el Sendero Artezón?', opcionesImagenes: ['assets/lugares/nivel2/sendero1.jpeg', 'assets/lugares/nivel2/sendero_artezon.jpg', 'assets/lugares/nivel2/sendero2.jpeg', 'assets/lugares/nivel2/sendero3.jpg' ], indiceCorrecto: 1, recompensa: { puntos: 50 } },
    { tipo: 'camino', titulo: 'Vereda de Piedra', descripcion: 'Sigue el rastro ancestral.', recompensa: null },
 { tipo: 'camino', titulo: 'Ruta de los Lagos', descripcion: 'Divisas el valle a lo lejos.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'tres_imagenes', titulo: '👁️ Ojo de Águila', pregunta: '¿Cuál es el Sendero Artezón?', opcionesImagenes: ['assets/lugares/nivel2/sendero1.jpeg', 'assets/lugares/nivel2/sendero_artezon.jpg', 'assets/lugares/nivel2/sendero2.jpeg', 'assets/lugares/nivel2/sendero3.jpg' ], indiceCorrecto: 1, recompensa: { puntos: 50 } },
  
    // 10. LUGAR EMBLEMÁTICO (Solicitado)
    { tipo: 'lugar_emblematico', titulo: 'Sendero El Artezón', imagen: 'assets/lugares/nivel2/sendero_artezon.jpg', descripcion: 'Un camino rodeado de flora nativa única.', recompensa: { puntos: 100, item: 'baston_viajero' } },

    // . Transición
    { tipo: 'evento', subtipo: 'obstaculo', titulo: '🌫️ Niebla Densa', descripcion: 'La visibilidad baja. Avanzas con cuidado.', recompensa: null },
    { tipo: 'camino', titulo: 'Cuesta de Ibarra', descripcion: 'El esfuerzo vale la pena.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'unir_parejas', titulo: '🔗 Conexiones', descripcion: 'Une el lugar con su zona.', pares: [{ izquierda: 'Cubilche', derecha: 'Ibarra' }, { izquierda: 'Sanshipamba', derecha: 'Pimampiro' }], recompensa: { puntos: 80 } },
{ tipo: 'camino', titulo: 'Cuesta de Ibarra', descripcion: 'El esfuerzo vale la pena.', recompensa: null },
  
    // 15. LUGAR EMBLEMÁTICO (Solicitado)
    { tipo: 'lugar_emblematico', titulo: 'Talleres de Talabartería', imagen: 'assets/lugares/nivel2/talleres_talabarteria.png', descripcion: 'Arte en cuero de maestros artesanos.', recompensa: { puntos: 100, item: 'cuero_tradicional' } },

    //  Transición
    { tipo: 'camino', titulo: 'Barrio Obrero', descripcion: 'Escuchas el martilleo del cuero.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'tres_imagenes', titulo: '👁️ Ojo de Águila', pregunta: '¿Cuál es la Cascada de Peguche?', opcionesImagenes: ['assets/lugares/nivel2/cascada_peguche.jpg', 'assets/lugares/nivel2/cascada1.jpeg', 'assets/lugares/nivel2/cascada2.jpg', 'assets/lugares/nivel2/cascada3.jpg' ], indiceCorrecto: 0, recompensa: { puntos: 50 } },
    { tipo: 'evento', subtipo: 'descanso', titulo: '☕ Pausa Térmica', descripcion: 'Recuperas energías en un paradero.', recompensa: { puntos: 20 } },

    // 19. LUGAR EMBLEMÁTICO (Solicitado)
    { tipo: 'lugar_emblematico', titulo: 'Cascada de Peguche', imagen: 'assets/lugares/nivel2/cascada_peguche.jpg', descripcion: 'Salto de agua ritual y sagrado.', recompensa: { puntos: 100, item: 'agua_pura' } },

    //  Tramo largo de retos
    { tipo: 'camino', titulo: 'Camino de los Incas', descripcion: 'Pisas historia pura.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'tres_imagenes', titulo: '👁️ Ojo de Águila', pregunta: '¿Dónde está Sanshipamba?', opcionesImagenes: ['assets/lugares/nivel2/sanshipamba.jpg', 'assets/lugares/nivel2/volcan_cubilche.jpg', 'assets/lugares/nivel2/alleres.png'], indiceCorrecto: 0, recompensa: { puntos: 50 } },
    { tipo: 'camino', titulo: 'Ruta de Pimampiro', descripcion: 'Te acercas a la zona agrícola.', recompensa: null },
    { tipo: 'evento', subtipo: 'retroceder_rival', titulo: '🌪️ Torbellino', descripcion: 'Elige a alguien para retroceder.', efecto: { cantidad: 2 }, recompensa: null },
    { tipo: 'camino', titulo: 'Laderas del Taita', descripcion: 'El sol brilla con fuerza.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'unir_parejas', titulo: '🔗 Geografía', descripcion: 'Une cantón y atractivo.', pares: [{ izquierda: 'Peguche', derecha: 'Otavalo' }, { izquierda: 'Termas', derecha: 'Urcuquí' }], recompensa: { puntos: 80 } },
    { tipo: 'camino', titulo: 'Bajada al Valle', descripcion: 'El clima se vuelve cálido.', recompensa: null },

    // 27. LUGAR EMBLEMÁTICO (Solicitado)
    { tipo: 'lugar_emblematico', titulo: 'Termas de Chachimbiro', imagen: 'assets/lugares/nivel2/termas_chachimbiro.jpg', descripcion: 'Aguas medicinales de origen volcánico.', recompensa: { puntos: 100, item: 'cristal_termal' } },

    //  Tramo final
    { tipo: 'camino', titulo: 'Ruta Medicinal', descripcion: 'Sientes el olor al azufre sanador.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'tres_imagenes', titulo: '👁️ Ojo de Águila', pregunta: '¿Reconoces las Termas?', opcionesImagenes: ['assets/lugares/nivel2/sendero_artezon.jpg', 'assets/lugares/nivel2/termas_chachimbiro.jpg', 'assets/lugares/nivel2/volcan_cubilche.jpg'], indiceCorrecto: 1, recompensa: { puntos: 50 } },
    { tipo: 'camino', titulo: 'Paso del Viento', descripcion: 'Corriente de aire fresca.', recompensa: null },
    { tipo: 'evento', subtipo: 'suerte', titulo: '🎁 Regalo del Taita', descripcion: 'Recibes puntos extra por tu perseverancia.', recompensa: { puntos: 100 } },
    { tipo: 'camino', titulo: 'Entrada a Sanshipamba', descripcion: 'Los árboles son gigantes.', recompensa: null },
    { tipo: 'minijuego', subtipo: 'unir_parejas', titulo: '🔗 Final', descripcion: 'Última conexión.', pares: [{ izquierda: 'Chachimbiro', derecha: 'Urcuquí' }, { izquierda: 'Talabartería', derecha: 'Ibarra' }], recompensa: { puntos: 80 } },
    { tipo: 'camino', titulo: 'Último Esfuerzo', descripcion: 'Ya casi llegas al corazón del bosque.', recompensa: null },

    // 35. LUGAR EMBLEMÁTICO (Solicitado)
    { tipo: 'lugar_emblematico', titulo: 'Bosque Sanshipamba', imagen: 'assets/lugares/nivel2/sanshipamba_pimampiro.jpg', descripcion: 'Pulmón biodiverso de Pimampiro.', recompensa: { puntos: 100, item: 'semilla_nativa' } },

    // 36. Pre-meta
    { tipo: 'camino', titulo: 'Camino de Gloria', descripcion: 'La meta está a la vista.', recompensa: null },

    // 37. META (Solicitado)
    { tipo: 'fin', titulo: '¡Leyenda de Imbabura!', descripcion: 'Has conquistado la Ruta Ancestral. Eres un experto viajero.', recompensa: { puntos: 500, trofeo: 'Gran Explorador' } }
];
// 3. EXPORTAR
export const NIVEL_2_DATA = {
    coordenadas: COORDENADAS,
    casillas: CASILLAS
};