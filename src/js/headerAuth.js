// src/js/headerAuth.js
import { observeAuthState, logoutUser } from "./auth.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const authLink = document.getElementById("authLink");
    if (!authLink) return;

    observeAuthState(user => {
        if (user) {
            authLink.textContent = "Logout";
            authLink.href = "#";
            authLink.onclick = async (e) => {
                e.preventDefault();
                await logoutUser();
                window.location.reload();
            };
        } else {
            authLink.textContent = "Login";
            authLink.href = "/auth/login.html";
        }
    });
});