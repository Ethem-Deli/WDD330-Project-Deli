// src/main.js
import { initSearch } from "./js/search.mjs";
import { initCardAnimations } from "./js/animations.mjs";
import { fetchEvents } from "./modules/api.js";
import { showToast } from "./js/toast.mjs";
import { ensureGoogleMaps } from "./js/maps-loader.mjs";
import {
  getFavoritesForCurrentUser,
  saveFavoritesForCurrentUser,
  mergeLocalIntoUserFavorites,
  exportFavoritesAsFile,
  createShareLink,
  loadSharedFavoritesFromQuery
} from "./js/favorites.mjs";
import { initHamburgerMenu } from "./js/hamburger.mjs";

/* -------------------------
   Google Maps API Key
--------------------------*/
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

  timelineList.innerHTML = events
    .map(
      (e) => `
      <div class="event-card" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}" class="event-image">
        <div class="card-body">
          <h3>${e.title}</h3>
          <p>${(e.description || "").slice(0, 100)}...</p>
        </div>
        <button class="favorite-btn" title="Favorite">❤️</button>
      </div>`
    )
    .join("");

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

  const exportBtn = document.getElementById("exportFavsBtn");
  const shareBtn = document.getElementById("shareFavsBtn");
  if (exportBtn) exportBtn.onclick = exportFavoritesAsFile;
  if (shareBtn)
    shareBtn.onclick = async () => {
      await createShareLink();
      showToast("Share link copied to clipboard!", "success");
    };
}

/* -------------------------
   Modal + Maps + Share
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
      const map = new Map(modalMap, { zoom: 5, center: position });
      new AdvancedMarkerElement({ map, position, title: eventData.title });
      const link = document.createElement("a");
      link.href = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "📍 View on Google Maps";
      link.style.display = "inline-block";
      link.style.marginTop = "8px";
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
    if (shareBtn) {
      shareBtn.onclick = () => {
        try {
          const payload = btoa(
            unescape(encodeURIComponent(JSON.stringify(eventData)))
          );
          const url = `${location.origin}${location.pathname}?event=${payload}`;
          navigator.clipboard.writeText(url);
          showToast("Event link copied to clipboard!", "success");
        } catch (err) {
          showToast("Failed to create share link", "error");
        }
      };
    }
  }
}

/* -------------------------
   Filters (Theme / Year / Decade)
--------------------------*/
function detectTheme(event) {
  const text = ((event.title || "") + " " + (event.description || "")).toLowerCase();
  if (text.includes("war")) return "war";
  if (text.includes("revolution")) return "revolution";
  if (text.includes("flight") || text.includes("moon") || text.includes("internet") || text.includes("industrial"))
    return "technology";
  if (text.includes("discovery") || text.includes("exploration"))
    return "exploration";
  return "general";
}

