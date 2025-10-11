// 📝 Google Maps API key below.
// ⚠️ Make sure you have restricted this key to your GitHub Pages domain in Google Cloud Console.
window.GOOGLE_MAPS_API_KEY = 'AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk';

/**
 * ✅ Dynamically loads the Google Maps JavaScript API.
 * If no valid key is set, logs a warning instead.
 */
export function loadGoogleMaps() {
    // Ensure a valid API key is present
    if (
        !window.GOOGLE_MAPS_API_KEY ||
        window.GOOGLE_MAPS_API_KEY.trim() === '' ||
        window.GOOGLE_MAPS_API_KEY === 'AIzaSyDLwMRu47yXHBbfX4cimCx9BnIEtdmd0zk'
    ) {
        console.warn(
            '⚠️ No valid Google Maps API key set. Map features will be limited until you add your key in src/js/maps-loader.mjs'
        );
        return;
    }

    // Avoid loading the script multiple times
    if (document.querySelector('script[data-google-maps]')) {
        console.info('ℹ️ Google Maps API script already loaded.');
        return;
    }

    // Create and append the script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&callback=__initGoogleMaps`;
    script.defer = true;
    script.async = true;
    script.dataset.googleMaps = "true"; // Mark for duplicate detection
    document.head.appendChild(script);

    console.info('✅ Google Maps API script added to document.');
}

window.initMap = function () {
    console.log("Google Maps initialized safely.");
};