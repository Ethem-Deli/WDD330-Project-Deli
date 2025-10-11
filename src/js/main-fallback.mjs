// src/js/main-fallback.mjs
export async function loadTemplateWithFallback(url, placeholderSelector) {
    const placeholder = document.querySelector(placeholderSelector);
    if (!placeholder) return;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Not found");
        const html = await resp.text();
        placeholder.innerHTML = html;
        placeholder.querySelectorAll("script").forEach(s => {
            const newScript = document.createElement("script");
            if (s.src) newScript.src = s.src;
            else newScript.text = s.innerText;
            document.body.appendChild(newScript);
        });
    } catch (err) {
        if (url.endsWith("header.html")) {
            placeholder.innerHTML = `
        <header class="site-header">
          <div class="container header-inner">
            <a class="logo" href="./index.html">
              <img src="./src/assests/logo.png" alt="logo" class="logo-img" />
              <span class="logo-text">History Timeline — Interactive World History</span>
            </a>
            <div class="header-controls">
              <form id="search-form" class="header-search" onsubmit="return false;">
                <input id="globalSearch" class="search-input" placeholder="Search events..." />
                <button id="searchBtn" type="button">Search</button>
              </form>
              <nav class="main-nav">
                <a href="./index.html">Timeline</a> | <a href="./favorites.html">My Timeline</a>
              </nav>
            </div>
          </div>
        </header>`;
        } else if (url.endsWith("footer.html")) {
            placeholder.innerHTML = `<footer class="site-footer"><div class="container">© ${new Date().getFullYear()} History Timeline — Ethem Deli</div></footer>`;
        } else {
            placeholder.innerHTML = "";
        }
    }
}
