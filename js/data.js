// ==========================================
// ARCHIVO: js/data.js
// ==========================================

// 1. IMPORTACIONES DE NIVELES
import { NIVEL_1_DATA } from './niveles/datanivel1.js';
import { NIVEL_2_DATA } from './niveles/datanivel2.js';
import { NIVEL_3_DATA } from './niveles/datanivel3.js';
import { NIVEL_4_DATA } from './niveles/datanivel4.js';

// 2. CONFIGURACIÓN DE RECOMPENSAS
export const RECOMPENSAS_DATA = [
    ...NIVEL_1_DATA.recompensas,
    ...NIVEL_2_DATA.recompensas,
    ...NIVEL_3_DATA.recompensas,
    ...NIVEL_4_DATA.recompensas


];

// 3. CONFIGURACIÓN VISUAL (DADO Y MEDIA)
export const ROTACIONES_FINAL = {
    1: 'rotateY(0deg) rotateX(0deg)',      // Muestra Cara 1
    2: 'rotateY(-90deg) rotateX(0deg)',    // Muestra Cara 2
    3: 'rotateY(-180deg) rotateX(0deg)',   // Muestra Cara 3
    4: 'rotateY(90deg) rotateX(0deg)',     // Muestra Cara 4
    5: 'rotateX(-90deg) rotateY(0deg)',    // Muestra Cara 5
    6: 'rotateX(90deg) rotateY(0deg)'      // Muestra Cara 6
};
// ==========================================
// ARCHIVO: js/data.js (Agregar al final)
// ==========================================
export const BANCO_PREGUNTAS_POR_NIVEL = {
    1: NIVEL_1_DATA.preguntas,
    2: NIVEL_2_DATA.preguntas,
    3: NIVEL_3_DATA.preguntas, // ¡Aquí está la magia! Ya no ocupa espacio.
    4: NIVEL_4_DATA.preguntas
};
// BANCO GLOBAL DE IMÁGENES (Distractores reales basados en tu captura)
export const BANCO_FOTOS_TURISTICAS = [
    'assets/imagenes/minijuego/cascadapeguche.png',
    'assets/imagenes/minijuego/cascadataxopamba.png',
    'assets/imagenes/minijuego/complejovolcanicoimbabura.png',
    'assets/imagenes/minijuego/cuy.png',
    'assets/imagenes/minijuego/eltrueque.png',
    'assets/imagenes/minijuego/fabricaimbabura.png',
    'assets/imagenes/minijuego/gualiman.png',
    'assets/imagenes/minijuego/heladosrosalia.png',
    'assets/imagenes/minijuego/lagosanpablo.png',
    'assets/imagenes/minijuego/molinodepiedra.png',
    'assets/imagenes/minijuego/muchanajurumi.png',
    'assets/imagenes/minijuego/parquesenderoartezon.png',
    'assets/imagenes/minijuego/shanshipamba.png',
    'assets/imagenes/minijuego/talabarteria.png',
    'assets/imagenes/minijuego/terrazacahuasqui.png'
];


export const URL_GIF_VICTORIA = "assets/video/gif_finpartida.gif";
export const URL_MUSICA_FONDO = 'assets/audio/audio_tevivoimbabura.mp3';

// 4. MAPAS DE CONEXIÓN (COORDENADAS)
export const MAPA_COORDENADAS_POR_NIVEL = {
    1: NIVEL_1_DATA.coordenadas,
    2: NIVEL_2_DATA.coordenadas,
    3: NIVEL_3_DATA.coordenadas,
    4: NIVEL_4_DATA.coordenadas
};

// 5. CONTENIDO DE CASILLAS
export const CONTENIDO_CASILLAS_POR_NIVEL = {
    1: NIVEL_1_DATA.casillas,
    2: NIVEL_2_DATA.casillas,
    3: NIVEL_3_DATA.casillas, 
    4: NIVEL_4_DATA.casillas
};
export const BANCO_PAREJAS_GENERAL = [
    ...NIVEL_2_DATA.parejas,
    ...NIVEL_3_DATA.parejas,
    ...NIVEL_4_DATA.parejas

];

// 6. VIDEOS POR NIVEL (INTRO Y FIN)
export const VIDEOS_POR_NIVEL = {
    1: NIVEL_1_DATA.videos,
    2: NIVEL_2_DATA.videos,
    3: NIVEL_3_DATA.videos,
    4: NIVEL_4_DATA.videos
};

export const IMAGENES_ROMPECABEZAS_POR_NIVEL= {
     4: NIVEL_4_DATA.imagenesrompecabezas
};