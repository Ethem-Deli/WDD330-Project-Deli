// 📝 Add Google Maps API key here
window.GOOGLE_MAPS_API_KEY = 'f39143f6af2943898e57538f2d6d3de2';

// Inject Google Maps script dynamically if API key is set
if (window.GOOGLE_MAPS_API_KEY && window.GOOGLE_MAPS_API_KEY !== 'f39143f6af2943898e57538f2d6d3de2') {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&callback=__initGoogleMaps`;
    script.defer = true;
    document.head.appendChild(script);
} else {
    console.warn(
        '⚠️ No Google Maps API key set. Map features will be limited until you add your key in src/js/maps-loader.js'
    );
}
