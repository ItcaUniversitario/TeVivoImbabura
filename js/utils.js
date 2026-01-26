// js/utils.js
import { RECOMPENSAS_DATA } from './data.js';
import { CONTENIDO_CASILLAS_POR_NIVEL } from './data.js';

export function precargarImagenes(nivel) {
    console.log("⏳ Precargando imágenes...");
    const imagenesParaCargar = [];

    // 1. Cargar imágenes de recompensas
    RECOMPENSAS_DATA.forEach(r => imagenesParaCargar.push(r.src));

    // 2. Cargar imágenes de las casillas del nivel actual
    const casillas = CONTENIDO_CASILLAS_POR_NIVEL[nivel];
    if (casillas) {
        casillas.forEach(c => {
            if (c.imagen) imagenesParaCargar.push(c.imagen);
        });
    }

    // 3. El truco del navegador para guardar en caché
    imagenesParaCargar.forEach(src => {
        const img = new Image();
        img.src = src; 
    });
}