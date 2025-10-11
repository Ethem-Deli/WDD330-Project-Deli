// ✅ src/main.js — final clean version (working modal + Google Maps)

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
        <button class="favorite-btn ${isFavorited(e.id) ? "active" : ""}" title="Favorite">❤️</button>
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

// --- Modal (only one version) ---
function openModal(eventData) {
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalImage = document.getElementById("modalImage");
  const modalDescription = document.getElementById("modalDescription");
  const modalMap = document.getElementById("modalMap");

  if (!modal || !eventData) return;

  modalTitle.textContent = eventData.title;
  modalImage.src = eventData.image;
  modalDescription.textContent = eventData.description;
  modalMap.innerHTML = ""; // reset old map

  modal.style.display = "block";

  // ✅ Initialize Google Map
  setTimeout(() => {
    if (window.google && google.maps) {
      if (eventData.lat && eventData.lng) {
        const position = { lat: eventData.lat, lng: eventData.lng };
        const map = new google.maps.Map(modalMap, {
          zoom: 5,
          center: position,
        });
        new google.maps.Marker({ position, map, title: eventData.title });
      } else {
        modalMap.innerHTML = "<p>Location not available.</p>";
      }
    } else {
      console.error("❌ Google Maps not loaded yet.");
    }
  }, 400);
}
window.addEventListener("click", e => {
  const modal = document.getElementById("eventModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
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
    closeModal.addEventListener("click", () => (modal.style.display = "none"));
  } catch (err) {
    console.error("Error loading events:", err);
  }
});

// --- Fallback global init for Google Maps ---
window.initMap = () => {
  console.log("Google Maps script loaded.");
};
