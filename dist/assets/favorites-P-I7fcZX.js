import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{r as d}from"./auth-BQFiyjEa.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";d("auth/login.html");async function h(e){try{const a=localStorage.getItem("favorites")||"[]",t=JSON.parse(a).find(l=>l.id===e)||null,o=new URL(location.href);o.searchParams.set("event",e);const n=o.toString(),i=t?`Check this event: ${t.title}`:"Check this history event",s=t?`${t.title} (${t.year}) — ${t.description||""}`:"I found this historical event";return navigator.share?(await navigator.share({title:i,text:s,url:n}),!0):navigator.clipboard&&navigator.clipboard.writeText?(await navigator.clipboard.writeText(n),alert("Link copied to clipboard"),!0):(window.location.href=`mailto:?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(s+`

`+n)}`,!1)}catch(a){return console.error("share failed",a),alert("Unable to share right now."),!1}}window.shareEventById=h;async function c(e,a){const r=document.querySelector(a);if(r)try{const t=await fetch(e);if(!t.ok)throw new Error("Not found");const o=await t.text();r.innerHTML=o,r.querySelectorAll("script").forEach(n=>{const i=document.createElement("script");n.src?i.src=n.src:i.text=n.innerText,document.body.appendChild(i)})}catch{e.endsWith("header.html")?r.innerHTML=`
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
        </header>`:e.endsWith("footer.html")?r.innerHTML=`<footer class="site-footer"><div class="container">© ${new Date().getFullYear()} History Timeline — Ethem Deli</div></footer>`:r.innerHTML=""}}function f(){try{const e=localStorage.getItem("currentUser");if(!e)return console.warn("⚠️ No user logged in — returning empty favorites list."),[];const a=`favorites_${e}`,r=localStorage.getItem(a);if(!r)return[];const t=JSON.parse(r);return console.info(`✅ Loaded ${t.length} favorites for ${e}.`),t}catch(e){return console.error("❌ Failed to load favorites:",e),[]}}window.GOOGLE_MAPS_API_KEY="AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk";window.initMap=function(){console.log("Google Maps initialized safely.")};new Set(JSON.parse(localStorage.getItem("favorites")||"[]"));function u(e){return`
    <div class="event-card">
      <img src="${e.image}" alt="${e.title}">
      <h3>${e.title}</h3>
      <p>${e.description}</p>
    </div>
  `}async function p(e){const a=`${location.origin}${location.pathname}?event=${encodeURIComponent(e)}`;try{return navigator.share?(await navigator.share({title:"History Timeline Event",text:"Check out this historical event",url:a}),!0):(await navigator.clipboard.writeText(a),alert("Link copied to clipboard"),!0)}catch(r){try{return await navigator.clipboard.writeText(a),alert("Link copied to clipboard"),!0}catch(t){return console.error("Share failed",r,t),alert("Sharing not available"),!1}}}(async()=>{await c("/src/partials/header.html","#header-placeholder"),await c("/src/partials/footer.html","#footer-placeholder");const e=f(),a=document.getElementById("favoritesList"),r=document.getElementById("fav-empty");if(!e||e.length===0){r.style.display="block";return}r.style.display="none",e.forEach(t=>{const o=u(t);a.appendChild(o)}),a.addEventListener("click",async t=>{const o=t.target.closest("[data-action='share']");if(!o)return;const n=o.dataset.eventId;await p(n)})})();
