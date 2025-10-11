// Helper module to fetch events, images, and coordinates from Wikipedia / Wikimedia

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

// low-level helper
async function wikiQuery(params) {
    const url = new URL(WIKI_API_BASE);
    params.format = 'json';
    params.origin = '*';
    Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
    return res.json();
}

/**
 * Search Wikipedia for a query and return a small set of pageids and titles.
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array<{pageid:number,title:string,snippet:string}>>}
 */
export async function searchEvents(query, limit = 10) {
    if (!query || !query.trim()) return [];
    const data = await wikiQuery({
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: String(limit),
        srprop: 'snippet|timestamp'
    });
    if (!data.query || !data.query.search) return [];
    return data.query.search.map(item => ({
        id: item.pageid,
        title: item.title,
        snippet: (item.snippet || '').replace(/<\/?[^>]+(>|$)/g, '')
    }));
}

/**
 * Given an array of pageids (numbers), fetch thumbnails, extracts and coordinates in one API call.
 * Returns a mapping pageid => {thumbnail, extract, coordinates}
 */
export async function getPagesInfo(pageids = []) {
    if (!pageids.length) return {};
    const params = {
        action: 'query',
        pageids: pageids.join('|'),
        prop: 'coordinates|pageimages|extracts',
        piprop: 'thumbnail',
        pithumbsize: '600',
        exintro: '1',
        explaintext: '1'
    };
    const data = await wikiQuery(params);
    const out = {};
    if (!data.query || !data.query.pages) return out;
    for (const pid of Object.keys(data.query.pages)) {
        const p = data.query.pages[pid];
        out[pid] = {
            pageid: p.pageid,
            title: p.title,
            thumbnail: p.thumbnail ? p.thumbnail.source : null,
            extract: p.extract || '',
            coordinates: p.coordinates && p.coordinates[0] ? { lat: p.coordinates[0].lat, lon: p.coordinates[0].lon } : null
        };
    }
    return out;
}

/**
 * High-level function used by the app to fetch events with image & coords.
 * @param {string} query
 * @returns {Promise<Array<{id,title,description,image,lat,lng,pageid}>>}
 */
export async function fetchEvents(query) {
    try {
        const searchResults = await searchEvents(query, 12);
        if (!searchResults.length) return [];

        const pageids = searchResults.map(r => r.id);
        const pagesInfo = await getPagesInfo(pageids);

        // assemble results
        return searchResults.map(sr => {
            const pid = String(sr.id);
            const info = pagesInfo[pid] || {};
            return {
                id: sr.id,
                pageid: sr.id,
                title: sr.title,
                description: info.extract || sr.snippet || '',
                image: info.thumbnail || './src/assests/logo.png', // fallback image
                lat: info.coordinates ? info.coordinates.lat : null,
                lng: info.coordinates ? info.coordinates.lon : null
            };
        });
    } catch (err) {
        console.error('fetchEvents error', err);
        return [];
    }
}
