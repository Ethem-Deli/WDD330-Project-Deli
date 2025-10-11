// favorites module
export function loadFavorites() {
    const list = document.getElementById('favoritesList');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.length) {
        list.innerHTML = '<li><em>No favorites yet</em></li>';
        return;
    }
    list.innerHTML = favorites.map((f, i) =>
        `<li data-i="${i}">${f.title || f.name} <button data-i="${i}" class="removeFavBtn">Remove</button></li>`
    ).join('');
    list.querySelectorAll('.removeFavBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.i, 10);
            removeFavorite(idx);
        });
    });
}

export function addFavorite(event) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.find(f => f.title === event.title)) {
        favorites.push(event);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
        alert('Added to favorites');
    } else {
        alert('Already in favorites');
    }
}

function removeFavorite(idx) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(idx, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}

export function exportFavoritesAsFile() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorites-timeline.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Create a shareable link with favorites encoded in URL (base64)
export function createShareLink() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(favorites))));
    const url = `${location.origin}${location.pathname}?shared=${payload}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('Share URL copied to clipboard');
    });
}

// If page loaded with ?shared=..., decode and load into favorites (call on page load if needed)
export function loadSharedFavoritesFromQuery() {
    const params = new URLSearchParams(location.search);
    if (params.has('shared')) {
        try {
            const payload = decodeURIComponent(escape(atob(params.get('shared'))));
            const arr = JSON.parse(payload);
            localStorage.setItem('favorites', JSON.stringify(arr));
            loadFavorites();
        } catch (err) {
            console.error('Failed to load shared favorites', err);
        }
    }
}

// ✅ Correctly exported function for favorites retrieval
export function getFavoritesForCurrentUser() {
    try {
        const user = localStorage.getItem("currentUser");
        if (!user) {
            console.warn("⚠️ No user logged in — returning empty favorites list.");
            return [];
        }

        const favoritesKey = `favorites_${user}`;
        const storedFavorites = localStorage.getItem(favoritesKey);

        if (!storedFavorites) return [];

        const favorites = JSON.parse(storedFavorites);
        console.info(`✅ Loaded ${favorites.length} favorites for ${user}.`);
        return favorites;
    } catch (error) {
        console.error("❌ Failed to load favorites:", error);
        return [];
    }
}
