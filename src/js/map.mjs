// src/js/map.mjs
import { GOOGLE_MAPS_API_KEY } from "./config.js";

let mapInstance = null;
let markers = [];

/**
 * Used as the global callback when Google Maps API script loads.
 */
export function __initGoogleMaps() {
    if (window.__pendingInit) window.__pendingInit();
}

/**
 * Initializes the map canvas and triggers Google Maps API loading if needed.
 */
export function initMap() {
    const canvas = document.getElementById("mapCanvas");
    if (!canvas) {
        console.error("Map canvas element not found.");
        return;
    }

    canvas.innerHTML =
        '<div style="padding:1rem;color:#333">Loading map…</div>';

    // If Google Maps already loaded, create map immediately
    if (window.google && window.google.maps) {
        createMap();
        return;
    }

    // If API key missing, show a warning and stop
    if (
        !GOOGLE_MAPS_API_KEY ||
        GOOGLE_MAPS_API_KEY.includes("YOUR_GOOGLE_MAPS_KEY")
    ) {
        console.warn(
            "Google Maps API key missing. Please set it in src/js/config.js."
        );
        canvas.innerHTML =
            '<div style="padding:1rem;color:red">⚠️ Google Maps API key missing.<br>Map cannot be loaded.</div>';
        return;
    }

    // Load the Google Maps script dynamically
    const callbackName = "__initGoogleMaps";
    window.__pendingInit = createMap;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        GOOGLE_MAPS_API_KEY
    )}&callback=${callbackName}&libraries=maps,marker`;
    script.async = true;
    script.onerror = () => {
        console.error("Failed to load Google Maps API script.");
        canvas.innerHTML =
            '<div style="padding:1rem;color:red">❌ Failed to load Google Maps API.</div>';
    };
    document.head.appendChild(script);
}

/**
 * Actually creates the Google Map and exposes helper for centering.
 */
function createMap() {
    const canvas = document.getElementById("mapCanvas");
    if (!canvas) return;

    canvas.innerHTML = "";
    mapInstance = new google.maps.Map(canvas, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: "terrain",
    });

    /**
     * Expose a global helper for other modules to center the map on an event.
     * Example: window.__centerMapOn({ title, coords: { lat, lng } });
     */
    window.__centerMapOn = async function (event) {
        if (!mapInstance) return;

        // Case 1: Event already contains coordinates
        if (event?.coords && event.coords.lat && event.coords.lng) {
            mapInstance.setCenter({
                lat: event.coords.lat,
                lng: event.coords.lng,
            });
            mapInstance.setZoom(6);
            addMarker(event.coords.lat, event.coords.lng, event.title);
            return;
        }

        // Case 2: Try to geocode a location name using Google Maps API
        if (event?.location) {
            if (
                !GOOGLE_MAPS_API_KEY ||
                GOOGLE_MAPS_API_KEY.includes("YOUR_GOOGLE_MAPS_KEY")
            ) {
                console.warn(
                    "No Maps API key available — cannot geocode location automatically"
                );
                return;
            }

            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                event.location
            )}&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`;

            try {
                const response = await fetch(geocodeUrl);
                const data = await response.json();
                if (data.results && data.results[0]) {
                    const loc = data.results[0].geometry.location;
                    mapInstance.setCenter(loc);
                    mapInstance.setZoom(6);
                    addMarker(loc.lat, loc.lng, event.title);
                } else {
                    console.warn("Geocode returned no results for", event.location);
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            }
        }
    };
}

/**
 * Adds a marker to the map, avoiding duplicates near the same coordinates.
 */
function addMarker(lat, lng, title = "") {
    // Check for existing marker near same position
    const duplicate = markers.some((m) => {
        const pos = m.getPosition();
        return Math.abs(pos.lat() - lat) < 0.001 && Math.abs(pos.lng() - lng) < 0.001;
    });
    if (duplicate) return;

    const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        title,
    });
    markers.push(marker);
}
