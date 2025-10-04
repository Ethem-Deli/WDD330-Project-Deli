import './css/styles.css';

import { initTimeline, filterTimelineByQuery } from './js/timeline.mjs';
import { initSearch } from './js/search.mjs';
import { initMap, __initGoogleMaps } from './js/map.mjs';
import { loadFavorites, exportFavoritesAsFile, createShareLink } from './js/favorites.mjs';
import { showDailyFact } from './js/api.mjs';

window.__initGoogleMaps = __initGoogleMaps; // callback for Google Maps loader

document.addEventListener('DOMContentLoaded', async () => {
    // Show daily/random fact
    await showDailyFact();

    // Initialize timeline and modules
    await initTimeline(); // populates events
    initSearch();         // hooks search input to timeline filtering
    initMap();            // initialize map UI
    loadFavorites();      // display favorites

    // UI button wiring
    document.getElementById('exportFavoritesBtn').addEventListener('click', exportFavoritesAsFile);
    document.getElementById('shareFavoritesBtn').addEventListener('click', createShareLink);
    document.getElementById('clearCacheBtn').addEventListener('click', () => {
        // clear image cache
        import('./js/api.mjs').then(mod => {
            mod.clearWikimediaCache();
            alert('Wikimedia cache cleared.');
        });
    });

    // topic + year controls
    document.getElementById('topicFilter').addEventListener('change', (e) => {
        filterTimelineByQuery();
    });
    const yr = document.getElementById('yearRange');
    yr.addEventListener('input', (e) => {
        document.getElementById('yearLabel').textContent = e.target.value;
        filterTimelineByQuery();
    });
});
