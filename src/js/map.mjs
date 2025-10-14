// src/js/map.mjs
let mapInstance = null;
let markers = [];

export function __initGoogleMaps() {
    // used as global callback when Google Maps API script loads
    if (window.__pendingInit) window.__pendingInit();
}

export function initMap() {
    const canvas = document.getElementById('mapCanvas');
    canvas.innerHTML = '<div style="padding:1rem;color:#333">Map will load below if Google Maps API key is present</div>';
    // If API loaded already, create map
    if (window.google && window.google.maps) {
        createMap();
    } else {
        // wait for maps loader to call __initGoogleMaps if present
        window.__pendingInit = createMap;
    }
}

function createMap() {
    const canvas = document.getElementById('mapCanvas');
    canvas.innerHTML = '';
    mapInstance = new google.maps.Map(canvas, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: 'terrain'
    });
    // expose a global to center the map on an event (timeline module uses this)
    window.__centerMapOn = async function (event) {
        // If event has coords, use them; else try geocoding using location string
        if (event?.coords && event.coords.lat && event.coords.lng) {
            mapInstance.setCenter({ lat: event.coords.lat, lng: event.coords.lng });
            mapInstance.setZoom(6);
            addMarker(event.coords.lat, event.coords.lng, event.title);
        } else if (event?.location) {
            // try geocoding location string if API key present
            if (!window.GOOGLE_MAPS_API_KEY || window.GOOGLE_MAPS_API_KEY === 'AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk') {
                console.warn('No Maps API key available — cannot geocode location automatically');
                return;
            }
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(event.location)}&key=${window.GOOGLE_MAPS_API_KEY}`;
            try {
                const r = await fetch(geocodeUrl);
                const data = await r.json();
                if (data.results && data.results[0]) {
                    const loc = data.results[0].geometry.location;
                    mapInstance.setCenter(loc);
                    mapInstance.setZoom(6);
                    addMarker(loc.lat, loc.lng, event.title);
                } else console.warn('Geocode returned no results for', event.location);
            } catch (err) {
                console.error('Geocoding failed', err);
            }
        }
    };
}

function addMarker(lat, lng, title = '') {
    // remove duplicates near same lat/lng
    markers.forEach(m => {
        const p = m.getPosition();
        if (Math.abs(p.lat() - lat) < 0.001 && Math.abs(p.lng() - lng) < 0.001) {
            // skip adding duplicate
            return;
        }
    });
    const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title
    });
    markers.push(marker);
}
