import { RECOMPENSAS_DATA, CONTENIDO_CASILLAS_POR_NIVEL } from './data.js';
// ==========================================
// PRECARGA REAL (CORREGIDA)
// ==========================================
export async function precargarImagenes(nivel) {
    console.log(`⏳ Recopilando imágenes para el Nivel ${nivel}...`);
    
    // Usamos un SET para evitar duplicados
    const imagenesParaCargar = new Set();

    // 1. Mapa del Nivel
    imagenesParaCargar.add(`assets/imagenes/mapas/mapa_imbabura${nivel}.png`);

    // 2. Imágenes de Recompensas
    RECOMPENSAS_DATA.forEach(r => imagenesParaCargar.add(r.src));

    // 3. Imágenes de las Casillas del Nivel Actual
    const casillas = CONTENIDO_CASILLAS_POR_NIVEL[nivel];
    if (casillas) {
        casillas.forEach(c => {
            // A. Imagen principal
            if (c.imagen) imagenesParaCargar.add(c.imagen);
            
            // B. Imágenes de Minijuegos
            if (c.opcionesImagenes && Array.isArray(c.opcionesImagenes)) {
                c.opcionesImagenes.forEach(imgSrc => imagenesParaCargar.add(imgSrc));
            }
        });
    }

    console.log(`📥 Iniciando descarga de ${imagenesParaCargar.size} recursos...`);

    // 4. Convertimos las URLs en Promesas de carga
    // CORRECCIÓN: Quitamos el espacio en el nombre de la variable
    const promesasDeCarga = Array.from(imagenesParaCargar).map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(true);
            img.onerror = () => {
                console.warn(`⚠️ No se pudo cargar: ${src}`);
                resolve(false); 
            };
        });
    });

    // 5. Esperamos a que TODAS terminen
    await Promise.all(promesasDeCarga);
    console.log("✅ ¡Todas las imágenes del nivel están listas!");
}