// ✅ Initialize the app after DOM loads
import { fetchEvents } from './modules/api.js';

// // --- Wikimedia Image Fetcher ---
// async function fetchEventImage(searchTerm) {
//     const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
//         searchTerm
//     )}&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

//     try {
//         const res = await fetch(apiUrl);
//         const data = await res.json();

//         if (!data.query) {
//             console.warn(`No Wikimedia image found for: ${searchTerm}`);
//             return null;
//         }

//         const page = Object.values(data.query.pages)[0];
//         const imageUrl = page.imageinfo?.[0]?.url;
//         const caption =
//             page.imageinfo?.[0]?.extmetadata?.ImageDescription?.value ||
//             "No description available.";

//         return { imageUrl, caption };
//     } catch (err) {
//         console.error("Error fetching Wikimedia image:", err);
//         return null;
//     }
// }

async function loadTemplate(path, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const res = await fetch(path);
    container.innerHTML = await res.text();
}
document.addEventListener('DOMContentLoaded', async () => {
    await loadTemplate('../partials/header.html', 'header-placeholder');
    await loadTemplate('../partials/footer.html', 'footer-placeholder');

    const timelineList = document.getElementById('timelineList');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        const events = await fetchEvents(query);

        // For each event, fetch image
        const eventsWithImages = await Promise.all(events.map(async e => ({
            ...e,
            image: await fetchImage(e.title),
            lat: 0,
            lng: 0
        })));

        renderTimeline(eventsWithImages);
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const timelineList = document.getElementById('timelineList');
    const favoritesList = document.getElementById('favoritesList');
    const modal = document.getElementById('eventModal');
    const closeModal = document.getElementById('closeModal');

    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalMap = document.getElementById('modalMap');

    // // === Example event data ===
    // const events = [
    //     {
    //         id: 1,
    //         title: "Moon Landing",
    //         description: "Apollo 11 was the first crewed mission to land on the Moon in 1969.",
    //         image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Apollo_11_Lunar_Module_on_the_Moon.jpg",
    //         lat: 0, lng: 0
    //     },
    //     {
    //         id: 2,
    //         title: "Printing Press Invented",
    //         description: "Gutenberg's printing press revolutionized knowledge distribution.",
    //         image: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Gutenberg.jpg",
    //         lat: 49.9929, lng: 8.2473
    //     },
    //     {
    //         id: 3,
    //         title: "World War II Begins",
    //         description: "In 1939, WWII began, reshaping the world dramatically.",
    //         image: "https://upload.wikimedia.org/wikipedia/commons/5/59/WWII_collage.png",
    //         lat: 52.52, lng: 13.405
    //     }
    // ];

    // === FAVORITES STORAGE ===
    function getFavorites() {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    }
    function saveFavorites(favs) {
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
    function isFavorited(id) {
        return getFavorites().some(f => f.id === id);
    }

    // === RENDER TIMELINE ===
    function renderTimeline() {
        timelineList.innerHTML = events.map(e => `
      <div class="event-card" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}">
        <div class="card-body">
          <h3>${e.title}</h3>
          <p>${e.description.slice(0, 60)}...</p>
        </div>
        <button class="favorite-btn ${isFavorited(e.id) ? 'active' : ''}" title="Favorite">
          ❤️
        </button>
      </div>
    `).join('');
    }

    // === RENDER FAVORITES ===
    function renderFavorites() {
        const favs = getFavorites();
        favoritesList.innerHTML = favs.length ? favs.map(e => `
      <div class="event-card small" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}">
        <div class="card-body">
          <h4>${e.title}</h4>
        </div>
      </div>
    `).join('') : `<p>No favorites yet ❤️</p>`;
    }

    // === MODAL OPEN ===
    function openModal(eventData) {
        modalImage.src = eventData.image;
        modalTitle.textContent = eventData.title;
        modalDescription.textContent = eventData.description;

        // ✅ Dynamic map in modal
        modalMap.innerHTML = `<div id="event-map" style="width:100%;height:250px;"></div>`;
        if (window.google && window.google.maps) {
            showEventLocation(eventData.lat, eventData.lng);
        }

        modal.classList.remove('hidden');
    }

    // === EVENT HANDLERS ===
    timelineList.addEventListener('click', (e) => {
        const card = e.target.closest('.event-card');
        if (!card) return;
        const id = parseInt(card.dataset.id);
        const eventData = events.find(ev => ev.id === id);

        // Favorite button
        if (e.target.classList.contains('favorite-btn')) {
            const favs = getFavorites();
            if (isFavorited(id)) {
                saveFavorites(favs.filter(f => f.id !== id));
            } else {
                favs.push(eventData);
                saveFavorites(favs);
            }
            renderTimeline();
            renderFavorites();
            return;
        }

        // Otherwise open modal
        if (eventData) openModal(eventData);
    });

    favoritesList.addEventListener('click', (e) => {
        const card = e.target.closest('.event-card');
        if (card) {
            const id = parseInt(card.dataset.id);
            const eventData = events.find(ev => ev.id === id);
            if (eventData) openModal(eventData);
        }
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // === Initial render ===
    renderTimeline();
    renderFavorites();
});


// ✅ GLOBAL GOOGLE MAP CALLBACK
window.initMap = function () {
    console.log("✅ Google Maps API loaded successfully");
    // Create a default world map instance for modal updates
    const defaultMapContainer = document.createElement('div');
    defaultMapContainer.id = 'default-map';
    defaultMapContainer.style.display = 'none';
    document.body.appendChild(defaultMapContainer);

    const map = new google.maps.Map(defaultMapContainer, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
    });

    // Store the global reference
    window._historyTimelineMap = map;
};


// ✅ Show event location when modal opens
function showEventLocation(lat, lng) {
    const mapContainer = document.getElementById("event-map");
    if (!mapContainer || !window.google || !window.google.maps) return;

    const pos = { lat, lng };
    const map = new google.maps.Map(mapContainer, {
        center: pos,
        zoom: 4,
    });

    new google.maps.Marker({
        position: pos,
        map,
    });
}
// --- Wikimedia Image Fetcher ---
async function fetchEventImage(searchTerm) {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        searchTerm
    )}&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;

    try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!data.query) {
            console.warn(`No Wikimedia image found for: ${searchTerm}`);
            return null;
        }

        const page = Object.values(data.query.pages)[0];
        const imageUrl = page.imageinfo?.[0]?.url;
        const caption =
            page.imageinfo?.[0]?.extmetadata?.ImageDescription?.value ||
            "No description available.";

        return { imageUrl, caption };
    } catch (err) {
        console.error("Error fetching Wikimedia image:", err);
        return null;
    }
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
    
} document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
});
