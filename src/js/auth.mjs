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
   FIREBASE AUTH
-------------------------- */
export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

export function logoutUser() {
    return signOut(auth);
}

export function observeAuthState(cb) {
    onAuthStateChanged(auth, (user) => cb(user));
}

export function requireAuth(redirectTo = "/auth/login.html") {
    onAuthStateChanged(auth, (user) => {
        if (!user) window.location.href = redirectTo;
    });
}

/* -------------------------
   LOCAL FALLBACK (optional)
-------------------------- */
export function saveLocalUser(userObj) {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObj));
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
