// =========================================================
// 👥 MÓDULO: USUARIOS REGISTRADOS
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================

// 1. IMPORTACIONES (Subimos un nivel con '../' para encontrar firebase.js)
import { db } from "../firebase.js"; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FUNCIÓN PRINCIPAL: CARGAR REGISTROS (FUSIÓN PÚBLICO + PRIVADO) ---
window.cargarRegistrosFusionados = async function() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const totalLabel = document.getElementById('total-registros');
    
    // Mensaje de carga inicial
    if(cuerpoTabla) cuerpoTabla.innerHTML = '<tr><td colspan="10" style="text-align:center">🔄 Cruzando datos de usuarios de Te Vivo Imbabura...</td></tr>';

    try {
        // Ejecutamos ambas consultas en paralelo para que cargue el doble de rápido
        const [publicosSnap, privadosSnap] = await Promise.all([
            getDocs(collection(db, "ranking_publico")),
            getDocs(collection(db, "usuarios_privados"))
        ]);

        if(totalLabel) totalLabel.innerHTML = publicosSnap.size;

        // Crear mapa de privados para búsqueda rápida
        const mapaPrivados = {};
        privadosSnap.forEach(doc => {
            mapaPrivados[doc.id] = doc.data();
        });

        // 🚀 OPTIMIZACIÓN: Acumulamos en texto en lugar de tocar el DOM repetidas veces
        let htmlFinal = "";

        // Recorrer el ranking público y fusionar
        publicosSnap.forEach((doc) => {
            const dataPub = doc.data();
            const id = doc.id;
            const dataPriv = mapaPrivados[id] || {}; 

            const fechaISO = dataPriv.registradoEn || ""; 
            const fechaTexto = fechaISO ? new Date(fechaISO).toLocaleString('es-EC') : "S/F";
            const acepta = dataPriv.aceptaTerminos ? "✅ SI" : "❌ NO";

            htmlFinal += `
                <tr data-fecha="${fechaISO}">
                    <td><small>${fechaTexto}</small></td>
                    <td><strong>${id}</strong></td>
                    <td>${dataPriv.edad || '-'}</td>
                    <td>${dataPub.nombre || 'ANÓNIMO'}</td>
                    <td>${dataPriv.ciudad || '-'}</td>
                    <td>${dataPriv.email || '-'}</td>
                    <td>${dataPriv.genero || '-'}</td>
                    <td>${dataPriv.telefono || '-'}</td>
                    <td>${acepta}</td>
                    <td>${fechaTexto}</td>
                </tr>`;
        });

        // Hacemos una única inyección al HTML para evitar que la pestaña se cuelgue
        if (cuerpoTabla) cuerpoTabla.innerHTML = htmlFinal;

        // Aplicamos filtros en caso de que hubiera alguno escrito antes de cargar
        window.filtrarTabla();

    } catch (error) {
        console.error("Error cargando registros:", error);
        if(cuerpoTabla) cuerpoTabla.innerHTML = `<tr><td colspan="10" style="color:red; text-align:center">⛔ Error de lectura en Base de Datos</td></tr>`;
    }
}

// --- FILTRO TABLA PRINCIPAL ---
window.filtrarTabla = function() {
    const texto = document.getElementById('filtro-texto')?.value.toUpperCase() || "";
    
    // Filtros específicos
    const ciudad = document.getElementById('filtro-ciudad')?.value.toUpperCase() || "";
    const edad = document.getElementById('filtro-edad')?.value || "";
    const genero = document.getElementById('filtro-genero')?.value.toUpperCase() || "";

    const fechaDesdeInput = document.getElementById('filtro-fecha-desde');
    const fechaHastaInput = document.getElementById('filtro-fecha-hasta');
    
    // Configuración de Fechas
    const fechaDesde = (fechaDesdeInput && fechaDesdeInput.value) ? new Date(fechaDesdeInput.value + "T00:00:00") : null;
    const fechaHasta = (fechaHastaInput && fechaHastaInput.value) ? new Date(fechaHastaInput.value + "T23:59:59") : null;

    const filas = document.querySelectorAll('#cuerpo-tabla tr');
    let contador = 0;

    filas.forEach(fila => {
        if(fila.cells.length < 2) return; 

        const txtFila = fila.innerText.toUpperCase();
        const coincideTexto = txtFila.includes(texto) && 
                              txtFila.includes(ciudad) && 
                              (edad === "" || txtFila.includes(edad)) &&
                              (genero === "" || txtFila.includes(genero));

        let coincideFecha = true;
        const fechaFilaRaw = fila.getAttribute('data-fecha');

        if (fechaFilaRaw) {
            const fechaFila = new Date(fechaFilaRaw);
            if (fechaDesde && fechaFila < fechaDesde) coincideFecha = false;
            if (fechaHasta && fechaFila > fechaHasta) coincideFecha = false;
        }

        if(coincideTexto && coincideFecha) {
            fila.style.display = '';
            contador++;
        } else {
            fila.style.display = 'none';
        }
    });

    const totalReg = document.getElementById('total-registros');
    if(totalReg) totalReg.innerText = contador;
}

// --- LIMPIAR FILTROS ---
window.limpiarFiltros = function() {
    ['filtro-texto', 'filtro-ciudad', 'filtro-edad', 'filtro-genero', 'filtro-fecha-desde', 'filtro-fecha-hasta'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = "";
    });
    window.filtrarTabla();
}

// --- EXPORTAR EXCEL ---
window.exportarExcel = function() {
    const tabla = document.getElementById("tabla-jugadores");
    if(!tabla) return; 

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"></head> 
        <body>
            <h3>Reporte de Usuarios Registrados</h3>
            <table>${tabla.innerHTML}</table>
        </body>
        </html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `Usuarios_Te_Vivo_Imbabura_${new Date().toISOString().slice(0,10)}.xls`; // Le agregué la fecha al nombre del archivo
    a.click(); 
    URL.revokeObjectURL(url);
}