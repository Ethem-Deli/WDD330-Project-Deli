// src/js/search.mjs

/**
 * Initializes live search for timeline events.
 * @param {Array} events - All event objects from events.json
 * @param {Function} renderFunction - Function that re-renders timeline list
 */
export function initSearch(events, renderFunction) {
    const searchInput = document.getElementById("globalSearch");
    const searchBtn = document.getElementById("searchBtn");

    if (!searchInput || !searchBtn) {
        console.warn("🔍 Search input or button not found in header.");
        return;
    }

    const handleSearch = () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            renderFunction(events); // reset list if empty search
            return;
        }

        const filtered = events.filter(ev => {
            const title = ev.title?.toLowerCase() || "";
            const desc = ev.description?.toLowerCase() || "";
            const year = ev.year?.toString() || "";
            const theme = ev.theme?.toLowerCase() || ""; // optional

            return (
                title.includes(query) ||
                desc.includes(query) ||
                year.includes(query) ||
                theme.includes(query)
            );
        });

        renderFunction(filtered);
    };

    // 🔄 Live filter on typing and button click
    searchInput.addEventListener("input", handleSearch);
    searchBtn.addEventListener("click", handleSearch);
}
