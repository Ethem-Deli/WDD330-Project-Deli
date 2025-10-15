import {
    getFavoritesForCurrentUser,
    saveFavoritesForCurrentUser,
    exportFavoritesAsFile,
    createShareLink,
} from "./favorites.mjs";
import { showToast } from "./toast.mjs";

document.addEventListener("DOMContentLoaded", async () => {
    await renderFavorites();
    setupModalClose();
});

/* -----------------------------------------
   🧭 Render favorite cards
------------------------------------------ */
async function renderFavorites() {
    const container = document.getElementById("favoritesList");
    if (!container) return;

    let favs = await getFavoritesForCurrentUser();
    if (!Array.isArray(favs)) favs = [];

    if (favs.length === 0) {
        container.innerHTML = `
      <p class="no-favorites">No favorites yet ❤️</p>
    `;
        return;
    }

    container.innerHTML = favs
        .map(
            (e) => `
      <div class="event-card" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}">
        <div class="event-info">
          <h3>${e.title}</h3>
          <p>${(e.description || "").slice(0, 80)}...</p>
          <button class="remove-fav-btn">💔 Remove</button>
        </div>
      </div>
    `
        )
        .join("");

    attachEventListeners(favs);
}

/* -----------------------------------------
   🧩 Attach remove, open, export, share
------------------------------------------ */
function attachEventListeners(favs) {
    // ✅ Remove from favorites
    document.querySelectorAll(".remove-fav-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const card = btn.closest(".event-card");
            if (!card) return;
            const eventId = Number(card.dataset.id);

            const updatedFavs = favs.filter((f) => f.id !== eventId);
            await saveFavoritesForCurrentUser(updatedFavs);
            showToast("❌ Removed from favorites", "error");
            await renderFavorites(); // instantly refresh
        });
    });

    // ✅ Open modal
    document.querySelectorAll(".event-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".remove-fav-btn")) return;
            const id = Number(card.dataset.id);
            const eventData = favs.find((f) => f.id === id);
            if (eventData) openModal(eventData);
        });
    });

    // ✅ Export
    document.getElementById("exportFavsBtn")?.addEventListener("click", () => {
        exportFavoritesAsFile(favs);
        showToast("✅ Favorites exported!", "success");
    });

    // ✅ Share
    document.getElementById("shareFavsBtn")?.addEventListener("click", async () => {
        await createShareLink(favs);
        showToast("📋 Share link copied to clipboard!", "success");
    });
}

/* -----------------------------------------
   🗺️ Modal logic
------------------------------------------ */
function openModal(eventData) {
    const modal = document.getElementById("eventModal");
    if (!modal) return;

    document.getElementById("modalTitle").textContent = eventData.title || "";
    document.getElementById("modalDescription").textContent =
        eventData.description || "No description available.";
    document.getElementById("modalImage").src =
        eventData.image || "./src/assets/placeholder.png";

    const mapContainer = document.getElementById("modalMap");
    mapContainer.innerHTML = "";

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

    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

/* -----------------------------------------
   🧭 Close modal logic
------------------------------------------ */
function setupModalClose() {
    const modal = document.getElementById("eventModal");
    const close = document.getElementById("closeModal");

    close?.addEventListener("click", closeModal);
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
}

function closeModal() {
    const modal = document.getElementById("eventModal");
    if (!modal) return;
    modal.style.display = "none";
    modal.classList.add("hidden");
}
