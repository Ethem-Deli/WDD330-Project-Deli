// ============================
// 🔐 Firebase + Local Fallback Auth
// ============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// ============================
// 🔧 Firebase Configuration
// ============================
const firebaseConfig = {
    apiKey: "AIzaSyB92OXlJn50jta9IHuY5czC937HMgYH2xs",
    authDomain: "historytimeline-wdd330.firebaseapp.com",
    projectId: "historytimeline-wdd330",
    storageBucket: "historytimeline-wdd330.firebasestorage.app",
    messagingSenderId: "539673015003",
    appId: "1:539673015003:web:2621f434393950b78312fe",
    measurementId: "G-GV6LHVLN1R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ============================
// 🧩 Firebase Auth Helpers
// ============================

// 🔹 Login existing user
export async function loginUser(email, password) {
    const res = await signInWithEmailAndPassword(auth, email, password);
    if (res.user?.email) {
        localStorage.setItem("currentUser", res.user.email);
    }
    return res;
}

// 🔹 Register new user
export async function registerUser(email, password) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user?.email) {
        localStorage.setItem("currentUser", res.user.email);
    }
    return res;
}

// 🔹 Logout user
export async function logoutUser() {
    await signOut(auth);
    localStorage.removeItem("currentUser");
}

// 🔹 Watch auth state (Firebase)
export function observeAuthState(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user?.email) {
            localStorage.setItem("currentUser", user.email);
        } else {
            localStorage.removeItem("currentUser");
        }
        callback(user);
    });
}

// 🔹 Require login (redirect if not)
export function requireAuth(redirectTo = "login.html") {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            alert("Please log in to access this page.");
            window.location.href = redirectTo;
        }
    });
}

export { auth };

// ============================
// 💾 Local Fallback (Offline Mode)
// ============================
function _localUsersKey() { return "local_users_v1"; }
function _getLocalUsers() {
    try { return JSON.parse(localStorage.getItem(_localUsersKey()) || "[]"); } catch (e) { return []; }
}
function _saveLocalUsers(users) { localStorage.setItem(_localUsersKey(), JSON.stringify(users)); }

async function tryServer(url, payload) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Server error");
        return data;
    } catch (err) {
        console.warn("Server auth failed, using local fallback:", err);
        return null;
    }
}

// ============================
// 🧾 Form Handling (optional for auth.html)
// ============================
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

// Registration (local fallback)
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        const serverData = await tryServer("/api/auth/register", { name, email, password });
        if (serverData) {
            alert("Registered (server)");
            window.location.href = "/index.html";
            return;
        }

        const users = _getLocalUsers();
        if (users.find(u => u.email === email)) {
            alert("Email already registered (local)");
            return;
        }

        users.push({ name, email, password });
        _saveLocalUsers(users);
        alert("Registered (local fallback). You can now log in.");
        window.location.href = "/auth/login.html";
    });
}

// Login (local fallback)
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const serverData = await tryServer("/api/auth/login", { email, password });
        if (serverData && serverData.token) {
            localStorage.setItem("token", serverData.token);
            localStorage.setItem("currentUser", email);
            alert("Logged in (server)");
            window.location.href = "/index.html";
            return;
        }

        const users = _getLocalUsers();
        const u = users.find(x => x.email === email && x.password === password);
        if (!u) {
            alert("Login failed (local)");
            return;
        }

        localStorage.setItem("local_user", JSON.stringify({ name: u.name, email: u.email }));
        localStorage.setItem("currentUser", u.email);
        alert("Logged in (local)");
        window.location.href = "/index.html";
    });
}
