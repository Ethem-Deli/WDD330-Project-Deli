// Helper module to fetch events, images, and coordinates from Wikipedia / Wikimedia
const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

// low-level helper
export async function wikiQuery(params) {
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
// Robust Wikipedia + Wikimedia event fetch
export async function fetchEvents(topic = "World History") {
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&pithumbsize=500&generator=search&gsrsearch=${encodeURIComponent(topic)}&gsrlimit=15`;

        const res = await fetch(searchUrl);
        const data = await res.json();
        if (!data.query) return [];

        return Object.values(data.query.pages).map((page, i) => ({
            id: page.pageid || i + 1,
            title: page.title,
            description: page.extract
                ? page.extract.slice(0, 300)
                : "No description available for this event.",
            image: page.thumbnail?.source || "./src/assets/placeholder.png",
            year: detectYearFromText(page.extract) || 1900 + i,
            theme: detectTheme(page.title + " " + page.extract),
            lat: null,
            lng: null
        }));
    } catch (err) {
        console.error("❌ fetchEvents failed:", err);
        return [];
    }
}

// 🧠 Simple year guess helper
function detectYearFromText(text = "") {
    const match = text.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
    return match ? parseInt(match[0]) : null;
}

// 🧭 Simple theme classifier
function detectTheme(text = "") {
    text = text.toLowerCase();
    if (text.includes("war")) return "war";
    if (text.includes("revolution")) return "revolution";
    if (text.includes("flight") || text.includes("technology") || text.includes("invention")) return "technology";
    if (text.includes("exploration") || text.includes("discovery")) return "exploration";
    return "general";
}
