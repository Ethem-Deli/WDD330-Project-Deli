// src/modules/api.js Helper module to fetch events, images, and coordinates from Wikipedia / Wikimedia
const WIKI_API_BASE = "https://en.wikipedia.org/w/api.php";

// Low-level helper
export async function wikiQuery(params) {
    const url = new URL(WIKI_API_BASE);
    params.format = "json";
    params.origin = "*";
    Object.keys(params).forEach((k) => url.searchParams.append(k, params[k]));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
    return res.json();
}

/**
 * Search Wikipedia for a query and return a small set of pageids and titles.
 */
export async function searchEvents(query, limit = 10) {
    if (!query || !query.trim()) return [];
    const data = await wikiQuery({
        action: "query",
        list: "search",
        srsearch: query,
        srlimit: String(limit),
        srprop: "snippet|timestamp",
    });
    if (!data.query || !data.query.search) return [];
    return data.query.search.map((item) => ({
        id: item.pageid,
        title: item.title,
        snippet: (item.snippet || "").replace(/<\/?[^>]+(>|$)/g, ""),
    }));
}

/**
 * Given an array of pageids, fetch thumbnails, extracts, and coordinates.
 */
export async function getPagesInfo(pageids = []) {
    if (!pageids.length) return {};
    const params = {
        action: "query",
        pageids: pageids.join("|"),
        prop: "coordinates|pageimages|extracts",
        piprop: "thumbnail",
        pithumbsize: "600",
        exintro: "1",
        explaintext: "1",
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
            extract: p.extract || "",
            coordinates:
                p.coordinates && p.coordinates[0]
                    ? { lat: p.coordinates[0].lat, lon: p.coordinates[0].lon }
                    : null,
        };
    }
    return out;
}

/**
 * Unified event loader with fallback:
 * 1. Try Wikipedia API
 * 2. If it fails or empty, use local events.json
 */
export async function fetchEvents(topic = "World History") {
    try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&pithumbsize=500&generator=search&gsrsearch=${encodeURIComponent(
            topic
        )}&gsrlimit=15`;

        const res = await fetch(wikiUrl);
        const data = await res.json();

        //  Fallback to local JSON if no results
        if (!data.query) {
            console.warn("⚠️ No Wikipedia data, falling back to local JSON");
            const local = await fetch("data/events.json");
            if (!local.ok) throw new Error("Local JSON not found");
            return await local.json();
        }

        // Map Wikipedia results
        return Object.values(data.query.pages).map((page, i) => ({
            id: page.pageid || i + 1,
            title: page.title,
            description: page.extract
                ? page.extract.slice(0, 300)
                : "No description available for this event.",
            image: page.thumbnail?.source || "assets/placeholder.png",
            year: detectYearFromText(page.extract) || 1900 + i,
            theme: detectTheme(page.title + " " + page.extract),
            lat: null,
            lng: null,
        }));
    } catch (err) {
        console.error("❌ fetchEvents failed:", err);
        try {
            const local = await fetch("data/events.json");
            if (!local.ok) throw new Error("Fallback JSON failed");
            return await local.json();
        } catch (fallbackErr) {
            console.error("❌ Local fetch also failed:", fallbackErr);
            return [];
        }
    }
}

// Simple year guess helper
function detectYearFromText(text = "") {
    const match = text.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
    return match ? parseInt(match[0]) : null;
}

// Simple theme classifier
function detectTheme(text = "") {
    text = text.toLowerCase();
    if (text.includes("war")) return "war";
    if (text.includes("revolution")) return "revolution";
    if (
        text.includes("flight") ||
        text.includes("technology") ||
        text.includes("invention")
    )
        return "technology";
    if (text.includes("exploration") || text.includes("discovery"))
        return "exploration";
    return "general";
}
