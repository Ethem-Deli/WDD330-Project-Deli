import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */import{r as u}from"./auth-BQFiyjEa.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";u("auth/login.html");async function p(t){try{const e=localStorage.getItem("favorites")||"[]",a=JSON.parse(e).find(h=>h.id===t)||null,n=new URL(location.href);n.searchParams.set("event",t);const o=n.toString(),i=a?`Check this event: ${a.title}`:"Check this history event",c=a?`${a.title} (${a.year}) — ${a.description||""}`:"I found this historical event";return navigator.share?(await navigator.share({title:i,text:c,url:o}),!0):navigator.clipboard&&navigator.clipboard.writeText?(await navigator.clipboard.writeText(o),alert("Link copied to clipboard"),!0):(window.location.href=`mailto:?subject=${encodeURIComponent(i)}&body=${encodeURIComponent(c+`

`+o)}`,!1)}catch(e){return console.error("share failed",e),alert("Unable to share right now."),!1}}window.shareEventById=p;async function l(t,e){const r=document.querySelector(e);if(r)try{const a=await fetch(t);if(!a.ok)throw new Error("Not found");const n=await a.text();r.innerHTML=n,r.querySelectorAll("script").forEach(o=>{const i=document.createElement("script");o.src?i.src=o.src:i.text=o.innerText,document.body.appendChild(i)})}catch{t.endsWith("header.html")?r.innerHTML=`
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
        </header>`:t.endsWith("footer.html")?r.innerHTML=`<footer class="site-footer"><div class="container">© ${new Date().getFullYear()} History Timeline — Ethem Deli</div></footer>`:r.innerHTML=""}}const m="HTIW_FAVORITES_v1",d="HTIW_CURRENT_USER";function f(){const t=localStorage.getItem(d);if(t)return t;const e="anon";return localStorage.setItem(d,e),e}function v(){try{const t=localStorage.getItem(m)||"{}";return JSON.parse(t)}catch{return{}}}function g(){const t=f();return v()[t]??[]}function y(t={}){const e=document.createElement("article");return e.className="event-card reveal",e.dataset.eventId=t.id??"",e.innerHTML=`
    <div class="card-media">
      <img src="${t.image??"./src/assests/logo.png"}" alt="${s(t.title??"Event")}" />
    </div>
    <div class="card-body">
      <h3 class="card-title">${s(t.title??"Untitled")}</h3>
      <p class="card-meta">${s(t.year??"")}</p>
      <p class="card-desc">${s(t.description??"").slice(0,160)}${t.description&&t.description.length>160?"…":""}</p>
      <div class="card-actions">
        <button data-action="detail" data-event-id="${t.id}">Details</button>
        <button data-action="favorite" data-event-id="${t.id}">❤</button>
        <button data-action="share" data-event-id="${t.id}">Share</button>
      </div>
    </div>
  `,e}function s(t=""){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function b(t){const e=`${location.origin}${location.pathname}?event=${encodeURIComponent(t)}`;try{return navigator.share?(await navigator.share({title:"History Timeline Event",text:"Check out this historical event",url:e}),!0):(await navigator.clipboard.writeText(e),alert("Link copied to clipboard"),!0)}catch(r){try{return await navigator.clipboard.writeText(e),alert("Link copied to clipboard"),!0}catch(a){return console.error("Share failed",r,a),alert("Sharing not available"),!1}}}(async()=>{await l("/src/partials/header.html","#header-placeholder"),await l("/src/partials/footer.html","#footer-placeholder");const t=g(),e=document.getElementById("favoritesList"),r=document.getElementById("fav-empty");if(!t||t.length===0){r.style.display="block";return}r.style.display="none",t.forEach(a=>{const n=y(a);e.appendChild(n)}),e.addEventListener("click",async a=>{const n=a.target.closest("[data-action='share']");if(!n)return;const o=n.dataset.eventId;await b(o)})})();
