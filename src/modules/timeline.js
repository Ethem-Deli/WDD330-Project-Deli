// src/modules/timeline.js
// Handles rendering of timeline, filtering, and search.

import { renderMapForEvent } from "./api.js";

/**
 * Render timeline events dynamically into the DOM
 * @param {Array} events - list of event objects
 */
export function renderTimeline(events = []) {
    const timelineContainer = document.querySelector("#timeline");
    if (!timelineContainer) return;

    timelineContainer.innerHTML = "";

    events.forEach((event) => {
        const card = document.createElement("div");
        card.className =
            "timeline-card bg-white rounded-lg shadow p-4 mb-4 transition hover:shadow-lg";

        card.innerHTML = `
      <h3 class="font-serif text-xl font-bold mb-2">${event.title || "Untitled Event"}</h3>
      <p class="text-gray-700 mb-2">${event.date || "Unknown Date"}</p>
      <p class="text-gray-600 mb-3">${event.description || "No description available."}</p>
      ${event.image
                ? `<img src="${event.image}" alt="${event.title}" class="w-full rounded mb-3">`
                : ""
            }
      <button class="show-map bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
        View on Map
      </button>
    `;

        const mapBtn = card.querySelector(".show-map");
        mapBtn.addEventListener("click", () => {
            if (event.lat && event.lng) {
                renderMapForEvent(event.lat, event.lng, event.title);
            } else {
                alert("Location not available for this event.");
            }
        });

        timelineContainer.appendChild(card);
    });
}

/**
 * Filter timeline by keyword
 */
export function filterTimelineByQuery(events, query) {
    if (!query) return events;
    return events.filter((e) => {
        const q = query.toLowerCase();
        return (
            e.title?.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q)
        );
    });
}

/**
 * Initialize search bar and live filter
 */
export function initSearchFilter(events) {
    const searchInput = document.querySelector("#searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const filtered = filterTimelineByQuery(events, e.target.value);
        renderTimeline(filtered);
    });
}

/**
 * Initialize the timeline (fetch + render)
 */
export async function initTimeline() {
    const { fetchEvents } = await import("./api.js");
    const events = await fetchEvents();
    renderTimeline(events);
    initSearchFilter(events);
}
