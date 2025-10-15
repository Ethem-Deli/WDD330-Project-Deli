export async function loadHeaderAndFooter() {
    try {
        const headerEl = document.getElementById("header-placeholder");
        const footerEl = document.getElementById("footer-placeholder");

        if (headerEl) {
            const res = await fetch("/components/header.html");
            if (res.ok) headerEl.innerHTML = await res.text();
        }

        if (footerEl) {
            const res = await fetch("/components/footer.html");
            if (res.ok) footerEl.innerHTML = await res.text();
        }
    } catch (err) {
        console.error("Failed to load header/footer:", err);
    }
}
