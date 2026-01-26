// js/audioManager.js
import { URL_MUSICA_FONDO } from './data.js';

class AudioManager {
    constructor() {
        // Inicializa el objeto de audio con la ruta desde data.js
        this.bgm = new Audio(URL_MUSICA_FONDO);
        this.bgm.loop = true;   // Repetición infinita
        
        // 📉 AJUSTE DE VOLUMEN AQUÍ
        // Antes: 0.4 (40%)
        // Ahora: 0.15 (15%) -> Ideal para fondo suave
        this.bgm.volume = 0.15;  
        
        this.isMuted = false;   // Estado inicial: con sonido
        this.sfxCache = {};     // Memoria para efectos
    }

    playBGM() {
        if (!this.isMuted) {
            // Un pequeño truco: nos aseguramos que el volumen esté bajito al dar play
            this.bgm.volume = 0.15; 
            
            this.bgm.play().catch(e => {
                console.log("🔇 Autoplay bloqueado: esperando interacción del usuario.");
            });
        }
    }

    pauseBGM() {
        this.bgm.pause();
    }

    toggleMute() {
        this.isMuted = !this.isMuted; 

        if (this.isMuted) {
            this.bgm.pause(); 
            console.log("🎵 Música silenciada");
        } else {
            // Al reanudar, aseguramos el volumen bajo otra vez
            this.bgm.volume = 0.25; 
            this.bgm.play().catch(e => console.warn("Error al reanudar audio:", e));
            console.log("🎵 Música activada");
        }
        
        return this.isMuted; 
    }

    playSFX(url) {
        if (this.isMuted) return;

        if (!this.sfxCache[url]) {
            this.sfxCache[url] = new Audio(url);
            // 💡 TIP EXTRA: Los efectos de sonido déjalos fuertes (1.0 por defecto)
            // o un poco más bajos si saturan, por ejemplo:
            // this.sfxCache[url].volume = 0.8; 
        }
        
        const audio = this.sfxCache[url];
        audio.currentTime = 0; 

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn(`⚠️ Error en SFX: ${url}`, error);
            });
        }
    }
}

export const audioManager = new AudioManager();