import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TUS CREDENCIALES
const firebaseConfig = {
  apiKey: "AIzaSyDtgE2I0eYet03R6VfeXvgvXtEpdAUaYSo",
  authDomain: "juego-te-vivo-imababura.firebaseapp.com",
  projectId: "juego-te-vivo-imababura",
  storageBucket: "juego-te-vivo-imababura.firebasestorage.app",
  messagingSenderId: "54108968941",
  appId: "1:54108968941:web:2ac23cd1eac1e6781b39e4",
  measurementId: "G-320511XQMN"
};

// Inicializar y EXPORTAR la base de datos para que otros archivos la usen
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);