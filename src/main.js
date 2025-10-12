// ✅ src/main.js — with Share Links (Phase 18, Fixed + Complete)
import { initSearch } from "./js/search.mjs";
import { initCardAnimations } from "./js/animations.mjs";
import { fetchEvents } from "./modules/api.js";
import { showToast } from "./js/toast.mjs";
import { observeAuthState } from "./js/auth.mjs";
import {
  getFavoritesForCurrentUser,
  saveFavoritesForCurrentUser,
  mergeLocalIntoUserFavorites,
  createShareLink,
  exportFavoritesAsFile,
  loadSharedFavoritesFromQuery
} from "./js/favorites.mjs";

let currentUser = null;
let allEvents = [];

/* -------------------------
   GOOGLE MAPS LOADER
-------------------------- */
async function loadGoogleMaps(apiKey) {
  if (window.google && google.maps) return;
  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-google-maps]");
    if (existing) {
      existing.onload = resolve;
      existing.onerror = reject;
      return;
    }
    const script = document.createElement("script");
    script.dataset.googleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=maps,marker`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/* -------------------------
   TEMPLATE LOADER
-------------------------- */
async function loadTemplate(path, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const res = await fetch(path);
  container.innerHTML = await res.text();
}

/* -------------------------
   TIMELINE RENDERER
-------------------------- */
function renderTimeline(events = []) {
  const timelineList = document.getElementById("timelineList");
  if (!timelineList) return;

  if (!events || events.length === 0) {
    timelineList.innerHTML = `<p class="no-results">No events found for your search.</p>`;
    return;
  }

  timelineList.innerHTML = events
    .map(
      e => `
      <div class="event-card" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}" class="event-image">
        <div class="card-body">
          <h3>${e.title}</h3>
          <p>${e.description.slice(0, 100)}...</p>
        </div>
        <button class="favorite-btn" title="Favorite">❤️</button>
      </div>
    `
    )
    .join("");

  initCardAnimations();
}

/* -------------------------
   FAVORITES RENDERER
-------------------------- */
function renderFavorites(favs = []) {
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
          e => `
              <div class="event-card small" data-id="${e.id}">
                <img src="${e.image}" alt="${e.title}" class="event-image-small">
                <div class="card-body"><h4>${e.title}</h4></div>
              </div>`
        )
        .join("")
      : `<p>No favorites yet ❤️</p>`}
  `;

  // 🆕 Add export/share handlers
  document.getElementById("exportFavsBtn").onclick = exportFavoritesAsFile;
  document.getElementById("shareFavsBtn").onclick = async () => {
    await createShareLink();
    showToast("✅ Share link copied to clipboard!", "success");
  };
}

/* -------------------------
   FAVORITE TOGGLE
-------------------------- */
async function toggleFavorite(eventData) {
  const favs = await getFavoritesForCurrentUser();
  const exists = favs.find(f => f.id === eventData.id);
  if (exists) {
    const updated = favs.filter(f => f.id !== eventData.id);
    await saveFavoritesForCurrentUser(updated);
    showToast("Removed from favorites ❌", "error");
  } else {
    favs.push(eventData);
    await saveFavoritesForCurrentUser(favs);
    showToast("Added to favorites ❤️", "success");
  }
  renderFavorites(await getFavoritesForCurrentUser());
}

