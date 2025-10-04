import { fetchWikipediaEvents, fetchWikimediaImage } from './api.mjs';
import { addFavorite } from './favorites.mjs';

// store events in module memory so search/filter can use them
let ALL_EVENTS = [];

export async function initTimeline() {
  // For demo: fetch a sample date. Later you will fetch many events or your own dataset.
  const events = await fetchWikipediaEvents('October_3');
  ALL_EVENTS = events;
  renderTimeline(ALL_EVENTS);
}

export function renderTimeline(events) {
  const list = document.getElementById('timelineList');
  list.innerHTML = '';
  if (!events.length) {
    list.innerHTML = '<p>No events found.</p>'; return;
  }
  events.forEach(ev => {
    const item = document.createElement('div');
    item.className = 'timeline-event';
    item.innerHTML = `<strong>${ev.title}</strong><div class="meta">${ev.year || ''} — ${ev.location || ''}</div>`;
    item.addEventListener('click', () => showEventDetails(ev));
    list.appendChild(item);
  });
}

// Exposed function for search + filter in main.js
export function filterTimelineByQuery() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const topic = document.getElementById('topicFilter').value;
  const yearVal = parseInt(document.getElementById('yearRange').value, 10);

  let filtered = ALL_EVENTS.filter(e => {
    const matchesQuery = q ? ((e.title || '').toLowerCase().includes(q) || (e.extract || '').toLowerCase().includes(q)) : true;
    const matchesTopic = (topic === 'all') ? true : ((e.tags || []).includes(topic) || ((e.category || '') === topic));
    const matchesYear = !e.year ? true : (Math.abs((e.year) - yearVal) <= 50); // simple proximity filter
    return matchesQuery && matchesTopic && matchesYear;
  });

  renderTimeline(filtered);
}

async function showEventDetails(event) {
  const el = document.getElementById('detailsContent');
  el.innerHTML = `<h3>${event.title}</h3><p>${event.extract || ''}</p><p class="meta">Loading image…</p>`;
  const imgUrl = await fetchWikimediaImage(event.title);
  let imgHTML = '';
  if (imgUrl) imgHTML = `<img src="${imgUrl}" alt="${event.title}">`;
  else if (event.thumbnail) imgHTML = `<img src="${event.thumbnail.source}" alt="${event.title}">`;
  else imgHTML = `<p><em>No image</em></p>`;

  el.innerHTML = `
    <h3>${event.title}</h3>
    <div class="meta">${event.year || ''} — ${event.location || ''}</div>
    <div>${event.extract || ''}</div>
    ${imgHTML}
    <div style="margin-top:0.5rem;">
      <button id="addToFav">Add to Favorites</button>
    </div>
  `;
  document.getElementById('addToFav').addEventListener('click', () => addFavorite(event));
  // If map has geocode capability, center map here:
  if (window.__centerMapOn) window.__centerMapOn(event);
}
