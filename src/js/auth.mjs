// ✅ src/js/auth.mjs
import { auth } from "./firebase-config.mjs";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const LOCAL_USER_KEY = "local_user_v1";

/* -------------------------
   AUTH CORE
-------------------------- */
export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" }); // 🆕 ensures user can pick account
    return signInWithPopup(auth, provider);
}

export function logoutUser() {
    return signOut(auth);
}

export function observeAuthState(callback) {
    onAuthStateChanged(auth, (user) => callback(user));
}

/* -------------------------
   ACCESS CONTROL
-------------------------- */
export function requireAuth(redirectTo = "/auth/login.html") {
    onAuthStateChanged(auth, (user) => {
        if (!user) window.location.href = redirectTo;
    });
}

/* -------------------------
   LOCAL FALLBACK
-------------------------- */
export function saveLocalUser(user) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

export function getLocalUser() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
    } catch {
        return null;
    }
}

export function clearLocalUser() {
    localStorage.removeItem(LOCAL_USER_KEY);
}
