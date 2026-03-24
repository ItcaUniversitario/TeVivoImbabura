// =========================================================
// 🎓 MÓDULO: CERTIFICADOS Y DESCARGAS ZIP
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================

// 1. IMPORTACIONES
import { db, auth } from "../firebase.js"; 
import { collection, query, getDocs, getDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Variables globales para mantener los datos en memoria
let listaCertificables = [];
let listaVisibles = []; // Solo los que se ven en pantalla (filtrados)

// =========================================================
// 🔄 CARGA DEFINITIVA: RANKING (ID=CÉDULA) + EMAIL PRIVADO
// =========================================================
window.cargarTablaCertificados = async function() {
    const cuerpo = document.getElementById('cuerpo-certificados');
    if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">🔄 Cruzando datos de Ranking y Usuarios...</td></tr>';

    try {
        console.log("🚀 Leyendo Ranking Público...");
        const q = query(collection(db, "ranking_publico")); 
        const snapRanking = await getDocs(q);

        if (snapRanking.empty) {
            if(cuerpo) cuerpo.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">El Ranking Público está vacío.</td></tr>';
            return;
        }

        let candidatos = [];
        const promesasEmail = [];

        snapRanking.forEach(docRank => {
            const d = docRank.data();
            const cedulaReal = docRank.id; 
            const puntos = d.puntuacion_total || d.puntos || 0;

            let nivelLeido = "1";
            if (d.progreso_actual && d.progreso_actual.nivel) {
                nivelLeido = d.progreso_actual.nivel;
            } else if (d.nivel) {
                nivelLeido = d.nivel;
            }

            const jugador = {
                id_doc: docRank.id,
                cedula: cedulaReal,
                nombre: d.nombre || "Jugador Sin Nombre",
                puntos_finales: puntos,
                nivel: nivelLeido,
                email: "Buscando...", 
                fecha: d.ultima_conexion || null
            };

            candidatos.push(jugador);
            const refPrivada = doc(db, "usuarios_privados", cedulaReal);
            promesasEmail.push(getDoc(refPrivada));
        });

        // Ejecutar búsquedas de email en paralelo para mayor velocidad
        const snapshotsPrivados = await Promise.all(promesasEmail);

        candidatos.forEach((jugador, index) => {
            const snapUser = snapshotsPrivados[index];
            if (snapUser && snapUser.exists()) {
                const dataUser = snapUser.data();
                jugador.email = dataUser.email || dataUser.correo || "Email no guardado";
            } else {
                jugador.email = "No registrado en Usuarios"; 
            }
        });

        candidatos.sort((a, b) => b.puntos_finales - a.puntos_finales);
        listaCertificables = candidatos;

        console.log(`✅ Fusión completada: ${listaCertificables.length} jugadores listos para certificado.`);
        window.filtrarCertificados();

    } catch (error) {
        console.error("❌ ERROR CARGANDO TABLA:", error);
        if(cuerpo) cuerpo.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center">Error técnico: ${error.message}</td></tr>`;
    }
}

// =========================================================
// 🎨 FILTRAR Y DIBUJAR TABLA (SÚPER OPTIMIZADA)
// =========================================================
window.filtrarCertificados = function() {
    const inputNivel = document.getElementById('cert-nivel');
    const inputLimite = document.getElementById('cert-limite');
    const inputBuscador = document.getElementById('cert-buscador');
    const inputFecha = document.getElementById('cert-fecha');
    const cuerpo = document.getElementById('cuerpo-certificados');

    if (!cuerpo) return;
    
    // 🚀 OPTIMIZACIÓN: Preparamos la variable de texto
    cuerpo.innerHTML = '';
    let htmlFinal = "";

    const nivelReq = inputNivel ? inputNivel.value : "todos";
    const limiteReq = inputLimite ? inputLimite.value : "todos";
    const texto = inputBuscador ? inputBuscador.value.toUpperCase().trim() : "";
    const fechaReq = inputFecha ? inputFecha.value : "";

    let resultados = listaCertificables.filter(item => {
        // Filtro Nivel
        if (nivelReq !== 'todos') {
            const nFiltro = parseInt(nivelReq); 
            let nJugador = parseInt(item.nivel) || 0;
            if (nJugador === 0 && item.puntos_finales > 1500) nJugador = 4;
            if (nJugador !== nFiltro) return false;
        }
        // Filtro Fecha
        if (fechaReq) {
            let fechaItem = "";
            if (item.fecha && item.fecha.toDate) fechaItem = item.fecha.toDate().toISOString().split('T')[0];
            else if (typeof item.fecha === 'string') fechaItem = item.fecha.split('T')[0];
            if (fechaItem !== fechaReq) return false;
        }
        // Filtro Texto
        if (texto) {
            const nombreStr = String(item.nombre).toUpperCase();
            const cedulaStr = String(item.cedula).toUpperCase();
            if (!nombreStr.includes(texto) && !cedulaStr.includes(texto)) return false;
        }
        return true;
    });

    // Ordenar y Limitar (Top X)
    resultados.sort((a, b) => b.puntos_finales - a.puntos_finales);
    if (limiteReq !== 'todos') {
        const max = parseInt(limiteReq);
        resultados = resultados.slice(0, max);
    }

    listaVisibles = resultados;

    if (resultados.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#999; padding:20px;">No hay resultados.</td></tr>';
        return;
    }

    // ACUMULAMOS EN TEXTO
    resultados.forEach(d => {
        const datosObj = { nombre: d.nombre, cedula: d.cedula, nivel: d.nivel, email: d.email };
        const datosStr = encodeURIComponent(JSON.stringify(datosObj)).replace(/'/g, "%27");
        const colorEmail = d.email && d.email.includes("@") ? "#2e7d32" : "#d32f2f";

        htmlFinal += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;"><strong>${d.nombre}</strong></td>
                <td style="padding: 10px;">${d.cedula}</td>
                <td style="padding: 10px; color: ${colorEmail}; font-size:0.9rem;">${d.email}</td>
                <td style="text-align:center;">
                    <span style="background:#e3f2fd; padding:3px 8px; border-radius:4px; font-weight:bold; color:#1565c0;">
                         ${d.nivel || '?'}
                    </span>
                </td>
                <td style="font-weight:bold;">${d.puntos_finales}</td>
                <td style="text-align:center;">
                    <button class="btn-imbabura secundario" style="padding:4px 8px; font-size:0.8rem;" 
                        onclick="generarCertificadoPDF(JSON.parse(decodeURIComponent('${datosStr}')), 'descargar')">
                        ⬇️ PDF
                    </button>
                </td>
            </tr>
        `;
    });
    
    // ÚNICA INYECCIÓN AL DOM
    cuerpo.innerHTML = htmlFinal;
    
    const btnMasivo = document.getElementById('btn-descarga-masiva');
    if(btnMasivo) btnMasivo.innerText = `⬇️ Descargar Visibles (${listaVisibles.length})`;
}
window.generarCertificadoPDF = async function(datos, modo = 'descargar') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); 

    try {
        const rutaImagen = 'assets/imagenes/generales/plantilla_certificado.png';
        doc.addImage(rutaImagen, 'PNG', 0, 0, 297, 210);
    } catch (error) {
        console.error("❌ Error de imagen:", error);
    }

    // --- CONFIGURACIÓN DE ÁREA (Centro en X=186 para evitar la franja marrón) ---
    const centroX = 186; 
    const azulITCA = [21, 67, 112];
    const grisOscuro = [50, 50, 50];

    // 1. TÍTULO
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...azulITCA);
    doc.setFontSize(26);
    doc.text("CERTIFICADO DE RECONOCIMIENTO", centroX, 60, { align: "center" });

    // 2. CONCESIÓN
    doc.setFont("times", "italic");
    doc.setFontSize(14);
    doc.setTextColor(...grisOscuro);
    doc.text("El Instituto Superior Tecnológico ITCA confiere el presente a:", centroX, 72, { align: "center" });

    // 3. NOMBRE DEL ESTUDIANTE
    const nombreEstudiante = datos.nombre ? datos.nombre.toUpperCase() : "ESTUDIANTE ANÓNIMO";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.setTextColor(...azulITCA);
    doc.text(nombreEstudiante, centroX, 88, { align: "center" });

    // 4. CÉDULA
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`C.I.: ${datos.cedula || "----------"}`, centroX, 98, { align: "center" });

    // 5. MENSAJE PRINCIPAL
    doc.setFontSize(13);
    doc.setTextColor(...grisOscuro);
    const mensaje = [
        `Por haber culminado con éxito el juego interactivo "TE VIVO IMBABURA",`,
        `demostrando valiosos conocimientos acerca del GEOPARQUE MUNDIAL UNESCO IMBABURA,`,
        `su cultura, tradiciones y riqueza natural.`
    ];
    doc.text(mensaje, centroX, 115, { align: "center", lineHeightFactor: 1.4 });

    // 6. EL PUNTAJE (Destacado)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...azulITCA);
    // Usamos 'puntos_finales' o 'puntos' según como venga en tu objeto 'datos'
    const score = datos.puntos_finales || datos.puntos || "0";
    doc.text(`CON UN PUNTAJE DE: ${score} PUNTOS`, centroX, 140, { align: "center" });

    // 7. FECHA
    const hoy = new Date();
    const fechaTexto = `Ibarra, ${hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(fechaTexto, centroX, 155, { align: "center" });

    // --- SECCIÓN DE FIRMAS ---
    doc.setFontSize(10);
    doc.setTextColor(...grisOscuro);
    
    // Firma Izquierda: ITCA
    const xFirmaIzq = 125; 
    doc.line(xFirmaIzq - 25, 180, xFirmaIzq + 25, 180); 
    doc.setFont("helvetica", "bold");
    doc.text("INSTITUTO ITCA", xFirmaIzq, 185, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("Autoridad Institucional", xFirmaIzq, 189, { align: "center" });

    // Firma Derecha: Coordinador
    const xFirmaDer = 245; 
    doc.line(xFirmaDer - 30, 180, xFirmaDer + 30, 180); 
    doc.setFont("helvetica", "bold");
    doc.text("COORDINADOR DE PROYECTO", xFirmaDer, 185, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("Juego Te Vivo Imbabura", xFirmaDer, 189, { align: "center" });

    // 8. SALIDA
    if (modo === 'blob') {
        return doc.output('blob');
    } else {
        const nombreClean = datos.nombre.replace(/[^a-zA-Z0-9 áéíóúñÑ]/g, "").trim();
        doc.save(`Certificado_ITCA_${nombreClean}.pdf`);
        if(typeof window.registrarEnvioCertificado === 'function') {
            window.registrarEnvioCertificado(datos, "DESCARGA_PDF");
        }
    }
}
// =========================================================
// 📦 DESCARGA MASIVA EN ZIP
// =========================================================
window.descargarVisibles = async function() {
    if (listaVisibles.length === 0) return alert("No hay estudiantes en la tabla para descargar.");
    if (!confirm(`📦 Se generará un archivo ZIP con ${listaVisibles.length} certificados.\n\n¿Continuar?`)) return;

    const btn = document.getElementById('btn-descarga-masiva');
    const textoOriginal = btn ? btn.innerText : "⬇️ Descargar";
    if(btn) btn.innerText = "⏳ Comprimiendo...";

    try {
        const zip = new JSZip(); // Requiere la librería JSZip importada en HTML
        const carpeta = zip.folder("Certificados_TeVivoImbabura");

        for (let i = 0; i < listaVisibles.length; i++) {
            const est = listaVisibles[i];
            if(btn) btn.innerText = `⏳ Procesando ${i+1}/${listaVisibles.length}...`;

            const pdfBlob = await window.generarCertificadoPDF(est, 'blob');
            const nombreLimpio = est.nombre.replace(/[^a-zA-Z0-9 áéíóúñÑ]/g, "").trim(); 
            const nombreArchivo = `Certificado ${nombreLimpio} TE VIVO IMBABURA.pdf`;

            carpeta.file(nombreArchivo, pdfBlob);
            await new Promise(r => setTimeout(r, 50)); // Pausa técnica para no congelar UI
        }

        if(btn) btn.innerText = "💾 Guardando ZIP...";
        const zipContent = await zip.generateAsync({type: "blob"});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipContent);
        link.download = `Certificados_Imbabura_${new Date().toISOString().slice(0,10)}.zip`;
        link.click();

        alert("✅ ¡Descarga lista!");
    } catch (error) {
        console.error("Error al comprimir:", error);
        alert("Ocurrió un error al comprimir. Revisa la consola.");
    } finally {
        if(btn) btn.innerText = textoOriginal;
    }
}

// =========================================================
// 📝 BITÁCORA Y CONTROLES UI
// =========================================================

window.registrarEnvioCertificado = async function(datosEstudiante, tipoEnvio) {
    try {
        // Obtenemos el email del admin usando Firebase Auth
        const emailAdmin = auth && auth.currentUser ? auth.currentUser.email : "Administrador";

        const registro = {
            fecha: new Date(),
            cedula_estudiante: datosEstudiante.cedula || "S/C",
            nombre_estudiante: datosEstudiante.nombre || "Anónimo",
            correo_destino: datosEstudiante.email || "No aplica",
            nivel_certificado: datosEstudiante.nivel || "4",
            tipo_envio: tipoEnvio, 
            admin_responsable: emailAdmin
        };

        await addDoc(collection(db, "historial_certificados"), registro);
        
        // Recargar si la bitácora está abierta
        if (typeof window.cargarBitacoraCertificados === 'function') {
            const panelBitacora = document.getElementById('subtab-bitacora');
            if(panelBitacora && panelBitacora.style.display !== 'none') window.cargarBitacoraCertificados();
        }
    } catch (error) {
        console.warn("⚠️ No se pudo guardar en el historial:", error);
    }
}

window.cambiarSubTab = function(tabId) {
    const vistaGenerar = document.getElementById('subtab-generar');
    const vistaBitacora = document.getElementById('subtab-bitacora');
    const botones = document.querySelectorAll('.tab-btn');

    if(vistaGenerar) vistaGenerar.style.display = 'none';
    if(vistaBitacora) vistaBitacora.style.display = 'none';
    botones.forEach(btn => btn.classList.remove('active'));

    if (tabId === 'generar') {
        if(vistaGenerar) vistaGenerar.style.display = 'block';
        if(botones[0]) botones[0].classList.add('active');
    } else if (tabId === 'bitacora') {
        if(vistaBitacora) vistaBitacora.style.display = 'block';
        if(botones[1]) botones[1].classList.add('active');
        if(typeof window.cargarBitacoraCertificados === 'function') window.cargarBitacoraCertificados();
    }
}

// ⚠️ NOTA: Nombre cambiado a 'limpiarFiltrosCertificados' para que no pelee con el de usuarios
window.limpiarFiltrosCertificados = function() {
    const inputNivel = document.getElementById('cert-nivel');
    const inputLimite = document.getElementById('cert-limite');
    const inputBuscador = document.getElementById('cert-buscador');
    const inputFecha = document.getElementById('cert-fecha');
    const checkGlobal = document.getElementById('check-global');

    if (inputNivel) inputNivel.value = "todos"; 
    if (inputLimite) inputLimite.value = "todos";
    if (inputBuscador) inputBuscador.value = "";
    if (inputFecha) inputFecha.value = "";
    if (checkGlobal) checkGlobal.checked = false;

    window.filtrarCertificados();
}

window.toggleCheckGlobal = function() {
    const checkMaster = document.getElementById('check-global');
    const estado = checkMaster ? checkMaster.checked : true; 
    const cuerpo = document.getElementById('cuerpo-certificados');
    if(!cuerpo) return;

    const checkboxes = cuerpo.querySelectorAll('.check-cert');
    checkboxes.forEach(chk => chk.checked = estado);
}