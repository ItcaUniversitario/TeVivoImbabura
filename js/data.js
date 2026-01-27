// ==========================================
// ARCHIVO: js/data.js
// ==========================================

// 1. IMPORTACIONES DE NIVELES
import { NIVEL_1_DATA } from './niveles/datanivel1.js';
import { NIVEL_2_DATA } from './niveles/datanivel2.js';
// Cuando crees el nivel 3, importarás aquí:
// import { NIVEL_3_DATA } from './niveles/datanivel3.js'; 


// 2. CONFIGURACIÓN DE RECOMPENSAS
export const RECOMPENSAS_DATA = [
    { key: 'helado', src: 'assets/recompensas/helado.png', color: '#FFDCE0' },
    { key: 'arbol', src: 'assets/recompensas/arbol.png', color: '#B2DFDB' },
    { key: 'poncho', src: 'assets/recompensas/poncho.png', color: '#D7CCC8' },
    { key: 'canoa', src: 'assets/recompensas/canoa.png', color: '#E3F2FD' },
    { key: 'algodon', src: 'assets/recompensas/algodon.png', color: '#FAFAFA' },
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

export const URL_GIF_VICTORIA = "assets/video/gif_finpartida.gif";
export const URL_MUSICA_FONDO = 'assets/audio/audio_tevivoimbabura.mp3';

// 4. MAPAS DE CONEXIÓN (COORDENADAS)
export const MAPA_COORDENADAS_POR_NIVEL = {
    1: NIVEL_1_DATA.coordenadas,
    2: NIVEL_2_DATA.coordenadas,
    3: [], // Pendiente Nivel 3
    4: []  // Pendiente Nivel 4
};

// 5. CONTENIDO DE CASILLAS
export const CONTENIDO_CASILLAS_POR_NIVEL = {
    1: NIVEL_1_DATA.casillas,
    2: NIVEL_2_DATA.casillas,
    3: [], // Pendiente Nivel 3
    4: []  // Pendiente Nivel 4
};

// 6. VIDEOS POR NIVEL (INTRO Y FIN)
export const VIDEOS_POR_NIVEL = {
    1: {
        intro: 'assets/video/nivel1/intro_nivel1.mp4',
        fin:   'assets/video/nivel1/fin_nivel1.mp4'
    },
    2: {
        intro: 'assets/video/nivel2/intro_nivel2.mp4',
        fin:   'assets/video/nivel2/fin_nivel2.mp4'
    },
    3: {
        intro: 'assets/video/nivel3/intro_nivel3.mp4',
        fin:   'assets/video/nivel3/fin_nivel3.mp4'
    },
    4: {
        intro: 'assets/video/nivel4/intro_nivel4.mp4',
        fin:   'assets/video/nivel4/fin_nivel4.mp4'
    }
};