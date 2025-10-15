// src/js/favorites-page.mjs
import { loadTemplateWithFallback } from "./main-fallback.mjs";
import {
    getFavoritesForCurrentUser,
    saveFavoritesForCurrentUser,
    exportFavoritesAsFile,
    createShareLink,
    loadSharedFavoritesFromQuery,
} from "./favorites.mjs";
import { renderEventCard } from "./timeline-utils.mjs";
import { shareEventById } from "./share.mjs";

// 🧭 Toast Notification Utility
function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// 🧭 Initialize Page
(async () => {
    await loadTemplateWithFallback("/src/partials/header.html", "#header-placeholder");
    await loadTemplateWithFallback("/src/partials/footer.html", "#footer-placeholder");

    const favoritesContainer = document.getElementById("favoritesContainer");
    const exportBtn = document.getElementById("exportFavoritesBtn");
    const shareBtn = document.getElementById("shareFavoritesBtn");

    // 🧩 Load favorites from query or local storage
    let favorites = await loadSharedFavoritesFromQuery();
    if (!favorites || favorites.length === 0) {
        favorites = getFavoritesForCurrentUser();
    }

    // ✅ Always ensure favorites is an array
    if (!Array.isArray(favorites)) {
        try {
            favorites = JSON.parse(favorites);
            if (!Array.isArray(favorites)) favorites = [];
        } catch {
            favorites = [];
        }
    }

    function renderFavoritesList() {
        favoritesContainer.innerHTML = "";

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `<p class="text-gray-500 text-center mt-6">No favorites added yet.</p>`;
            return;
        }

        favorites.forEach((event) => {
            const card = renderEventCard(event, true);
            favoritesContainer.appendChild(card);
        });
    }

    renderFavoritesList();

    // 🎁 Export button
    exportBtn?.addEventListener("click", () => {
        exportFavoritesAsFile();
        showToast("Favorites exported successfully!", "success");
    });

    // 🔗 Share button
    shareBtn?.addEventListener("click", async () => {
        await createShareLink();
        showToast("Share link copied to clipboard!", "info");
    });

    // ♻️ Handle remove/share actions on cards
    favoritesContainer.addEventListener("click", async (e) => {
        const card = e.target.closest(".event-card");
        if (!card) return;

        const eventId = card.dataset.eventId;
        const eventData = favorites.find((f) => f.id == eventId);

        if (e.target.closest("[data-action='share']")) {
            await shareEventById(eventId);
            return;
        }

        if (e.target.closest("[data-action='favorite']")) {
            favorites = favorites.filter((f) => f.id != eventId);
            saveFavoritesForCurrentUser(favorites);
            renderFavoritesList();
            showToast("Removed from favorites ❌", "error");
            return;
        }

        openEventModal(eventData);
    });
})();

// 🗺️ Modal + Google Map setup
function openEventModal(eventData) {
    const modal = document.getElementById("eventModal");
    if (!modal) return;

    document.getElementById("modalTitle").textContent = eventData.title || "Untitled Event";
    document.getElementById("modalDescription").textContent =
        eventData.description || "No description available.";
    document.getElementById("modalImage").src =
        eventData.image || "./src/assets/placeholder.png";

    modal.classList.remove("hidden");

    setTimeout(() => {
        const mapContainer = document.getElementById("modalMap");
        if (window.google && eventData.lat && eventData.lng) {
            const map = new google.maps.Map(mapContainer, {
                center: { lat: eventData.lat, lng: eventData.lng },
                zoom: 5,
            });
            new google.maps.Marker({
                position: { lat: eventData.lat, lng: eventData.lng },
                map,
                title: eventData.title,
            });
        } else {
            mapContainer.innerHTML = "<p>Location not available.</p>";
        }
    }, 400);
}
