// timeline-utils.mjs - renders events, handles filters, favorites, modal, and search
import { fetchWikipediaSummary, fetchWikimediaImage } from "./mediaHelpers.mjs";
import { loadGoogleMaps } from "./maps-loader.mjs";

const state = {
  events: [],
  favorites: new Set(JSON.parse(localStorage.getItem('favorites') || '[]')),
  filters: { theme: null, yearFrom: null, yearTo: null, q: null }
};

export function initTimeline(events) {
  state.events = events;
  renderHeader();
  renderTimeline();
  attachGlobalListeners();
}

function renderHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  header.innerHTML = `
    <div class="container flex" style="gap:1rem;align-items:center">
      <div class="logo"><img src="/src/assets/logo.png" alt="logo" style="height:44px"/> <strong style="margin-left:.5rem">HISTORY TIMELINE</strong></div>
      <div class="header-search" style="margin-left:auto">
        <input id="searchInput" placeholder="Search events..." />
        <button id="searchBtn">Search</button>
      </div>
      <nav>
        <a href="/" data-link>Home</a>
        <a href="/favorites.html" data-link>Favorites</a>
      </nav>
    </div>`;
  document.getElementById('searchBtn')?.addEventListener('click', applySearch);
  document.getElementById('searchInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') applySearch(); });
}

function applySearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  state.filters.q = q || null;
  renderTimeline();
}

function attachGlobalListeners() {
  // delegate clicks to open modal or toggle favorite
  document.body.addEventListener('click', async (e) => {
    const card = e.target.closest('.event-card');
    if (!card) return;
    if (e.target.matches('.fav-toggle')) {
      const id = card.dataset.id;
      toggleFavorite(id);
      e.stopPropagation();
      return;
    }
    const id = card.dataset.id;
    openEventModal(id);
  });
}

function displayEvents(events) {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  events.forEach(event => {
    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <h2>${event.title}</h2>
      <img src="${event.image}" alt="${event.title}" style="max-width:100%; border-radius:12px;">
      <p><strong>Year:</strong> ${event.year}</p>
      <p>${event.description}</p>
      <p><em>${event.location}</em></p>
    `;

    container.appendChild(card);
  });
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  localStorage.setItem('favorites', JSON.stringify(Array.from(state.favorites)));
  renderTimeline();
}

async function openEventModal(id) {
  const ev = state.events.find(x => x.id === id);
  if (!ev) return;
  // create modal
  let modal = document.querySelector('.event-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'event-modal';
    Object.assign(modal.style, { position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 });
    modal.innerHTML = `<div class="modal-card card" style="max-width:900px;width:94%;display:grid;grid-template-columns:1fr 360px;gap:1rem">
        <div class="modal-main">
          <img class="modal-img" style="max-height:320px;object-fit:cover;width:100%;display:block;border-radius:8px;margin-bottom:.5rem" />
          <h2 class="modal-title"></h2>
          <p class="modal-desc"></p>
        </div>
        <aside class="modal-aside">
          <div class="map" style="height:240px;border-radius:8px;background:#eef"></div>
          <div style="margin-top:.6rem"><button class="modal-fav">Save to favorites</button></div>
        </aside>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }
  modal.querySelector('.modal-img').src = ev.image;
  modal.querySelector('.modal-title').textContent = ev.title + ' • ' + ev.year;
  modal.querySelector('.modal-desc').textContent = ev.description || '';
  modal.querySelector('.modal-fav').onclick = () => { toggleFavorite(ev.id); };
  // try to load map if location present
  if (ev.location && window.google && window.google.maps) {
    const mapEl = modal.querySelector('.map');
    const map = new google.maps.Map(mapEl, { center: { lat: ev.location.lat, lng: ev.location.lng }, zoom: 6 });
    new google.maps.Marker({ position: { lat: ev.location.lat, lng: ev.location.lng }, map });
  } else if (ev.location) {
    // attempt load maps library then init
    loadGoogleMaps().then(() => {
      if (window.google && window.google.maps) {
        const mapEl = modal.querySelector('.map');
        const map = new google.maps.Map(mapEl, { center: { lat: ev.location.lat, lng: ev.location.lng }, zoom: 6 });
        new google.maps.Marker({ position: { lat: ev.location.lat, lng: ev.location.lng }, map });
      }
    }).catch(() => { });
  }
  // fetch wikipedia summary asynchronously (non-blocking)
  fetchWikipediaSummary(ev.title).then(sum => {
    if (sum) modal.querySelector('.modal-desc').textContent += '\n\n' + sum;
  }).catch(() => { });
}

function renderEventCard(event) {
  return `
    <div class="event-card">
      <img src="${event.image}" alt="${event.title}">
      <h3>${event.title}</h3>
      <p>${event.description}</p>
    </div>
  `;
}

export { renderEventCard, displayEvents };