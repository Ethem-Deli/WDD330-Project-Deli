// src/js/toast.mjs
export function showToast(message, type = "info", duration = 3000) {
    try {
        const containerId = "toast-container";
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement("div");
            container.id = containerId;
            container.style.position = "fixed";
            container.style.right = "1rem";
            container.style.top = "1rem";
            container.style.zIndex = 99999;
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.gap = "8px";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.padding = "10px 14px";
        toast.style.borderRadius = "8px";
        toast.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
        toast.style.maxWidth = "360px";
        toast.style.fontSize = "0.95rem";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-6px)";
        toast.style.transition = "opacity .18s, transform .18s";

        if (type === "success") {
            toast.style.background = "#ecfdf5";
            toast.style.color = "#065f46";
        } else if (type === "error") {
            toast.style.background = "#fff1f2";
            toast.style.color = "#7f1d1d";
        } else {
            toast.style.background = "#f3f4f6";
            toast.style.color = "#111827";
        }

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-6px)";
            setTimeout(() => toast.remove(), 220);
        }, duration);
    } catch (err) {
        console.warn("toast error", err);
    }
}
