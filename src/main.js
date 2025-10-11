// ✅ src/main.js — final clean version (no duplicates, local images only)

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

  timelineList.innerHTML = events
    .map(
      e => `
      <div class="event-card" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}" class="event-image">
        <div class="card-body">
          <h3>${e.title}</h3>
          <p>${e.description.slice(0, 100)}...</p>
        </div>
        <button class="favorite-btn ${isFavorited(e.id) ? "active" : ""
        }" title="Favorite">❤️</button>
      </div>
    `
    )
    .join("");
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
function openModal(eventData) {
  const modal = document.getElementById("eventModal");
  if (!modal || !eventData) return;

  document.getElementById("modalImage").src = eventData.image;
  document.getElementById("modalTitle").textContent = eventData.title;
  document.getElementById("modalDescription").innerHTML = eventData.description;
  document.getElementById(
    "modalMap"
  ).innerHTML = `<div id="event-map" style="width:100%;height:250px;"></div>`;
  modal.classList.remove("hidden");

  if (window.google && window.google.maps && eventData.lat && eventData.lng) {
    const mapContainer = document.getElementById("event-map");
    const map = new google.maps.Map(mapContainer, {
      center: { lat: eventData.lat, lng: eventData.lng },
      zoom: 5,
    });
    new google.maps.Marker({
      position: { lat: eventData.lat, lng: eventData.lng },
      map,
    });
  }
}

// --- Main ---
document.addEventListener("DOMContentLoaded", async () => {
  await loadTemplate("./src/partials/header.html", "header-placeholder");
  await loadTemplate("./src/partials/footer.html", "footer-placeholder");

  try {
    const response = await fetch("./data/events.json");
    const events = await response.json();

    renderTimeline(events);
    renderFavorites();

    // --- Event listeners ---
    const timelineList = document.getElementById("timelineList");
    const favoritesList = document.getElementById("favoritesList");
    const modal = document.getElementById("eventModal");
    const closeModal = document.getElementById("closeModal");

    // Timeline click (open modal or toggle favorite)
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
        } else {
          favs.push(eventData);
          saveFavorites(favs);
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
    closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  } catch (err) {
    console.error("Error loading events:", err);
  }
});
