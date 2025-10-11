// src/js/favorites.mjs

// 🔹 Get favorites for the logged-in user (or guest)
export function getFavoritesForCurrentUser() {
    try {
        const user = localStorage.getItem("currentUser") || "guest";
        const key = `favorites_${user}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("❌ Failed to load favorites:", err);
        return [];
    }
}

// 🔹 Save favorites for the current user
export function saveFavoritesForCurrentUser(favs) {
    const user = localStorage.getItem("currentUser") || "guest";
    const key = `favorites_${user}`;
    localStorage.setItem(key, JSON.stringify(favs));
}

// 🔹 Export favorites to JSON file
export function exportFavoritesAsFile() {
    const favs = getFavoritesForCurrentUser();
    const blob = new Blob([JSON.stringify(favs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites-timeline.json";
    a.click();
    URL.revokeObjectURL(url);
}

// 🔹 Create shareable link (base64 encoded)
export function createShareLink() {
    const favs = getFavoritesForCurrentUser();
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(favs))));
    const shareUrl = `${location.origin}${location.pathname}?shared=${payload}`;
    navigator.clipboard.writeText(shareUrl).then(() => alert("Share URL copied to clipboard"));
}

// 🔹 Load favorites from ?shared= query parameter
export function loadSharedFavoritesFromQuery() {
    const params = new URLSearchParams(location.search);
    if (!params.has("shared")) return;

    try {
        const payload = decodeURIComponent(escape(atob(params.get("shared"))));
        const imported = JSON.parse(payload);
        saveFavoritesForCurrentUser(imported);
        alert("Imported shared favorites!");
    } catch (err) {
        console.error("❌ Failed to import shared favorites:", err);
    }
}
