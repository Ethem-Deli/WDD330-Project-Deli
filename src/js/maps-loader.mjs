// ✅ src/js/maps-loader.mjs
// ensureGoogleMaps(apiKey) - loads Google Maps dynamically and resolves when ready.

export function ensureGoogleMaps(apiKey, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.importLibrary) {
            resolve(window.google);
            return;
        }

        // If loader already exists, listen for it
        const existing = document.querySelector('script[data-google-maps-loader]');
        if (existing) {
            existing.addEventListener('load', () => {
                if (window.google) resolve(window.google);
                else reject(new Error("Google loaded but window.google missing"));
            });
            existing.addEventListener('error', reject);
            return;
        }

        // Create a unique callback
        const callbackName = "_gmaps_loader_callback_" + Date.now();
        window[callbackName] = () => {
            delete window[callbackName];
            resolve(window.google);
        };

        const s = document.createElement('script');
        s.dataset.googleMapsLoader = "1";
        s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}&libraries=maps,marker`;
        s.async = true;
        s.defer = true;
        s.onerror = (e) => {
            delete window[callbackName];
            reject(e);
        };
        document.head.appendChild(s);

        // Fallback timeout
        setTimeout(() => {
            if (!window.google) reject(new Error("Google Maps load timeout"));
        }, timeout);
    });
}

// ✅ Compatibility export for old imports
export { ensureGoogleMaps as loadGoogleMaps };
