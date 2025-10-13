// src/js/hamburger.mjs
export function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");

    if (!hamburgerBtn || !navMenu) return;

    // Toggle open/close
    hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navMenu.classList.toggle("open");
        hamburgerBtn.classList.toggle("active");
    });

    // Close when clicking a nav link
    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("open");
            hamburgerBtn.classList.remove("active");
        });
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            navMenu.classList.remove("open");
            hamburgerBtn.classList.remove("active");
        }
    });
}