/* -------------------------
   OPEN MODAL + MAP + SHARE
-------------------------- */
async function openModal(eventData) {
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const modalMap = document.getElementById("modalMap");
  const modalFooter = document.getElementById("modalFooter");

  if (!modal) return;

  modal.style.display = "block";
  modalTitle.textContent = eventData.title;
  modalImage.src = eventData.image || "./src/assets/placeholder.png";
  modalDescription.textContent =
    eventData.description || "No description available.";
  modalMap.innerHTML = "Loading map...";

  await loadGoogleMaps("AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk");

  try {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const lat = eventData.lat;
    const lng = eventData.lng;
    if (lat && lng) {
      const map = new Map(modalMap, { zoom: 5, center: { lat, lng } });
      new AdvancedMarkerElement({ map, position: { lat, lng }, title: eventData.title });
      const link = document.createElement("a");
      link.href = `https://www.google.com/maps?q=${lat},${lng}`;
      link.target = "_blank";
      link.textContent = "📍 View on Google Maps";
      modalMap.appendChild(link);
    } else {
      modalMap.innerHTML = "<p>Location not available.</p>";
    }
  } catch (err) {
    console.error("Map error:", err);
    modalMap.innerHTML = "<p>Map could not be loaded.</p>";
  }

  // 🆕 Add share button inside modal
  modalFooter.innerHTML = `
    <button id="shareEventBtn" class="btn-small">🔗 Share this event</button>
  `;
  document.getElementById("shareEventBtn").onclick = () => {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(eventData))));
    const url = `${location.origin}${location.pathname}?event=${payload}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("✅ Event link copied to clipboard!", "success");
    });
  };
}

/* -------------------------
   LOAD SHARED EVENT LINK
-------------------------- */
function loadSharedEventLink() {
  const params = new URLSearchParams(location.search);
  if (!params.has("event")) return null;

  try {
    const payload = decodeURIComponent(escape(atob(params.get("event"))));
    return JSON.parse(payload);
  } catch (err) {
    console.error("❌ Failed to parse shared event:", err);
    return null;
  }
}

/* -------------------------
   MAIN APP LOGIC
-------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadTemplate("./src/partials/header.html", "header-placeholder");
  await loadTemplate("./src/partials/footer.html", "footer-placeholder");

  // 🆕 Load shared favorites (if any)
  await loadSharedFavoritesFromQuery();

  observeAuthState(async user => {
    currentUser = user;
    if (user) await mergeLocalIntoUserFavorites();
    renderFavorites(await getFavoritesForCurrentUser());
  });

  try {
    let events = await fetchEvents("World History");
    if (!events.length) {
      const res = await fetch("./data/events.json");
      events = await res.json();
    }

    const fallback = [
      {
        id: 9991,
        title: "Moon landing",
        description: "Apollo 11 was the first manned Moon landing in 1969.",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Aldrin_Apollo_11.jpg",
        lat: 0.67408, lng: 23.47297
      },
      {
        id: 9992,
        title: "French Revolution",
        description: "A major political upheaval in France (1789–1799).",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Prise_de_la_Bastille.jpg",
        lat: 48.8566, lng: 2.3522
      }
    ];

    allEvents = [...fallback, ...events];
    renderTimeline(allEvents);

    // Auto-open shared event (if link contains ?event=)
    const sharedEvent = loadSharedEventLink();
    if (sharedEvent) openModal(sharedEvent);

    initSearch(allEvents, renderTimeline);

    const list = document.getElementById("timelineList");
    const favList = document.getElementById("favoritesList");
    const modal = document.getElementById("eventModal");
    const close = document.getElementById("closeModal");

    // Timeline clicks
    list.addEventListener("click", async e => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      const id = +card.dataset.id;
      const event = allEvents.find(ev => ev.id === id);
      if (!event) return;

      if (e.target.classList.contains("favorite-btn")) {
        await toggleFavorite(event);
      } else {
        openModal(event);
      }
    });

    // Favorites click
    favList.addEventListener("click", e => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      const id = +card.dataset.id;
      const event = allEvents.find(ev => ev.id === id);
      if (event) openModal(event);
    });

    // Close modal
    close.addEventListener("click", () => (modal.style.display = "none"));
  } catch (err) {
    console.error("Error:", err);
    showToast("Failed to load events.", "error");
  }
});

/* -------------------------
   GOOGLE MAPS HOOK
-------------------------- */
window.initMap = () => {
  console.log("✅ Google Maps API initialized.");
};
