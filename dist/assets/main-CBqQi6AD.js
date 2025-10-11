import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css               */async function c(t,n){const e=document.getElementById(n);if(!e)return;const s=await fetch(t);e.innerHTML=await s.text()}function l(){return JSON.parse(localStorage.getItem("favorites"))||[]}function m(t){localStorage.setItem("favorites",JSON.stringify(t))}function p(t){return l().some(n=>n.id===t)}function g(t=[]){const n=document.getElementById("timelineList");n&&(n.innerHTML=t.map(e=>`
      <div class="event-card" data-id="${e.id}">
        <img src="${e.image}" alt="${e.title}" class="event-image">
        <div class="card-body">
          <h3>${e.title}</h3>
          <p>${e.description.slice(0,100)}...</p>
        </div>
        <button class="favorite-btn ${p(e.id)?"active":""}" title="Favorite">❤️</button>
      </div>
    `).join(""))}function v(){const t=document.getElementById("favoritesList");if(!t)return;const n=l();t.innerHTML=n.length?n.map(e=>`
        <div class="event-card small" data-id="${e.id}">
          <img src="${e.image}" alt="${e.title}" class="event-image-small">
          <div class="card-body">
            <h4>${e.title}</h4>
          </div>
        </div>
      `).join(""):"<p>No favorites yet ❤️</p>"}function f(t){const n=document.getElementById("eventModal");if(document.getElementById("modalImage").src=t.image,document.getElementById("modalTitle").textContent=t.title,document.getElementById("modalDescription").innerHTML=t.description,document.getElementById("modalMap").innerHTML='<div id="event-map" style="width:100%;height:250px;"></div>',n.classList.remove("hidden"),window.google&&window.google.maps&&t.lat&&t.lng){const e=document.getElementById("event-map"),s=new google.maps.Map(e,{center:{lat:t.lat,lng:t.lng},zoom:5});new google.maps.Marker({position:{lat:t.lat,lng:t.lng},map:s})}}document.addEventListener("DOMContentLoaded",async()=>{await c("./src/partials/header.html","header-placeholder"),await c("./src/partials/footer.html","footer-placeholder");try{const n=await(await fetch("./data/events.json")).json();g(n),v();const e=document.getElementById("timelineList"),s=document.getElementById("favoritesList"),u=document.getElementById("eventModal"),y=document.getElementById("closeModal");e.addEventListener("click",r=>{const a=r.target.closest(".event-card");if(!a)return;const d=parseInt(a.dataset.id),o=n.find(i=>i.id===d);if(o)if(r.target.classList.contains("favorite-btn")){const i=l();p(d)?m(i.filter(L=>L.id!==d)):(i.push(o),m(i)),g(n),v()}else f(o)}),s.addEventListener("click",r=>{const a=r.target.closest(".event-card");if(!a)return;const d=parseInt(a.dataset.id),o=n.find(i=>i.id===d);o&&f(o)}),y.addEventListener("click",()=>u.classList.add("hidden"))}catch(t){console.error("Error loading events:",t)}});
