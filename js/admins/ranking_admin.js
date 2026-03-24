// =========================================================
// 🏆 MÓDULO: RANKING GLOBAL
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================

// 1. IMPORTACIONES (Subimos un nivel con '../' para encontrar firebase.js)
import { db } from "../firebase.js"; 
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Variable global para almacenar los datos del ranking y poder filtrarlos rápido en memoria
let globalScoreData = [];

// --- FUNCIÓN PRINCIPAL: CARGAR SCORE GLOBAL ---
window.cargarScoreGlobal = async function() {
    const cuerpo = document.getElementById('cuerpo-tabla-score');
    const total = document.getElementById('total-registros-score');
    globalScoreData = [];

    // Mensaje de carga inicial
    if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="8" style="text-align:center">🔄 Conectando con Ranking Público...</td></tr>';

    try {
        // Traemos el ranking ordenado por puntuación de mayor a menor
        const q = query(collection(db, "ranking_publico"), orderBy("puntuacion_total", "desc"));
        const snap = await getDocs(q);

        if(total) total.innerHTML = snap.size;

        // Limpiamos y preparamos el acumulador de texto
        if(cuerpo) cuerpo.innerHTML = '';
        let htmlFinal = "";

        // Si no hay datos, mostramos un mensaje
        if (snap.empty) {
            cuerpo.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#666;">No hay jugadores en el ranking aún.</td></tr>';
            return;
        }

        // 1. Guardar en memoria y procesar cada documento
        snap.forEach(doc => {
            const d = doc.data();
            const lvls = d.estado_niveles || {};
            globalScoreData.push({
                cedula: doc.id,
                nombre: d.nombre || "Anónimo",
                total: d.puntuacion_total || 0,
                n1: lvls.nivel_1?.puntos || 0,
                n2: lvls.nivel_2?.puntos || 0,
                n3: lvls.nivel_3?.puntos || 0,
                n4: lvls.nivel_4?.puntos || 0
            });
        });

        // 2. 🚀 OPTIMIZACIÓN: Construir el HTML en una variable
        globalScoreData.forEach((j, i) => {
            // Un pequeño detalle visual: color especial para el Top 3
            let colorPuesto = "";
            let iconoTop = `#${i+1}`;
            if (i === 0) { colorPuesto = "background-color: #fff8e1; font-weight: bold;"; iconoTop = "🥇 1"; }
            if (i === 1) { colorPuesto = "background-color: #fafafa;"; iconoTop = "🥈 2"; }
            if (i === 2) { colorPuesto = "background-color: #fbe9e7;"; iconoTop = "🥉 3"; }

            htmlFinal += `
                <tr style="${colorPuesto}">
                    <td style="text-align:center;">${iconoTop}</td>
                    <td>${j.cedula}</td>
                    <td><strong>${j.nombre}</strong></td>
                    <td class="score-total" style="font-weight:bold; color:var(--color-sidebar); text-align:center;">${j.total}</td>
                    <td style="text-align:center;">${j.n1}</td>
                    <td style="text-align:center;">${j.n2}</td>
                    <td style="text-align:center;">${j.n3}</td>
                    <td style="text-align:center;">${j.n4}</td>
                </tr>`;
        });

        // 3. UNA ÚNICA INYECCIÓN AL DOM
        if(cuerpo) cuerpo.innerHTML = htmlFinal;

    } catch (e) {
        console.error("Error cargando el ranking global:", e);
        if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="8" style="color:red; text-align:center;">⛔ Error cargando scores. Revisa la consola.</td></tr>';
    }
}

// --- FILTROS PARA EL RANKING ---

window.filtrarScore = function() {
    const inputFiltro = document.getElementById('filtro-score-texto');
    if (!inputFiltro) return;

    const texto = inputFiltro.value.toUpperCase();
    const filas = document.querySelectorAll('#cuerpo-tabla-score tr');
    let contador = 0;

    filas.forEach(fila => {
        const txtFila = fila.innerText.toUpperCase();
        if(txtFila.includes(texto)) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });

    const labelTotal = document.getElementById('total-registros-score');
    if(labelTotal) labelTotal.innerText = contador;
}

window.filtrarTop10 = function() {
    // Limpiamos el texto de búsqueda si el usuario presiona "Ver Top 10"
    const inputFiltro = document.getElementById('filtro-score-texto');
    if (inputFiltro) inputFiltro.value = "";

    const filas = document.querySelectorAll('#cuerpo-tabla-score tr');
    let contador = 0;

    filas.forEach((fila, index) => {
        // index < 10 porque el index empieza en 0 (del 0 al 9 son los primeros 10)
        if (index < 10) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });

    const labelTotal = document.getElementById('total-registros-score');
    if(labelTotal) labelTotal.innerText = contador;
}

window.limpiarFiltrosScore = function() {
    const inputFiltro = document.getElementById('filtro-score-texto');
    if (inputFiltro) inputFiltro.value = "";
    
    // Al llamar a filtrarScore con el input vacío, se volverán a mostrar todos
    window.filtrarScore(); 
}

// --- EXPORTAR RANKING A EXCEL ---
window.exportarExcelScore = function() {
    const tabla = document.getElementById("tabla-score");
    if(!tabla) {
        alert("No se encontró la tabla de ranking para exportar.");
        return; 
    }

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                th { background-color: #1B5E20; color: white; padding: 10px; text-align: center; border: 1px solid #ccc; }
                td { padding: 8px; border: 1px solid #ccc; }
            </style>
        </head> 
        <body>
            <h3 style="color:#1B5E20;">Ranking Global - Te Vivo Imbabura</h3>
            <p>Generado el: ${new Date().toLocaleDateString('es-EC')}</p>
            <table>${tabla.innerHTML}</table>
        </body>
        </html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    
    // Nombre del archivo dinámico con la fecha
    a.download = `Ranking_Global_Imbabura_${new Date().toISOString().slice(0,10)}.xls`;
    
    a.click(); 
    URL.revokeObjectURL(url);
}