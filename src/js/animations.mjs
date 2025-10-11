// src/js/animations.mjs
export function initRevealOnScroll(root = document) {
    const items = Array.from(root.querySelectorAll(".reveal"));
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    items.forEach(i => observer.observe(i));
}
