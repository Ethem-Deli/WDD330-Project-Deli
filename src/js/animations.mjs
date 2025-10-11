// src/js/animations.mjs
export function initCardAnimations() {
    const cards = document.querySelectorAll(".event-card");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-in");
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 } // trigger when 20% visible
    );

    cards.forEach(card => observer.observe(card));
}
