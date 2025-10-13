import"./modulepreload-polyfill-B5Qt9EMX.js";import{l as m,g as h,e as p,c as u,s as f}from"./favorites-J_X_7SHO.js";import{r as g}from"./auth-CRiUk8YE.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";g("auth/login.html");async function c(e,o){const t=document.querySelector(o);if(t)try{const r=await fetch(e);if(!r.ok)throw new Error("Not found");const a=await r.text();t.innerHTML=a,t.querySelectorAll("script").forEach(i=>{const n=document.createElement("script");i.src?n.src=i.src:n.text=i.innerText,document.body.appendChild(n)})}catch{e.endsWith("header.html")?t.innerHTML=`
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
        </header>`:e.endsWith("footer.html")?t.innerHTML=`<footer class="site-footer"><div class="container">© ${new Date().getFullYear()} History Timeline — Ethem Deli</div></footer>`:t.innerHTML=""}}new Set(JSON.parse(localStorage.getItem("favorites")||"[]"));function v(e){return`
    <div class="event-card">
      <img src="${e.image}" alt="${e.title}">
      <h3>${e.title}</h3>
      <p>${e.description}</p>
    </div>
  `}async function y(e){const o=`${location.origin}${location.pathname}?event=${encodeURIComponent(e)}`;try{return navigator.share?(await navigator.share({title:"History Timeline Event",text:"Check out this historical event",url:o}),!0):(await navigator.clipboard.writeText(o),alert("Link copied to clipboard"),!0)}catch(t){try{return await navigator.clipboard.writeText(o),alert("Link copied to clipboard"),!0}catch(r){return console.error("Share failed",t,r),alert("Sharing not available"),!1}}}s("Added to favorites ❤️","success");s("Removed from favorites ❌","error");function s(e,o="info"){const t=document.getElementById("toastContainer"),r=document.createElement("div");r.className=`toast ${o}`,r.textContent=e,t.appendChild(r),requestAnimationFrame(()=>r.classList.add("show")),setTimeout(()=>{r.classList.remove("show"),setTimeout(()=>r.remove(),400)},3e3)}(async()=>{await c("/src/partials/header.html","#header-placeholder"),await c("/src/partials/footer.html","#footer-placeholder");const e=document.getElementById("favoritesList"),o=document.getElementById("fav-empty");m();let t=h();function r(){if(e.innerHTML="",!t||t.length===0){o.style.display="block";return}o.style.display="none",t.forEach(a=>e.appendChild(v(a)))}r(),document.getElementById("exportFavoritesBtn").addEventListener("click",()=>{p(),s("Favorites exported successfully!","success")}),document.getElementById("shareFavoritesBtn").addEventListener("click",async()=>{await u(),s("Share link copied to clipboard!","info")}),e.addEventListener("click",async a=>{const i=a.target.closest(".event-card");if(!i)return;const n=i.dataset.eventId,d=t.find(l=>l.id==n);if(a.target.closest("[data-action='share']")){await y(n);return}if(a.target.closest("[data-action='favorite']")){t=t.filter(l=>l.id!=n),f(t),r(),s("Removed from favorites ❌","error");return}E(d)}),document.getElementById("closeModal").addEventListener("click",()=>{document.getElementById("eventModal").classList.add("hidden")})})();function E(e){const o=document.getElementById("eventModal");document.getElementById("modalTitle").textContent=e.title,document.getElementById("modalDescription").textContent=e.description||"No description available.",document.getElementById("modalImage").src=e.image||"./src/assets/placeholder.png",o.classList.remove("hidden"),setTimeout(()=>{const t=document.getElementById("modalMap");if(window.google&&e.lat&&e.lng){const r=new google.maps.Map(t,{center:{lat:e.lat,lng:e.lng},zoom:5});new google.maps.Marker({position:{lat:e.lat,lng:e.lng},map:r,title:e.title})}else t.innerHTML="<p>Location not available.</p>"},400)}
