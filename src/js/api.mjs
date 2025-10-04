// api.mjs — Wikipedia + Wikimedia + OnThisDay + cache helpers
export async function fetchWikipediaEvents(dateSlug = 'October_3') {
    // For demo we use summary endpoint for a date - adapt to your data model later
    const url = `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${dateSlug}`;
    try {
        const r = await fetch(url);
        const data = await r.json();
        // mobile-sections returns lead and remaining sections; for demo we use lead
        const title = data.lead?.displaytitle || dateSlug.replace('_', ' ');
        const extract = data.lead?.sections?.[0]?.text || data.lead?.description || '';
        return [{
            title,
            extract,
            // add optional thumbnail if available
            thumbnail: data.lead?.image ? { source: data.lead.image.url } : null,
            // placeholder location: you will need to supply or derive event location
            location: title // naive - replace with real place name or coordinates later
        }];
    } catch (err) {
        console.error('fetchWikipediaEvents error', err);
        return [];
    }
}

// Wikimedia image fetch with localStorage caching + optional expiration (24h)
export async function fetchWikimediaImage(query) {
    const key = `wikimedia_${query.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            const payload = JSON.parse(raw);
            // expiry check (24h)
            if (payload?.ts && (Date.now() - payload.ts < 24 * 60 * 60 * 1000)) {
                return payload.url || null;
            }
        } catch { /* fallthrough to re-fetch */ }
    }

    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&iiprop=url&origin=*`;
    try {
        const r = await fetch(url);
        const data = await r.json();
        let imageUrl = null;
        if (data.query && data.query.pages) {
            const pages = Object.values(data.query.pages);
            if (pages.length && pages[0].imageinfo) imageUrl = pages[0].imageinfo[0].url;
        }
        localStorage.setItem(key, JSON.stringify({ url: imageUrl, ts: Date.now() }));
        return imageUrl;
    } catch (err) {
        console.error('fetchWikimediaImage error', err);
        return null;
    }
}

export function clearWikimediaCache() {
    Object.keys(localStorage).forEach(k => { if (k.startsWith('wikimedia_')) localStorage.removeItem(k); });
}

// Daily / Random fact via Wikipedia "On this day" feed
export async function showDailyFact() {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
        const r = await fetch(url);
        const data = await r.json();
        const events = data.events || [];
        const pick = events.length ? events[Math.floor(Math.random() * events.length)] : null;
        const el = document.getElementById('dailyFact');
        if (pick) {
            el.innerHTML = `<strong>On this day:</strong> ${pick.text || pick.pages?.[0]?.displaytitle || pick.year}`;
        } else {
            el.innerHTML = `<strong>Daily Fact</strong><div>No daily fact available</div>`;
        }
    } catch (err) {
        console.warn('Daily fact fetch failed', err);
    }
}
