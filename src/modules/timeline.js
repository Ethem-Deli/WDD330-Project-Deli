// src/modules/timeline.js
export function initSearchFilter(events, onFilterChange) {
    const yearSelect = document.getElementById("yearFilter");
    const decadeSelect = document.getElementById("decadeFilter");
    const themeSelect = document.getElementById("themeFilter");
    const clearBtn = document.getElementById("clearFiltersBtn");

    if (!yearSelect || !decadeSelect || !themeSelect) {
        console.warn("⚠️ Filter elements not found in DOM.");
        return;
    }

    // Populate dropdowns dynamically from events
    const years = [...new Set(events.map((e) => e.year).filter(Boolean))].sort((a, b) => a - b);
    const decades = [...new Set(events.map((e) => Math.floor(e.year / 10) * 10).filter(Boolean))].sort((a, b) => a - b);
    const themes = [...new Set(events.map((e) => e.theme || "general"))];

    // Fill year filter
    yearSelect.innerHTML = `<option value="all">All Years</option>` +
        years.map((y) => `<option value="${y}">${y}</option>`).join("");

    // Fill decade filter
    decadeSelect.innerHTML = `<option value="all">All Decades</option>` +
        decades.map((d) => `<option value="${d}">${d}s</option>`).join("");

    // Fill theme filter
    themeSelect.innerHTML = `<option value="all">All Themes</option>` +
        themes.map((t) => `<option value="${t}">${t}</option>`).join("");

    //Function to apply all filters
    function applyFilters() {
        const yearVal = yearSelect.value;
        const decadeVal = decadeSelect.value;
        const themeVal = themeSelect.value;

        const filtered = events.filter((e) => {
            const matchYear = yearVal === "all" || String(e.year) === yearVal;
            const matchDecade = decadeVal === "all" || Math.floor(e.year / 10) * 10 === Number(decadeVal);
            const matchTheme = themeVal === "all" || e.theme === themeVal;
            return matchYear && matchDecade && matchTheme;
        });

        if (typeof onFilterChange === "function") {
            onFilterChange(filtered);
        }
    }

    // Attach listeners
    yearSelect.addEventListener("change", applyFilters);
    decadeSelect.addEventListener("change", applyFilters);
    themeSelect.addEventListener("change", applyFilters);

    // Clear filters button
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            yearSelect.value = "all";
            decadeSelect.value = "all";
            themeSelect.value = "all";
            applyFilters();
        });
    }
}
