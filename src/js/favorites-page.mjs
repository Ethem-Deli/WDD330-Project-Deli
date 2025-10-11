// src/js/favorites-page.mjs
import { loadTemplateWithFallback } from "./main-fallback.mjs";
import { getFavoritesForCurrentUser, saveFavoritesForCurrentUser } from "./favorites.mjs";
import { renderEventCard } from "./timeline-utils.mjs";
import { shareEventById } from "./share.mjs";

(async () => {
    // Load header/footer templates
    await loadTemplateWithFallback("/src/partials/header.html", "#header-placeholder");
    await loadTemplateWithFallback("/src/partials/footer.html", "#footer-placeholder");

    const favoritesList = document.getElementById("favoritesList");
    const favEmpty = document.getElementById("fav-empty");
    let favorites = getFavoritesForCurrentUser();

    function renderFavorites() {
        favoritesList.innerHTML = "";
        if (!favorites || favorites.length === 0) {
            favEmpty.style.display = "block";
            return;
        }
        favEmpty.style.display = "none";
        favorites.forEach(ev => favoritesList.appendChild(renderEventCard(ev)));
    }

    renderFavorites();

    // Handle card buttons
    favoritesList.addEventListener("click", async (e) => {
        const card = e.target.closest(".event-card");
        if (!card) return;

        const eventId = card.dataset.eventId;
        const eventData = favorites.find(ev => ev.id == eventId);

        // 🔗 Share
        if (e.target.closest("[data-action='share']")) {
            await shareEventById(eventId);
            return;
        }

        // ❌ Remove favorite
        if (e.target.closest("[data-action='favorite']")) {
            favorites = favorites.filter(f => f.id != eventId);
            saveFavoritesForCurrentUser(favorites);
            renderFavorites();
            return;
        }

        // 🗺️ Open event modal
        openEventModal(eventData);
    });

    // Close modal handler
    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("eventModal").classList.add("hidden");
    });
})();

// 🗺️ Modal + Google Map setup
function openEventModal(eventData) {
    const modal = document.getElementById("eventModal");
    document.getElementById("modalTitle").textContent = eventData.title;
    document.getElementById("modalDescription").textContent = eventData.description || "No description available.";
    document.getElementById("modalImage").src = eventData.image || "./src/assets/placeholder.png";
    modal.classList.remove("hidden");

    // Delay map init slightly for smoother render
    setTimeout(() => {
        const mapContainer = document.getElementById("modalMap");
        if (window.google && eventData.lat && eventData.lng) {
            const map = new google.maps.Map(mapContainer, {
                center: { lat: eventData.lat, lng: eventData.lng },
                zoom: 5
            });
            new google.maps.Marker({
                position: { lat: eventData.lat, lng: eventData.lng },
                map,
                title: eventData.title
            });
        } else {
            mapContainer.innerHTML = "<p>Location not available.</p>";
        }
    }, 400);
}
