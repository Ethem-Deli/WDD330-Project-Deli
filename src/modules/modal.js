//src/modules/modal.js - Share button handler for events
export function setupShareButton(eventData) {
    const shareBtn = document.getElementById("shareBtn");
    if (!shareBtn) return;

    shareBtn.onclick = async () => {
        const shareData = {
            title: `Historical Event: ${eventData.title}`,
            text: eventData.description || "Check out this historical event!",
            url: eventData.link || window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                alert("Event shared successfully!");
            } else {
                // fallback: copy link to clipboard
                await navigator.clipboard.writeText(shareData.url);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.error("Share failed:", err);
            alert("Unable to share this event.");
        }
    };
}
const modal = document.getElementById("eventModal");
const closeBtn = document.getElementById("closeModal");

function openModal() {
    modal.style.display = "block";
    modal.focus();
}

function closeModal() {
    modal.style.display = "none";
}

// Close with Escape
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
        closeModal();
    }
});

// Close button
closeBtn.addEventListener("click", closeModal);

// Optional: trap Tab key inside modal for accessibility
modal.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        const focusable = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='1'])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});
