// src/main.js
import { initSearch } from "./js/search.mjs";
import { initCardAnimations } from "./js/animations.mjs";
import { fetchEvents } from "./modules/api.js";
import { ensureGoogleMaps } from "./js/maps-loader.mjs";
import {
  getFavoritesForCurrentUser,
  saveFavoritesForCurrentUser,
  exportFavoritesAsFile,
  createShareLink,
  loadSharedFavoritesFromQuery,
} from "./js/favorites.mjs";
import { initHamburgerMenu } from "./js/hamburger.mjs";
import { showToast } from "./js/toast.mjs";
import { initSearchFilter } from "./modules/timeline.js";

window.showToast = showToast;

//  Google Maps API Key
const GMAPS_KEY = "AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk";
let allEvents = [];

/* -------------------------
   Template Loader
--------------------------*/
async function loadTemplate(path, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const res = await fetch(path);
  container.innerHTML = await res.text();
}

/* -------------------------
   Timeline Renderer
--------------------------*/
function renderTimeline(events = []) {
  const timelineList = document.getElementById("timelineList");
  if (!timelineList) return;

  if (!events || events.length === 0) {
    timelineList.innerHTML = `<p class="no-results">No events found for your search.</p>`;
    return;
  }

  timelineList.innerHTML = "";
  events.forEach((e) => {
    const card = document.createElement("div");
    card.className = "event-card entering";
    card.dataset.id = e.id;
    card.innerHTML = `
      <img src="${e.image}" alt="${e.title}" class="event-image">
      <div class="card-body">
        <h3>${e.title}</h3>
        <p>${(e.description || "").slice(0, 100)}...</p>
      </div>
      <button class="favorite-btn ${e.isFavorite ? "active" : ""}" title="Favorite">❤️</button>
    `;
    timelineList.appendChild(card);
    requestAnimationFrame(() => card.classList.remove("entering"));
  });

  initCardAnimations();
}

/* -------------------------
   Favorites Renderer
--------------------------*/
async function renderFavoritesUI() {
  const favs = await getFavoritesForCurrentUser();
  const list = document.getElementById("favoritesList");
  if (!list) return;

  list.innerHTML = `
    <div class="favorites-header">
      <h3>Your Favorites</h3>
      <div class="fav-actions">
        <button id="exportFavsBtn" class="btn-small">⬇️ Export</button>
        <button id="shareFavsBtn" class="btn-small">🔗 Share</button>
      </div>
    </div>
    ${favs.length
      ? favs
        .map(
          (e) => `
              <div class="event-card small" data-id="${e.id}">
                <img src="${e.image}" alt="${e.title}" class="event-image-small">
                <div class="card-body"><h4>${e.title}</h4></div>
              </div>`
        )
        .join("")
      : `<p>No favorites yet ❤️</p>`
    }
  `;

  document
    .getElementById("exportFavsBtn")
    ?.addEventListener("click", exportFavoritesAsFile);
  document.getElementById("shareFavsBtn")?.addEventListener("click", async () => {
    await createShareLink();
    showToast("📋 Share link copied to clipboard!", "success");
  });

  attachFavoriteCardClicksInFavorites(favs);
}

/* -------------------------
   Favorite Cards Modal
--------------------------*/
function attachFavoriteCardClicksInFavorites(favs) {
  const favCards = document.querySelectorAll("#favoritesList .event-card.small");
  favCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = Number(card.dataset.id);
      const eventData = favs.find((f) => f && f.id === id);
      if (eventData) openModal(eventData);
    });
  });
}

