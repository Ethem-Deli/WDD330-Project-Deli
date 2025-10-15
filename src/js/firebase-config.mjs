// src/js/firebase-config.mjs
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

import { FIREBASE_CONFIG } from "./firebase-config.js"; // local, not committed

// ✅ Validate config keys
const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "appId"];
const missing = requiredKeys.filter(k => !FIREBASE_CONFIG[k] || FIREBASE_CONFIG[k].includes("YOUR_"));
if (missing.length > 0) {
    console.error(
        `⚠️ Firebase configuration incomplete or missing keys: ${missing.join(", ")}.`
    );
    console.warn(
        "Please copy src/js/firebase-config.example.js → src/js/firebase-config.js and fill in your real Firebase credentials."
    );
}

// 🧠 Prevent reinitialization if app already exists
const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
