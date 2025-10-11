// ✅ src/js/toast.mjs — for Reusable Toast Notifications
/**
 * Displays a toast notification.
 * @param {string} message - The message to show.
 * @param {"info"|"success"|"error"|"warning"} [type="info"] - Type of toast.
 */
export function showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add("visible"), 50);

    // Auto-remove
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
