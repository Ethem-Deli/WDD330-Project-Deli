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

// --- Load Events and Enrich with Wikimedia Images ---
async function loadEvents() {
    try {
        const response = await fetch("/data/events.json");
        const events = await response.json();

        for (const event of events) {
            // fetch Wikimedia image by searchTerm
            const imageData = await fetchEventImage(event.searchTerm || event.title);
            if (imageData) {
                event.image = imageData.imageUrl;
                event.description += `<br><em>${imageData.caption}</em>`;
            } else {
                // fallback image if nothing found
                event.image = "/assets/default-placeholder.png";
            }
        }

        // Render to the page
        displayEvents(events);
    } catch (error) {
        console.error("Error loading events:", error);
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
function renderEventCard(event) {
    return `
    <div class="event-card">
      <img src="${event.image}" alt="${event.title}">
      <h3>${event.title}</h3>
      <p>${event.description}</p>
    </div>
  `;
}
