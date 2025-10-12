import"./modulepreload-polyfill-B5Qt9EMX.js";import{l as m,g as h,e as p,c as u,s as f}from"./favorites-fSuJaKJR.js";import{r as g}from"./auth-CRiUk8YE.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";import"https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";g("auth/login.html");async function c(e,a){const t=document.querySelector(a);if(t)try{const o=await fetch(e);if(!o.ok)throw new Error("Not found");const r=await o.text();t.innerHTML=r,t.querySelectorAll("script").forEach(i=>{const n=document.createElement("script");i.src?n.src=i.src:n.text=i.innerText,document.body.appendChild(n)})}catch{e.endsWith("header.html")?t.innerHTML=`
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
        </header>`:e.endsWith("footer.html")?t.innerHTML=`<footer class="site-footer"><div class="container">© ${new Date().getFullYear()} History Timeline — Ethem Deli</div></footer>`:t.innerHTML=""}}window.GOOGLE_MAPS_API_KEY="AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk";window.initMap=function(){console.log("Google Maps initialized safely.")};new Set(JSON.parse(localStorage.getItem("favorites")||"[]"));function v(e){return`
    <div class="event-card">
      <img src="${e.image}" alt="${e.title}">
      <h3>${e.title}</h3>
      <p>${e.description}</p>
    </div>
  `}async function y(e){const a=`${location.origin}${location.pathname}?event=${encodeURIComponent(e)}`;try{return navigator.share?(await navigator.share({title:"History Timeline Event",text:"Check out this historical event",url:a}),!0):(await navigator.clipboard.writeText(a),alert("Link copied to clipboard"),!0)}catch(t){try{return await navigator.clipboard.writeText(a),alert("Link copied to clipboard"),!0}catch(o){return console.error("Share failed",t,o),alert("Sharing not available"),!1}}}s("Added to favorites ❤️","success");s("Removed from favorites ❌","error");function s(e,a="info"){const t=document.getElementById("toastContainer"),o=document.createElement("div");o.className=`toast ${a}`,o.textContent=e,t.appendChild(o),requestAnimationFrame(()=>o.classList.add("show")),setTimeout(()=>{o.classList.remove("show"),setTimeout(()=>o.remove(),400)},3e3)}(async()=>{await c("/src/partials/header.html","#header-placeholder"),await c("/src/partials/footer.html","#footer-placeholder");const e=document.getElementById("favoritesList"),a=document.getElementById("fav-empty");m();let t=h();function o(){if(e.innerHTML="",!t||t.length===0){a.style.display="block";return}a.style.display="none",t.forEach(r=>e.appendChild(v(r)))}o(),document.getElementById("exportFavoritesBtn").addEventListener("click",()=>{p(),s("Favorites exported successfully!","success")}),document.getElementById("shareFavoritesBtn").addEventListener("click",async()=>{await u(),s("Share link copied to clipboard!","info")}),e.addEventListener("click",async r=>{const i=r.target.closest(".event-card");if(!i)return;const n=i.dataset.eventId,d=t.find(l=>l.id==n);if(r.target.closest("[data-action='share']")){await y(n);return}if(r.target.closest("[data-action='favorite']")){t=t.filter(l=>l.id!=n),f(t),o(),s("Removed from favorites ❌","error");return}E(d)}),document.getElementById("closeModal").addEventListener("click",()=>{document.getElementById("eventModal").classList.add("hidden")})})();function E(e){const a=document.getElementById("eventModal");document.getElementById("modalTitle").textContent=e.title,document.getElementById("modalDescription").textContent=e.description||"No description available.",document.getElementById("modalImage").src=e.image||"./src/assets/placeholder.png",a.classList.remove("hidden"),setTimeout(()=>{const t=document.getElementById("modalMap");if(window.google&&e.lat&&e.lng){const o=new google.maps.Map(t,{center:{lat:e.lat,lng:e.lng},zoom:5});new google.maps.Marker({position:{lat:e.lat,lng:e.lng},map:o,title:e.title})}else t.innerHTML="<p>Location not available.</p>"},400)}
