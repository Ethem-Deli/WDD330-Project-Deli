// src/js/auth-fallback.mjs
const USER_KEY = "HTIW_CURRENT_USER";
export function setupAuthUi() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");

    function ensureAnonUser() {
        if (!localStorage.getItem(USER_KEY)) {
            localStorage.setItem(USER_KEY, "anon");
        }
    }
    ensureAnonUser();

    signupBtn?.addEventListener("click", () => {
        const name = prompt("Choose a username (local only):");
        if (!name) return;
        localStorage.setItem(USER_KEY, name);
        alert("Signed up locally as " + name);
        updateAuthDisplay();
    });

    loginBtn?.addEventListener("click", () => {
        const name = prompt("Enter your username to login (local only):");
        if (!name) return;
        localStorage.setItem(USER_KEY, name);
        alert("Logged in as " + name);
        updateAuthDisplay();
    });

    function updateAuthDisplay() {
        const uid = localStorage.getItem(USER_KEY) || "anon";
        const authControls = document.getElementById("auth-controls");
        if (!authControls) return;
        authControls.innerHTML = `<span class="small">User: ${uid}</span> <button id="logoutBtn" class="btn small">Logout</button>`;
        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.setItem(USER_KEY, "anon");
            updateAuthDisplay();
        });
    }
    updateAuthDisplay();
}
