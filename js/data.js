// js/data.js

import { NIVEL_1_DATA } from './niveles/datanivel1.js';
import { NIVEL_2_DATA } from './niveles/datanivel2.js';
// Cuando crees los otros, descomentarás estos:
// import { NIVEL_2_DATA } from './niveles/datanivel2.js'; 


export const RECOMPENSAS_DATA = [
    { key: 'helado', src: 'assets/recompensas/helado.png', color: '#FFDCE0' },
    { key: 'arbol', src: 'assets/recompensas/arbol.png', color: '#B2DFDB' },
    { key: 'poncho', src: 'assets/recompensas/poncho.png', color: '#D7CCC8' },
    { key: 'canoa', src: 'assets/recompensas/canoa.png', color: '#E3F2FD' },
    { key: 'algodon', src: 'assets/recompensas/algodon.png', color: '#FAFAFA' },
];

// Verifica que en tu data.js las rotaciones sean estas:
export const ROTACIONES_FINAL = {
    1: 'rotateY(0deg) rotateX(0deg)',      // Muestra Cara 1
    2: 'rotateY(-90deg) rotateX(0deg)',    // Muestra Cara 2
    3: 'rotateY(-180deg) rotateX(0deg)',   // Muestra Cara 3
    4: 'rotateY(90deg) rotateX(0deg)',     // Muestra Cara 4
    5: 'rotateX(-90deg) rotateY(0deg)',    // Muestra Cara 5
    6: 'rotateX(90deg) rotateY(0deg)'      // Muestra Cara 6
};
export const URL_GIF_VICTORIA = "assets/video/gif_finpartida.gif";
export const URL_VIDEO_FINAL = "assets/video/final_juego.mp4";
export const URL_MUSICA_FONDO = 'assets/audio/audio_tevivoimbabura.mp3';

// 3. MAPAS DE CONEXIÓN
export const MAPA_COORDENADAS_POR_NIVEL = {
    // Ahora sí funciona porque ya importamos NIVEL_1_DATA arriba
    1: NIVEL_1_DATA.coordenadas, 
  2: NIVEL_2_DATA.coordenadas, 
    3: [],
    4: []
};

export const CONTENIDO_CASILLAS_POR_NIVEL = {
    1: NIVEL_1_DATA.casillas, 
   2: NIVEL_2_DATA.casillas,
    3: [],
    4: []
};