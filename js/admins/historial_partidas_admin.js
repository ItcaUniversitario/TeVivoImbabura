// =========================================================
// 📜 MÓDULO: HISTORIAL DE PARTIDAS
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================

// 1. IMPORTACIONES
import { db } from "../firebase.js"; 
import { collection, query, getDocs, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Variable global para almacenar las partidas y poder filtrarlas sin volver a consultar a Firebase
let historialDataGlobal = []; 
// --- FUNCIÓN 1: CARGAR DATOS DE FIREBASE (CON SKELETON LOADER) ---
window.cargarHistorial = async function() {
    const cuerpo = document.getElementById('cuerpo-historial');
    
    // 1. 👇 LLAMADA AL SKELETON (Aparece antes de la consulta a Firebase)
    // Usamos 11 columnas (las de tu tabla) y unas 8 filas de ejemplo
    if(typeof window.mostrarSkeleton === 'function') {
        window.mostrarSkeleton('cuerpo-historial', 11, 8);
    } else {
        // Fallback por si acaso la función no carga
        if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="11" style="text-align:center">🔄 Cargando registros...</td></tr>';
    }

    try {
        // 2. Consulta a Firebase (esto toma un par de segundos)
        const q = query(collection(db, "historial_partidas"), orderBy("fecha", "desc"), limit(300)); 
        const snap = await getDocs(q);

        historialDataGlobal = []; 

        if (snap.empty) {
            if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="11" style="text-align:center">No hay partidas registradas.</td></tr>';
            return;
        }

        snap.forEach(doc => {
            const d = doc.data();
            
            historialDataGlobal.push({
                raw: d, 
                fechaObj: d.fecha && d.fecha.toDate ? d.fecha.toDate() : null,
                cedula: d.cedula || d.cedula_jugador || "",
                nombre: d.nombre || "Anónimo",
                nivel: d.nivel_jugado || d.nivel_seleccionado || d.nivel || 1, 
                puntos: d.puntos_finales || d.puntos || 0,
                busqueda: ((d.nombre || "") + " " + (d.cedula || d.cedula_jugador || "")).toUpperCase()
            });
        });

        // 3. Mandamos a filtrar y dibujar (esto reemplazará automáticamente el skeleton)
        window.aplicarFiltrosHistorial();

    } catch (error) {
        console.error("Error historial:", error);
        if(cuerpo) cuerpo.innerHTML = `<tr><td colspan="11" style="color:red; text-align:center">⛔ Error: ${error.message}</td></tr>`;
    }
}
// --- FUNCIÓN 2: LÓGICA DE FILTRADO ---
window.aplicarFiltrosHistorial = function() {
    const texto = document.getElementById('historial-busqueda')?.value.toUpperCase() || "";
    const fechaDesdeInput = document.getElementById('historial-fecha-desde')?.value || "";
    const fechaHastaInput = document.getElementById('historial-fecha-hasta')?.value || "";
    const checkUnicos = document.getElementById('check-unicos');
    const soloUnicos = checkUnicos ? checkUnicos.checked : false;

    const fechaDesde = fechaDesdeInput ? new Date(fechaDesdeInput + "T00:00:00") : null;
    const fechaHasta = fechaHastaInput ? new Date(fechaHastaInput + "T23:59:59") : null;

    let listaFiltrada = historialDataGlobal.filter(item => {
        if (!item.busqueda.includes(texto)) return false;
        if (item.fechaObj) {
            if (fechaDesde && item.fechaObj < fechaDesde) return false;
            if (fechaHasta && item.fechaObj > fechaHasta) return false;
        }
        return true;
    });

    // FILTRO ESPECIAL: Solo última partida
    if (soloUnicos) {
        const mapaUnicos = new Map();
        listaFiltrada.forEach(item => {
            if (!mapaUnicos.has(item.cedula)) {
                mapaUnicos.set(item.cedula, item);
            }
        });
        listaFiltrada = Array.from(mapaUnicos.values());
    }

    renderizarTablaHistorial(listaFiltrada);
}

// --- FUNCIÓN 3: DIBUJAR LA TABLA (SÚPER OPTIMIZADA) ---
function renderizarTablaHistorial(listaDatos) {
    const cuerpo = document.getElementById('cuerpo-historial');
    if (!cuerpo) return;
    
    // 🚀 OPTIMIZACIÓN 2: Limpiamos y usamos una variable de texto. ¡Adiós cuelgues!
    cuerpo.innerHTML = '';
    let htmlFinal = '';

    if (listaDatos.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="11" style="text-align:center; color:#666;">No se encontraron coincidencias.</td></tr>';
        return;
    }

    listaDatos.forEach(item => {
        const d = item.raw; 
        
        // FECHA Y DURACIÓN
        let fechaTexto = "S/F";
        let duracionTexto = "-";
        if (item.fechaObj) {
            fechaTexto = item.fechaObj.toLocaleString('es-EC', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            if (d.fecha_fin && d.fecha_fin.toDate) {
                const diffMs = d.fecha_fin.toDate() - item.fechaObj;
                const mins = Math.floor(diffMs / 60000);
                const secs = Math.floor((diffMs % 60000) / 1000);
                duracionTexto = `${mins}m ${secs}s`;
            }
        }

        // QUIZZES (Helper function)
        const generarCelda = (quizArray, tipo) => {
            if (!quizArray || !Array.isArray(quizArray) || quizArray.length === 0) return '<span style="color:#ccc;font-size:0.8rem">-</span>';
            const aciertos = quizArray.filter(p => p.es_correcta).length;
            const total = quizArray.length;
            let color = aciertos === total ? '#2e7d32' : (aciertos > 0 ? '#f57f17' : '#c62828');
            const dataStr = encodeURIComponent(JSON.stringify(quizArray)).replace(/'/g, "%27");
            
            return `<div style="display:flex; flex-direction:column; align-items:center;">
                <strong style="color:${color}; font-size:0.9rem;">${aciertos}/${total}</strong>
                <button class="btn-ver-quiz" onclick="abrirModalQuiz('${dataStr}', '${tipo}')">👁️ Ver</button>
            </div>`;
        };

        const celdaQuizIni = generarCelda(d.quiz_inicial, 'Inicial');
        const celdaQuizFin = generarCelda(d.quiz_final, 'Final');

        // PUNTOS
        let puntosHTML = `<span style="font-weight:bold;">${d.puntos_finales || 0}</span>`;
        if (d.detalle_puntos) puntosHTML += `<br><span style="font-size:0.7rem; color:#666">Base:${d.detalle_puntos.juego_base||0} | Bono:${d.detalle_puntos.bono_items||0}</span>`;

        // POSICIÓN
        let posHTML = d.posicion_llegada || '-';
        if(d.posicion_llegada===1) posHTML='🥇 1';
        if(d.posicion_llegada===2) posHTML='🥈 2';
        if(d.posicion_llegada===3) posHTML='🥉 3';

        const nivelLabel = item.nivel || 1;
        const colorNivel = nivelLabel > 1 ? '#E65100' : '#2E7D32'; 

        // ACUMULAMOS EN EL STRING (En vez de tocar el DOM directamente)
        htmlFinal += `
        <tr>
            <td><small>${fechaTexto}</small></td>
            <td>
                <b>${item.nombre}</b><br>
                <small style="color:#666">${item.cedula}</small>
            </td>
            <td>${d.ficha_nombre || '-'}</td>
            <td><span class="badge-modo">${d.modo || '-'}</span></td>
            
            <td style="text-align:center;">
                <span style="background-color:${colorNivel}; color:white; padding:3px 8px; border-radius:10px; font-size:0.85rem; font-weight:bold;">
                     ${nivelLabel}
                </span>
            </td>

            <td style="font-family:monospace;">${duracionTexto}</td>
            <td style="text-align:center;">${posHTML}</td>
            <td>${puntosHTML}</td>
            <td style="text-align:center;">${celdaQuizIni}</td>
            <td style="text-align:center;">${celdaQuizFin}</td>
            <td><small>${d.estado || '-'}</small></td>
        </tr>`;
    });

    // UNA ÚNICA INYECCIÓN AL FINAL
    cuerpo.innerHTML = htmlFinal;
}

// --- LIMPIAR FILTROS ---
window.limpiarFiltrosHistorial = function() {
    const busqueda = document.getElementById('historial-busqueda');
    const fDesde = document.getElementById('historial-fecha-desde');
    const fHasta = document.getElementById('historial-fecha-hasta');
    const check = document.getElementById('check-unicos');

    if(busqueda) busqueda.value = "";
    if(fDesde) fDesde.value = "";
    if(fHasta) fHasta.value = "";
    if(check) check.checked = false;

    window.aplicarFiltrosHistorial();
}

// =========================================================
// 👁️ FUNCIONES DE LA VENTANA MODAL (QUIZZES)
// =========================================================

window.abrirModalQuiz = function(datosCodificados, tituloQuiz) {
    const preguntas = JSON.parse(decodeURIComponent(datosCodificados));
    const modal = document.getElementById('modal-quiz');
    const tituloEl = document.getElementById('modal-titulo');
    const cuerpoEl = document.getElementById('modal-body');

    if(!modal || !tituloEl || !cuerpoEl) return;

    tituloEl.innerText = `Detalle: Quiz ${tituloQuiz}`;
    let modalHTML = ''; 

    preguntas.forEach((p, i) => {
        const esCorrecta = p.es_correcta === true;
        const claseColor = esCorrecta ? 'borde-verde' : 'borde-rojo';
        const icono = esCorrecta ? '✅ Correcto' : '❌ Incorrecto';
        const respuestaUser = p.respuesta_usuario || 'No respondió';

        modalHTML += `
            <div class="card-pregunta ${claseColor}">
                <div style="font-weight:bold; margin-bottom:5px; color:#333;">
                    ${i + 1}. ${p.pregunta}
                </div>
                <div style="font-size:0.9rem; color:#555;">
                    Respuesta: <i>"${respuestaUser}"</i>
                </div>
                <div style="margin-top:8px; font-weight:bold; font-size:0.85rem; color:${esCorrecta ? 'green' : 'red'}">
                    ${icono}
                </div>
            </div>`;
    });

    cuerpoEl.innerHTML = modalHTML;
    modal.style.display = 'flex';
}

window.cerrarModalQuiz = function() {
    const modal = document.getElementById('modal-quiz');
    if(modal) modal.style.display = 'none';
}

// Cerrar al dar click afuera (Event Listener no destructivo)
window.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-quiz');
    if (e.target === modal) {
        window.cerrarModalQuiz();
    }
});

// =========================================================
// 📊 EXPORTAR HISTORIAL A EXCEL
// =========================================================
window.exportarExcelHistorial = function() {
    const tablaOriginal = document.getElementById("tabla-historial");
    if (!tablaOriginal) return alert("No se encontró la tabla para exportar.");

    const tablaClon = tablaOriginal.cloneNode(true);

    const formatearQuizParaExcel = (btnElement) => {
        try {
            const rawOnClick = btnElement.getAttribute('onclick'); 
            if (!rawOnClick) return "Sin datos";

            const partes = rawOnClick.split("'");
            if (!partes[1]) return "Error formato"; 

            const dataEncoded = partes[1];
            const preguntas = JSON.parse(decodeURIComponent(dataEncoded));
            const total = preguntas.length;
            const aciertos = preguntas.filter(p => p.es_correcta === true).length;
            
            let html = `<div style="mso-number-format:'@'">`; 
            html += `<b style="font-size:14px; color:#1B5E20;">NOTA: ${aciertos}/${total}</b><br style="mso-data-placement:same-cell;" />`;
            html += `<span style="color:#999">-------------------</span><br style="mso-data-placement:same-cell;" />`;

            preguntas.forEach((p, i) => {
                const icono = p.es_correcta ? "✅" : "❌";
                const pregTexto = p.pregunta.replace(/<[^>]*>?/gm, ''); 
                const respUser = p.respuesta_usuario || 'Sin respuesta';

                html += `<b>${i + 1}.</b> ${pregTexto}<br style="mso-data-placement:same-cell;" />`;
                html += `&nbsp;&nbsp;R: <i style="color:#444">${respUser}</i> ${icono}<br style="mso-data-placement:same-cell;" /><br style="mso-data-placement:same-cell;" />`;
            });
            
            html += `</div>`;
            return html;
        } catch (e) { 
            return "Error lectura datos"; 
        }
    };

    const filas = tablaClon.querySelectorAll('tr');
    
    filas.forEach((fila, index) => {
        if (index === 0) return; 

        // Columna Nivel
        const celdaNivel = fila.cells[4];
        if (celdaNivel) {
            celdaNivel.innerText = celdaNivel.innerText.trim(); 
            celdaNivel.style.textAlign = 'center';
            celdaNivel.style.fontWeight = 'bold';
            celdaNivel.style.color = '#E65100';
            celdaNivel.style.backgroundColor = '#FFF3E0';
        }

        // Columnas Quizzes
        const celdaQuizIni = fila.cells[8]; 
        const celdaQuizFin = fila.cells[9]; 

        if (celdaQuizIni) {
            const btn = celdaQuizIni.querySelector('button');
            if (btn) {
                celdaQuizIni.innerHTML = formatearQuizParaExcel(btn);
                celdaQuizIni.style.verticalAlign = "top"; 
                celdaQuizIni.style.textAlign = "left";    
            } else {
                celdaQuizIni.innerHTML = "<span style='color:#ccc'>-</span>";
            }
        }

        if (celdaQuizFin) {
            const btn = celdaQuizFin.querySelector('button');
            if (btn) {
                celdaQuizFin.innerHTML = formatearQuizParaExcel(btn);
                celdaQuizFin.style.verticalAlign = "top";
                celdaQuizFin.style.textAlign = "left";
            } else {
                celdaQuizFin.innerHTML = "<span style='color:#ccc'>-</span>";
            }
        }
    });

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
                th { background-color: #1B5E20; color: white; padding: 12px; border: 1px solid #000; text-align: center; }
                td { padding: 10px; border: 1px solid #CCC; vertical-align: top; }
                br { mso-data-placement:same-cell; } 
            </style>
        </head>
        <body>
            <h3 style="color:#1B5E20">Historial de Partidas - Te Vivo Imbabura</h3>
            ${tablaClon.outerHTML}
        </body>
        </html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Historial_Imbabura_${new Date().toISOString().slice(0,10)}.xls`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};