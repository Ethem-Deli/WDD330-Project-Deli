// src/js/auth.mjs
const regForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const msg = document.getElementById("auth-message");

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Register
if (regForm) {
    regForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value.trim();

        let users = getUsers();
        if (users.find((u) => u.email === email)) {
            msg.textContent = "⚠️ Email already registered.";
            return;
        }

        users.push({ name, email, password });
        saveUsers(users);
        msg.textContent = "✅ Registered successfully! You can log in now.";
        regForm.reset();
    });
}

// Login
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        const users = getUsers();
        const user = users.find((u) => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem("loggedUser", JSON.stringify(user));
            msg.textContent = `👋 Welcome back, ${user.name}! Redirecting...`;
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);
        } else {
            msg.textContent = "❌ Invalid email or password.";
        }
    });
}

// Logout helper (for other pages)
export function logoutUser() {
    localStorage.removeItem("loggedUser");
    window.location.href = "../register.html";
}

export function getLoggedUser() {
    return JSON.parse(localStorage.getItem("loggedUser"));
}
