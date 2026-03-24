// =========================================================
// 📊 MÓDULO: DASHBOARD Y ESTADÍSTICAS
// Proyecto: Te Vivo Imbabura
// =========================================================

// 1. IMPORTACIONES (Subimos un nivel con '../' para encontrar firebase.js)
import { db } from "../firebase.js"; 
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Variable global específica para la gráfica de este módulo
let miGrafica = null;

// 2. FUNCIÓN PRINCIPAL DEL DASHBOARD
window.cargarDashboard = async function() {
    // Referencias al DOM
    const lblHoy = document.getElementById('stat-hoy');
    const lblMes = document.getElementById('stat-mes');
    const lblTotal = document.getElementById('stat-total');
    const lblFicha = document.getElementById('stat-ficha');
    const tablaUltimos = document.getElementById('tabla-ultimos');
    const lblFecha = document.getElementById('fecha-actual');

    // Fecha en español
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if(lblFecha) lblFecha.innerText = new Date().toLocaleDateString('es-EC', opcionesFecha);

    try {
        const ahora = new Date();
        const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        // Traemos datos ordenados por fecha descendente
        const q = query(collection(db, "historial_partidas"), orderBy("fecha", "desc"));
        const snap = await getDocs(q);

        let contHoy = 0;
        let contMes = 0;
        const conteoFichas = {};
        
        // Contadores Niveles
        let conteoNiveles = { '1': 0, '2': 0, '3': 0, '4': 0 };

        let ultimos5HTML = "";
        let contadorRender = 0;

        snap.forEach(doc => {
            const d = doc.data();
            
            // 1. Stats Tiempo
            if (d.fecha && d.fecha.toDate) {
                const f = d.fecha.toDate();
                if (f >= inicioHoy) contHoy++;
                if (f >= inicioMes) contMes++;
            }
            
            // 2. Ficha
            const ficha = d.ficha_nombre || "Desconocido";
            conteoFichas[ficha] = (conteoFichas[ficha] || 0) + 1;

            // 3. Stats Niveles (Para la gráfica)
            const nivelRaw = d.nivel_seleccionado || d.nivel_jugado || d.nivel || "1";
            const nivelJugado = String(nivelRaw).trim();
            
            if (conteoNiveles[nivelJugado] !== undefined) {
                conteoNiveles[nivelJugado]++;
            }

            // 4. TABLA ÚLTIMOS REGISTROS
            if (contadorRender < 5) {
                let hora = d.fecha && d.fecha.toDate ? d.fecha.toDate().toLocaleTimeString('es-EC', {hour:'2-digit', minute:'2-digit'}) : "S/F";
                let icono = d.posicion_llegada === 1 ? '🥇' : '👤';
                
                const nivelParaMostrar = d.nivel_seleccionado || d.nivel_jugado || d.nivel || 1;
                const colorNivel = nivelParaMostrar > 1 ? '#e65100' : '#2e7d32'; 

                ultimos5HTML += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px 0; font-size: 1.2rem; text-align:center;">${icono}</td>
                        <td style="padding: 10px;">
                            <div style="font-weight: bold; color: #333;">${d.nombre || 'Anónimo'}</div>
                            
                            <div style="font-size: 0.75rem; color: ${colorNivel}; font-weight:bold; margin-top:2px;">
                                Nivel ${nivelParaMostrar}
                            </div>
                        </td>
                        <td style="text-align: right; font-weight: bold; color: var(--color-sidebar);">
                            ${d.puntos_finales || 0}
                        </td>
                        <td style="text-align: right; color: #999; font-size: 0.8rem;">${hora}</td>
                    </tr>`;
                contadorRender++;
            }
        });

        // Pintar Textos
        if(lblHoy) lblHoy.innerText = contHoy;
        if(lblMes) lblMes.innerText = contMes;
        if(lblTotal) lblTotal.innerText = snap.size;
        if(tablaUltimos) tablaUltimos.innerHTML = ultimos5HTML || '<tr><td colspan="4" style="text-align:center; color:#999; padding:20px;">Sin actividad reciente</td></tr>';

        // Calcular Ficha Ganadora
        let fichaGanadora = "-";
        let maxVotos = 0;
        for (const [ficha, votos] of Object.entries(conteoFichas)) {
            if (votos > maxVotos) { maxVotos = votos; fichaGanadora = ficha; }
        }
        if(lblFicha) lblFicha.innerText = fichaGanadora;

        // --- GRÁFICA DE DONA ---
        const ctx = document.getElementById('graficaModos');
        if (ctx) {
            if (miGrafica) miGrafica.destroy();

            const totalNiveles = conteoNiveles['1'] + conteoNiveles['2'] + conteoNiveles['3'] + conteoNiveles['4'];
            
            let dataFinal, colorsFinal, labelsFinal;

            if (totalNiveles === 0) {
                dataFinal = [1]; 
                colorsFinal = ['#eeeeee']; 
                labelsFinal = ['Sin datos'];
            } else {
                dataFinal = [conteoNiveles['1'], conteoNiveles['2'], conteoNiveles['3'], conteoNiveles['4']];
                colorsFinal = ['#4CAF50', '#2196F3', '#FF9800', '#F44336']; // Verde, Azul, Naranja, Rojo
                labelsFinal = ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4'];
            }

            miGrafica = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labelsFinal,
                    datasets: [{
                        data: dataFinal,
                        backgroundColor: colorsFinal,
                        borderWidth: 0,
                        hoverOffset: totalNiveles === 0 ? 0 : 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', display: true },
                        tooltip: { enabled: totalNiveles > 0 }
                    }
                }
            });
        }

    } catch (error) {
        console.error("Error dashboard:", error);
    }
}