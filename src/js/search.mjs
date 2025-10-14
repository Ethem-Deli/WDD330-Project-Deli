export function initSearch(events, renderFunction) {
    const searchInput = document.getElementById("globalSearch");
    const searchBtn = document.getElementById("searchBtn");

    if (!searchInput || !searchBtn) {
        console.warn("🔍 Search input or button not found.");
        return;
    }

    const handleSearch = () => {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            renderFunction(events);
            return;
        }

        const filtered = events.filter((ev) => {
            const title = ev.title?.toLowerCase() || "";
            const desc = ev.description?.toLowerCase() || "";
            const year = ev.year?.toString() || "";
            const theme = ev.theme?.toLowerCase() || "";

            return (
                title.includes(query) ||
                desc.includes(query) ||
                year.includes(query) ||
                theme.includes(query)
            );
        });

        renderFunction(filtered);
    };

    searchInput.addEventListener("input", handleSearch);
    searchBtn.addEventListener("click", handleSearch);
}
