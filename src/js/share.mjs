// src/js/share.mjs
export async function shareEventById(eventId) {
    const shareUrl = `${location.origin}${location.pathname}?event=${encodeURIComponent(eventId)}`;
    try {
        if (navigator.share) {
            await navigator.share({ title: "History Timeline Event", text: "Check out this historical event", url: shareUrl });
            return true;
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard");
            return true;
        }
    } catch (err) {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard");
            return true;
        } catch (e) {
            console.error("Share failed", err, e);
            alert("Sharing not available");
            return false;
        }
    }
}
    