function populateFilters(events) {
  const yearSel = document.getElementById("filterYear");
  const decadeSel = document.getElementById("filterDecade");
  const themeSel = document.getElementById("filterTheme");
  if (!yearSel || !decadeSel || !themeSel) return;

  yearSel.innerHTML = `<option value="all">All years</option>`;
  decadeSel.innerHTML = `<option value="all">All decades</option>`;
  themeSel.innerHTML = `<option value="all">All themes</option>`;

  const years = [...new Set(events.map((e) => e.year).filter(Boolean))].sort((a, b) => a - b);
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  });

  const decades = [
    ...new Set(events.map((e) => Math.floor(e.year / 10) * 10).filter((n) => Number.isFinite(n))),
  ].sort((a, b) => a - b);
  decades.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d}s`;
    decadeSel.appendChild(opt);
  });

  const themes = [...new Set(events.map((e) => e.theme || detectTheme(e)))];
  themes.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    themeSel.appendChild(opt);
  });
}

function applyFilters() {
  const year = document.getElementById("filterYear")?.value || "all";
  const decade = document.getElementById("filterDecade")?.value || "all";
  const theme = document.getElementById("filterTheme")?.value || "all";

  let filtered = [...allEvents];
  if (year !== "all") filtered = filtered.filter((e) => e.year == year);
  else if (decade !== "all") {
    const start = Number(decade);
    filtered = filtered.filter((e) => e.year >= start && e.year < start + 10);
  }
  if (theme !== "all")
    filtered = filtered.filter((e) => (e.theme || detectTheme(e)) === theme);

  renderTimeline(filtered);
}

/* -------------------------
   Favorites Logic
--------------------------*/
async function toggleFavoriteForEvent(eventData) {
  try {
    const favs = await getFavoritesForCurrentUser();
    const exists = favs.find((f) => f && f.id === eventData.id);
    if (exists) {
      const updated = favs.filter((f) => f && f.id !== eventData.id);
      await saveFavoritesForCurrentUser(updated);
      showToast("Removed from favorites ❌", "error");
    } else {
      favs.push(eventData);
      await saveFavoritesForCurrentUser(favs);
      showToast("Added to favorites ❤️", "success");
    }
    await renderFavoritesUI();
  } catch (err) {
    console.error("toggleFavorite error", err);
    showToast("Failed toggling favorite", "error");
  }
}

/* -------------------------
   Shared Event Links
--------------------------*/
function loadSharedEventLink() {
  const params = new URLSearchParams(location.search);
  if (!params.has("event")) return null;
  try {
    const payload = decodeURIComponent(escape(atob(params.get("event"))));
    return JSON.parse(payload);
  } catch (err) {
    console.warn("Failed parsing shared event", err);
    return null;
  }
}

/* -------------------------
   Main
--------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  await loadTemplate("./src/partials/header.html", "header-placeholder");
  await loadTemplate("./src/partials/footer.html", "footer-placeholder");

  // Initialize hamburger menu AFTER header loads
  initHamburgerMenu();

  loadSharedFavoritesFromQuery();

  try {
    const localRes = await fetch("./data/events.json");
    const localEvents = await localRes.json();

    let apiEvents = [];
    try {
      apiEvents = await fetchEvents("World History");
    } catch (err) {
      console.warn("API fetch failed:", err);
    }

    const combinedEvents = [
      ...localEvents.slice(0, 10),
      ...apiEvents.slice(0, 10),
    ];

    const fallback = [
      {
        id: 9991,
        title: "Moon Landing",
        description: "Apollo 11 (1969).",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Aldrin_Apollo_11.jpg",
        year: 1969,
        lat: 0.67408,
        lng: 23.47297,
        theme: "technology",
      },
      {
        id: 9992,
        title: "French Revolution",
        description: "1789 - 1799.",
        image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Prise_de_la_Bastille.jpg",
        year: 1789,
        lat: 48.8566,
        lng: 2.3522,
        theme: "revolution",
      },
    ];

    allEvents = [...fallback, ...combinedEvents].map((e, i) => ({
      id: e.id || i + 1,
      title: e.title || "Untitled Event",
      description: e.description || "No description available.",
      image: e.image || "./src/assets/placeholder.png",
      year: e.year || null,
      lat: e.lat || null,
      lng: e.lng || null,
      theme: e.theme || detectTheme(e),
    }));

    renderTimeline(allEvents);
    await renderFavoritesUI();

    populateFilters(allEvents);
    document.getElementById("filterYear")?.addEventListener("change", applyFilters);
    document.getElementById("filterDecade")?.addEventListener("change", applyFilters);
    document.getElementById("filterTheme")?.addEventListener("change", applyFilters);

    const clearBtn = document.getElementById("clearFiltersBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        document.getElementById("filterYear").value = "all";
        document.getElementById("filterDecade").value = "all";
        document.getElementById("filterTheme").value = "all";
        renderTimeline(allEvents);
      });
    }

    const list = document.getElementById("timelineList");
    const favList = document.getElementById("favoritesList");
    const modal = document.getElementById("eventModal");
    const close = document.getElementById("closeModal");

    if (list) {
      list.addEventListener("click", async (e) => {
        const card = e.target.closest(".event-card");
        if (!card) return;
        const id = Number(card.dataset.id);
        const ev = allEvents.find((x) => Number(x.id) === id);
        if (!ev) return;
        if (e.target.classList.contains("favorite-btn")) {
          await toggleFavoriteForEvent(ev);
        } else {
          openModal(ev);
        }
      });
    }

    if (favList) {
      favList.addEventListener("click", (e) => {
        const card = e.target.closest(".event-card");
        if (!card) return;
        const id = Number(card.dataset.id);
        const ev = allEvents.find((x) => Number(x.id) === id);
        if (ev) openModal(ev);
      });
    }

    if (close) close.addEventListener("click", () => (modal.style.display = "none"));

    const sharedEvent = loadSharedEventLink();
    if (sharedEvent) openModal(sharedEvent);

    initSearch(allEvents, renderTimeline);
  } catch (err) {
    console.error("main load error", err);
    showToast("Failed to load events. See console.", "error");
  }
});
