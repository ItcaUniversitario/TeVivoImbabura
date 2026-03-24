// =========================================================
// 🔥 FIREBASE INIT (js/firebase.js)
// Proyecto: Te Vivo Imbabura - ITCA
// =========================================================

// 1. IMPORTACIONES BÁSICAS DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"; // <-- ¡ESTA ES LA LÍNEA QUE TE FALTABA ARRIBA!

// 2. TUS CREDENCIALES
const firebaseConfig = {
    apiKey: "AIzaSyDtgE2I0eYet03R6VfeXvgvXtEpdAUaYSo",
    authDomain: "juego-te-vivo-imababura.firebaseapp.com",
    projectId: "juego-te-vivo-imababura",
    storageBucket: "juego-te-vivo-imababura.firebasestorage.app",
    messagingSenderId: "54108968941",
    appId: "1:54108968941:web:2ac23cd1eac1e6781b39e4",
    measurementId: "G-320511XQMN"
};

// 3. INICIALIZAR LA APP
const app = initializeApp(firebaseConfig);

// 4. ✨ EXPORTACIONES (El puente para los demás archivos) ✨
export const db = getFirestore(app);
export const auth = getAuth(app);