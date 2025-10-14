// src/modules/share.js
export async function shareEventById(eventId) {
    try {
        // Try to find event in favorites or on the page
        const favsRaw = localStorage.getItem("favorites") || "[]";
        const favs = JSON.parse(favsRaw);
        const ev = favs.find(f => f.id === eventId) || null;
        const url = new URL(location.href);
        url.searchParams.set("event", eventId);
        const shareUrl = url.toString();

        const title = ev ? `Check this event: ${ev.title}` : "Check this history event";
        const text = ev ? `${ev.title} (${ev.year}) — ${ev.description || ""}` : "I found this historical event";

        if (navigator.share) {
            await navigator.share({ title, text, url: shareUrl });
            return true;
        }

        // Try clipboard fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard");
            return true;
        }

        // Final fallback to mailto
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`;
        return false;
    } catch (err) {
        console.error("share failed", err);
        alert("Unable to share right now.");
        return false;
    }
}

// Also expose globally for pages that rely on window.shareEventById (favorites.html)
window.shareEventById = shareEventById;
