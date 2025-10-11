import { logoutUser, observeAuthState } from "../auth/auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const authLink = document.getElementById("authLink");
    if (!authLink) return;

    observeAuthState(user => {
        if (user) {
            authLink.textContent = "Logout";
            authLink.href = "#";
            authLink.addEventListener("click", async (e) => {
                e.preventDefault();
                await logoutUser();
                window.location.href = "../index.html";
            });
        } else {
            authLink.textContent = "Login";
            authLink.href = "../auth/login.html";
        }
    });
});
