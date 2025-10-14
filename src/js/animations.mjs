// src/js/animations.mjs
export function initCardAnimations() {
    const cards = document.querySelectorAll(".event-card");
    if (!cards.length) return;

    // Immediately show all cards if IntersectionObserver unsupported
    if (!("IntersectionObserver" in window)) {
        cards.forEach((card) => card.classList.add("animate-in"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-in");
                    obs.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.05 } // smaller threshold makes animation trigger faster
    );

    cards.forEach((card) => {
        observer.observe(card);
        // Fallback: if card is already visible (layout fully loaded)
        if (card.getBoundingClientRect().top < window.innerHeight) {
            card.classList.add("animate-in");
        }
    });
}
