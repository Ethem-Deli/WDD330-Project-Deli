let eventsData = [];
let filteredEvents = [];

export async function initTimeline() {
  await loadEvents();
  applyFilters(); // initial render

  // Hook up filters
  document.getElementById('yearRange').addEventListener('input', () => {
    document.getElementById('yearLabel').textContent = document.getElementById('yearRange').value;
    applyFilters();
  });

  document.getElementById('topicFilter').addEventListener('change', applyFilters);

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', applyFilters);
}

async function loadEvents() {
  try {
    const res = await fetch('/events.json');
    eventsData = await res.json();
  } catch (err) {
    console.error('Failed to load events:', err);
    eventsData = [];
  }
}

function applyFilters() {
  const yearValue = parseInt(document.getElementById('yearRange').value, 10);
  const topicValue = document.getElementById('topicFilter').value;
  const searchValue = document.getElementById('searchInput').value.toLowerCase();

  filteredEvents = eventsData.filter(ev => {
    const matchesYear = Math.abs(ev.year - yearValue) <= 50; // +/- 50 years around selected
    const matchesTopic = topicValue === 'all' || ev.theme === topicValue;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchValue) ||
      ev.description.toLowerCase().includes(searchValue) ||
      ev.location.toLowerCase().includes(searchValue);

    return matchesYear && matchesTopic && matchesSearch;
  });

  renderTimeline();
}

function renderTimeline() {
  const container = document.getElementById('timelineList');
  container.innerHTML = '';

  if (!filteredEvents.length) {
    container.innerHTML = '<p>No events found.</p>';
    return;
  }

  filteredEvents.forEach(event => {
    const div = document.createElement('div');
    div.className = 'timeline-event';
    div.innerHTML = `
      <strong>${event.year}</strong> — ${event.title}
    `;
    div.addEventListener('click', () => showEventDetails(event));
    container.appendChild(div);
  });
}

function showEventDetails(event) {
  const details = document.getElementById('detailsContent');
  details.innerHTML = `
    <h3>${event.title}</h3>
    <p><strong>Year:</strong> ${event.year}</p>
    <p><strong>Theme:</strong> ${event.theme}</p>
    <p>${event.description}</p>
    <img src="${event.image}" alt="${event.title}" style="max-width:100%;border-radius:8px;margin-top:10px;">
  `;
}
export function filterTimelineByQuery() {
  applyFilters();
}
