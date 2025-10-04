import { filterTimelineByQuery } from './timeline.mjs';

export function initSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => filterTimelineByQuery());
    // also trigger filter on enter
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') filterTimelineByQuery(); });
}
