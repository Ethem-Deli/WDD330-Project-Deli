// ✅ src/main.js — Stable, with working Maps, API integration, and fallbacks
import { initSearch } from "./js/search.mjs";
import { initCardAnimations } from "./js/animations.mjs";
import { fetchEvents } from "./modules/api.js";
import { showToast } from "./js/toast.mjs";

// ✅ 1. Load Google Maps script before using importLibrary
function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && google.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=maps,marker`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// --- Template Loader ---
async function loadTemplate(path, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const res = await fetch(path);
  container.innerHTML = await res.text();
}

// --- Favorites Management ---
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function isFavorited(id) {
  return getFavorites().some(f => f.id === id);
}

// --- Rendering ---
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
        <button class="favorite-btn ${isFavorited(e.id) ? "active" : ""}" title="Favorite">❤️</button>
      </div>
    `
    )
    .join("");

  initCardAnimations();
}

function renderFavorites() {
  const favoritesList = document.getElementById("favoritesList");
  if (!favoritesList) return;

  const favs = getFavorites();
  favoritesList.innerHTML = favs.length
    ? favs
      .map(
        e => `
        <div class="event-card small" data-id="${e.id}">
          <img src="${e.image}" alt="${e.title}" class="event-image-small">
          <div class="card-body">
            <h4>${e.title}</h4>
          </div>
        </div>
      `
      )
      .join("")
    : `<p>No favorites yet ❤️</p>`;
}

// --- Modal ---
async function openModal(eventData) {
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const modalMap = document.getElementById("modalMap");

  if (!modal || !eventData) return;

  modalTitle.textContent = eventData.title;
  modalImage.src = eventData.image;
  modalDescription.textContent = eventData.description;
  modalMap.innerHTML = "";

  modal.style.display = "block";

  // ✅ Ensure Google Maps API is loaded before using it
  try {
    await loadGoogleMaps("AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk");

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    if (eventData.lat && eventData.lng) {
      const position = { lat: eventData.lat, lng: eventData.lng };
      const map = new Map(modalMap, {
        zoom: 5,
        center: position,
      });
      new AdvancedMarkerElement({
        map,
        position,
        title: eventData.title,
      });
    } else {
      await loadMapForEvent(eventData.title);
    }
  } catch (error) {
    console.error("Google Maps failed to load:", error);
    modalMap.innerHTML = "<p>Map could not be loaded.</p>";
  }
}

// --- Geocode + Map Fallback ---
async function loadMapForEvent(eventTitle) {
  const modalMap = document.getElementById("modalMap");
  if (!modalMap) return;

  try {
    await loadGoogleMaps("AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk");

    const { Map } = await google.maps.importLibrary("maps");
    const { Marker } = await google.maps.importLibrary("marker");

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        eventTitle
      )}&key=AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      const map = new Map(modalMap, {
        zoom: 5,
        center: location,
      });
      new Marker({ position: location, map });
    } else {
      modalMap.innerHTML = "<p>Location not available.</p>";
    }
  } catch (error) {
    console.error("Map load failed:", error);
    modalMap.innerHTML = "<p>Location not available.</p>";
  }
}

// --- Close modal on click outside ---
window.addEventListener("click", e => {
  const modal = document.getElementById("eventModal");
  if (e.target === modal) modal.style.display = "none";
});

// --- Main ---
document.addEventListener("DOMContentLoaded", async () => {
  await loadTemplate("./src/partials/header.html", "header-placeholder");
  await loadTemplate("./src/partials/footer.html", "footer-placeholder");

  try {
    // 🌍 Ensure Google Maps script loads once at startup
    await loadGoogleMaps("AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk");

    // 🌍 Fetch dynamic events from Wikipedia/Wikimedia API
    let events = await fetchEvents("World History");
    if (!events.length) {
      const response = await fetch("./data/events.json");
      events = await response.json();
    }

    // ✅ Add fallback events
    const fallbackEvents = [
      {
        id: 9991,
        title: "Moon landing",
        description:
          "Apollo 11 was the spaceflight that first landed humans on the Moon on July 20, 1969.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/9/9c/Aldrin_Apollo_11.jpg",
        lat: 0.67408,
        lng: 23.47297,
      },
      {
        id: 9992,
        title: "French Revolution",
        description:
          "A period of radical social and political upheaval in France from 1789 to 1799.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/6f/Prise_de_la_Bastille.jpg",
        lat: 48.8566,
        lng: 2.3522,
      },
    ];

    // ✅ Combine static + dynamic data
    events = [...fallbackEvents, ...events];

    renderTimeline(events);
    renderFavorites();

    // 🔍 Search Filter
    initSearch(events, renderTimeline);

    // --- Event Listeners ---
    const timelineList = document.getElementById("timelineList");
    const favoritesList = document.getElementById("favoritesList");
    const modal = document.getElementById("eventModal");
    const closeModal = document.getElementById("closeModal");

    // Timeline click
    timelineList.addEventListener("click", e => {
      const card = e.target.closest(".event-card");
      if (!card) return;

      const id = parseInt(card.dataset.id);
      const eventData = events.find(ev => ev.id === id);
      if (!eventData) return;

      if (e.target.classList.contains("favorite-btn")) {
        const favs = getFavorites();
        if (isFavorited(id)) {
          saveFavorites(favs.filter(f => f.id !== id));
          showToast("Removed from favorites ❌", "error");
        } else {
          favs.push(eventData);
          saveFavorites(favs);
          showToast("Added to favorites ❤️", "success");
        }
        renderTimeline(events);
        renderFavorites();
      } else {
        openModal(eventData);
      }
    });

    // Favorites click (open modal)
    favoritesList.addEventListener("click", e => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      const id = parseInt(card.dataset.id);
      const eventData = events.find(ev => ev.id === id);
      if (eventData) openModal(eventData);
    });

    // Close modal
    closeModal.addEventListener("click", () => (modal.style.display = "none"));
  } catch (err) {
    console.error("Error loading events:", err);
    showToast("Failed to load events. Please retry later.", "error");
  }
});

// --- Google Maps init hook ---
window.initMap = () => {
  console.log("Google Maps API initialized asynchronously.");
};
