// src/js/timeline-utils.mjs
import { fetchWikipediaSummary } from "./mediaHelpers.mjs";
import { loadGoogleMaps } from "./maps-loader.mjs";
import { getFavoritesForCurrentUser, saveFavoritesForCurrentUser } from "./favorites.mjs";
import { showToast } from "./toast.mjs";

const state = {
  events: [],
  favorites: [],
  filters: { theme: null, yearFrom: null, yearTo: null, q: null },
};

/* --------------------------------
   INITIALIZE TIMELINE
---------------------------------- */
export async function initTimeline(events = []) {
  state.events = events;
  state.favorites = await getFavoritesForCurrentUser();
  renderHeader();
  renderTimeline();
  attachGlobalListeners();
}

/* --------------------------------
   HEADER RENDER + SEARCH
---------------------------------- */
function renderHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  header.innerHTML = `
    <div class="container flex" style="gap:1rem;align-items:center">
      <div class="logo">
        <img src="/src/assets/logo.png" alt="logo" style="height:44px"/>
        <strong style="margin-left:.5rem">HISTORY TIMELINE</strong>
      </div>
      <div class="header-search" style="margin-left:auto">
        <input id="searchInput" placeholder="Search events..." />
        <button id="searchBtn">Search</button>
      </div>
      <nav>
        <a href="/">Home</a>
        <a href="/favorites.html">Favorites</a>
      </nav>
    </div>
  `;

  document
    .getElementById("searchBtn")
    ?.addEventListener("click", applySearch);
  document
    .getElementById("searchInput")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applySearch();
    });
}

function applySearch() {
  const q = document.getElementById("searchInput")?.value.trim().toLowerCase();
  state.filters.q = q || null;
  renderTimeline();
}

/* --------------------------------
   RENDER TIMELINE
---------------------------------- */
function renderTimeline() {
  const container = document.getElementById("timeline");
  if (!container) return;

  let filtered = [...state.events];
  if (state.filters.q) {
    filtered = filtered.filter((e) =>
      e.title.toLowerCase().includes(state.filters.q)
    );
  }

  container.innerHTML = "";
  filtered.forEach((event) => {
    const card = document.createElement("div");
    card.classList.add("event-card");
    card.dataset.id = event.id;

    const isFavorite = state.favorites.some((f) => f.id === event.id);

    card.innerHTML = `
      <img src="${event.image}" alt="${event.title}" style="max-width:100%; border-radius:12px;">
      <div class="event-info">
        <h3>${event.title}</h3>
        <p><strong>Year:</strong> ${event.year}</p>
        <p>${event.description || ""}</p>
        <p><em>${event.location?.name || ""}</em></p>
        <button class="fav-toggle ${isFavorite ? "active" : ""}" title="Toggle Favorite">
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

/* --------------------------------
   EVENT HANDLERS
---------------------------------- */
function attachGlobalListeners() {
  document.body.addEventListener("click", async (e) => {
    const card = e.target.closest(".event-card");
    if (!card) return;

    const id = card.dataset.id;
    const event = state.events.find((x) => x.id === id);

    if (e.target.matches(".fav-toggle")) {
      await toggleFavorite(event);
      e.stopPropagation();
      return;
    }

    if (event) openEventModal(event);
  });
}

/* --------------------------------
   FAVORITES
---------------------------------- */
async function toggleFavorite(event) {
  if (!event) return;

  const favs = await getFavoritesForCurrentUser();
  const exists = favs.find((f) => f.id === event.id);

  let updated;
  if (exists) {
    updated = favs.filter((f) => f.id !== event.id);
    showToast("❌ Removed from favorites");
  } else {
    updated = [...favs, event];
    showToast("⭐ Added to favorites");
  }

  await saveFavoritesForCurrentUser(updated);
  state.favorites = updated;
  renderTimeline();
}

/* --------------------------------
   MODAL VIEW
---------------------------------- */
async function openEventModal(event) {
  if (!event) return;

  let modal = document.querySelector(".event-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "event-modal";
    Object.assign(modal.style, {
      position: "fixed",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    });

    modal.innerHTML = `
      <div class="modal-card card" style="max-width:900px;width:94%;display:grid;grid-template-columns:1fr 360px;gap:1rem">
        <div class="modal-main">
          <img class="modal-img" style="max-height:320px;object-fit:cover;width:100%;display:block;border-radius:8px;margin-bottom:.5rem" />
          <h2 class="modal-title"></h2>
          <p class="modal-desc"></p>
        </div>
        <aside class="modal-aside">
          <div class="map" style="height:240px;border-radius:8px;background:#eef"></div>
          <div style="margin-top:.6rem">
            <button class="modal-fav">❤️ Add to favorites</button>
          </div>
        </aside>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  modal.querySelector(".modal-img").src = event.image;
  modal.querySelector(".modal-title").textContent = `${event.title} • ${event.year}`;
  modal.querySelector(".modal-desc").textContent = event.description || "";
  modal.querySelector(".modal-fav").onclick = () => toggleFavorite(event);

  await showEventLocationOnMap(event, modal.querySelector(".map"));

  try {
    const summary = await fetchWikipediaSummary(event.title);
    if (summary)
      modal.querySelector(".modal-desc").textContent += "\n\n" + summary;
  } catch {
    // ignore summary errors
  }
}

/* --------------------------------
   MAPS
---------------------------------- */
async function showEventLocationOnMap(event, mapEl) {
  if (!event?.location) {
    mapEl.innerHTML = "<p>Location not available.</p>";
    return;
  }

  try {
    await loadGoogleMaps();
    const map = new google.maps.Map(mapEl, {
      center: { lat: event.location.lat, lng: event.location.lng },
      zoom: 6,
    });
    new google.maps.Marker({
      position: { lat: event.location.lat, lng: event.location.lng },
      map,
    });
  } catch {
    mapEl.innerHTML = "<p>Map could not be loaded.</p>";
  }
}
// ============ EVENT CARD RENDERER ============

/**
 * Render a single event card for favorites or timeline
 * @param {Object} event - Event object
 * @param {boolean} [isFavoritePage=false] - Whether we're on favorites page
 * @returns {HTMLElement} - The rendered card
 */
export function renderEventCard(event, isFavoritePage = false) {
  const card = document.createElement("div");
  card.className = "event-card";
  card.dataset.id = event.id;

  card.innerHTML = `
    <img src="${event.image || ""}" alt="${event.title || "Event"}" style="max-width:100%; border-radius:12px;">
    <div class="event-info">
      <h3>${event.title || event.name || "Unnamed Event"}</h3>
      <p><strong>Year:</strong> ${event.year || event.date || ""}</p>
      <p>${event.description || ""}</p>
      <p><em>${event.location?.name || event.location || ""}</em></p>
      ${!isFavoritePage ? `<button class="favorite-btn" data-id="${event.id}">⭐ Add to Favorites</button>` : ""}
    </div>
  `;

  // Only attach event listeners if on main timeline
  if (!isFavoritePage) {
    const btn = card.querySelector(".favorite-btn");
    btn.addEventListener("click", () => {
      const storedUser = sessionStorage.getItem("currentUser");
      if (!storedUser) {
        alert("Please log in to save favorites.");
        return;
      }

      const userFavorites = JSON.parse(localStorage.getItem(`favorites_${storedUser}`)) || [];
      const exists = userFavorites.some((fav) => fav.id === event.id);

      if (!exists) {
        userFavorites.push(event);
        localStorage.setItem(`favorites_${storedUser}`, JSON.stringify(userFavorites));
        alert("Added to favorites!");
      } else {
        alert("Already in favorites!");
      }
    });
  }

  return card;
}
