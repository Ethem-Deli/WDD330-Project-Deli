// src/js/firebase-config.mjs
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB92OXlJn50jta9IHuY5czC937HMgYH2xs",
    authDomain: "historytimeline-wdd330.firebaseapp.com",
    projectId: "historytimeline-wdd330",
    storageBucket: "historytimeline-wdd330.firebasestorage.app",
    messagingSenderId: "539673015003",
    appId: "1:539673015003:web:2621f434393950b78312fe",
    measurementId: "G-GV6LHVLN1R"
};

// 🧠 Prevent reinitialization if app already exists
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