/* -------------------------
   Modal + Map + Share
--------------------------*/
async function openModal(eventData) {
  const modal = document.getElementById("eventModal");
  if (!modal || !eventData) return;

  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const modalMap = document.getElementById("modalMap");
  const modalFooter = document.getElementById("modalFooter");

  modalTitle.textContent = eventData.title || "";
  modalImage.src = eventData.image || "./src/assets/placeholder.png";
  modalDescription.textContent =
    eventData.description || "No description available.";
  modalMap.innerHTML = "Loading map...";
  if (modalFooter) modalFooter.innerHTML = "";

  modal.style.display = "block";

  try {
    await ensureGoogleMaps(GMAPS_KEY);
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    let { lat, lng } = eventData;

    if (!lat || !lng) {
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            eventData.title
          )}&key=${GMAPS_KEY}`
        );
        const geoJson = await geoRes.json();
        if (geoJson.status === "OK" && geoJson.results?.[0]) {
          const loc = geoJson.results[0].geometry.location;
          lat = loc.lat;
          lng = loc.lng;
        }
      } catch (err) {
        console.warn("Geocode fallback failed", err);
      }
    }

    if (lat && lng) {
      const position = { lat: Number(lat), lng: Number(lng) };
      const map = new Map(modalMap, {
        zoom: 5,
        center: position,
        mapId: "DEMO_MAP_ID",
      });
      new AdvancedMarkerElement({ map, position, title: eventData.title });

      const link = document.createElement("a");
      link.href = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "📍 View on Google Maps";
      link.classList.add("map-link");
      modalMap.appendChild(link);
    } else {
      modalMap.innerHTML = "<p>Location not available.</p>";
    }
  } catch (err) {
    console.error("Map render failed", err);
    modalMap.innerHTML = "<p>Map could not be loaded.</p>";
  }

  if (modalFooter) {
    modalFooter.innerHTML = `<button id="shareEventBtn" class="btn-small">🔗 Share this event</button>`;
    const shareBtn = document.getElementById("shareEventBtn");
    shareBtn?.addEventListener("click", () => {
      try {
        const payload = btoa(
          unescape(encodeURIComponent(JSON.stringify(eventData)))
        );
        const url = `${location.origin}${location.pathname}?event=${payload}`;
        navigator.clipboard.writeText(url);
        showToast("Event link copied to clipboard!", "success");
      } catch {
        showToast("Failed to create share link", "error");
      }
    });
  }
}

/* -------------------------
   Modal Close
--------------------------*/
function closeModal() {
  const modal = document.getElementById("eventModal");
  if (modal) modal.style.display = "none";
}

function setupModalClose() {
  const modal = document.getElementById("eventModal");
  const closeBtn = document.querySelector(".close");

  if (!modal) return;
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* -------------------------
   Filters (No Blink Fix)
--------------------------*/
function setupFilters(events) {
  try {
    if (typeof initSearchFilter === "function") {
      let lastRenderIds = [];

      initSearchFilter(events, (filteredEvents) => {
        const newIds = filteredEvents.map((e) => e.id);
        if (JSON.stringify(newIds) !== JSON.stringify(lastRenderIds)) {
          lastRenderIds = newIds;
          renderTimeline(filteredEvents);
          attachAllEventListeners(filteredEvents);
        }
      });
    } else {
      initSearch(events);
    }
  } catch (err) {
    console.warn("Filter initialization failed:", err);
  }
}

/* -------------------------
   Favorites Logic
--------------------------*/
async function toggleFavoriteForEvent(eventData) {
  try {
    const favs = await getFavoritesForCurrentUser();
    const exists = favs.find((f) => f && f.id === eventData.id);
    const button = document.querySelector(
      `.event-card[data-id="${eventData.id}"] .favorite-btn`
    );

    if (exists) {
      const updated = favs.filter((f) => f && f.id !== eventData.id);
      await saveFavoritesForCurrentUser(updated);
      button?.classList.remove("active");
      showToast("❌ Removed from favorites", "error");
    } else {
      favs.push(eventData);
      await saveFavoritesForCurrentUser(favs);
      button?.classList.add("active");
      showToast("✅ Added to favorites", "success");
    }

    await renderFavoritesUI();
  } catch (err) {
    console.error("toggleFavorite error", err);
    showToast("⚠️ Failed toggling favorite", "error");
  }
}

/* -------------------------
   Event Listeners
--------------------------*/
function attachFavoriteListeners(events) {
  const favButtons = document.querySelectorAll("#timelineList .favorite-btn");
  favButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();
      const card = btn.closest(".event-card");
      if (!card) return;
      const id = Number(card.dataset.id);
      const eventData = events.find((ev) => ev && Number(ev.id) === id);
      if (eventData) await toggleFavoriteForEvent(eventData);
    });
  });
}

function attachModalListeners(events) {
  const cards = document.querySelectorAll("#timelineList .event-card");
  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".favorite-btn")) return;
      const id = Number(card.dataset.id);
      const eventData = events.find((ev) => ev && Number(ev.id) === id);
      if (eventData) openModal(eventData);
    });
  });
}

function attachAllEventListeners(events) {
  attachFavoriteListeners(events);
  attachModalListeners(events);
}

/* -------------------------
   Main Entry
--------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  await loadTemplate("./src/partials/header.html", "header-placeholder");
  await loadTemplate("./src/partials/footer.html", "footer-placeholder");

  initHamburgerMenu();
  loadSharedFavoritesFromQuery();

  try {
    const localRes = await fetch("data/events.json");
    const localEvents = await localRes.json();

    let apiEvents = [];
    try {
      apiEvents = await fetchEvents("World History");
      apiEvents = Array.isArray(apiEvents)
        ? apiEvents.filter((e) => e && e.title && e.image)
        : [];
    } catch (err) {
      console.warn("API fetch failed:", err);
    }

    allEvents = [
      ...localEvents,
      ...apiEvents.map((e, i) => ({
        id: e.id || 2000 + i,
        title: e.title,
        description: e.description,
        image: e.image,
        year: e.year,
        lat: e.lat,
        lng: e.lng,
        theme: e.theme || "general",
      })),
    ];

    renderTimeline(allEvents);
    attachAllEventListeners(allEvents);
    setupFilters(allEvents);
    await renderFavoritesUI();
    setupModalClose();
  } catch (err) {
    console.error("main load error", err);
    showToast("Failed to load events", "error");
  }
});
