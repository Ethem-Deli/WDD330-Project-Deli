// src/js/favorites.mjs
// Unified favorites storage (localStorage) + optional Firebase sync

import { db, auth } from "./firebase-config.mjs";

const STORAGE_KEY = "historytimeline:favorites";

/* -------------------------
   Helpers
--------------------------*/
function safeToast(message, type = "info") {
    if (window.showToast) window.showToast(message, type);
    else console.log(`[Toast:${type}] ${message}`);
}

export function getFavoritesForCurrentUser() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const favs = raw ? JSON.parse(raw) : [];
        return Array.isArray(favs) ? favs : [];
    } catch (err) {
        console.error("getFavoritesForCurrentUser failed:", err);
        return [];
    }
}

export async function saveFavoritesForCurrentUser(favs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs || []));
        // Optional Firebase sync
        if (db && auth?.currentUser) {
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js");
            await setDoc(doc(db, "users", auth.currentUser.uid), { favorites: favs }, { merge: true });
        }
        return true;
    } catch (err) {
        console.error("saveFavoritesForCurrentUser failed:", err);
        safeToast("⚠️ Failed to save favorites", "error");
        return false;
    }
}

/* -------------------------
   Export / Share / Import
--------------------------*/
export function exportFavoritesAsFile() {
    try {
        const favs = getFavoritesForCurrentUser();
        const dataStr = JSON.stringify(favs, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "favorites.json";
        a.click();
        URL.revokeObjectURL(url);
        safeToast("✅ Favorites exported", "success");
    } catch (err) {
        safeToast("❌ Failed to export", "error");
        console.error(err);
    }
}

export async function createShareLink() {
    try {
        const favs = getFavoritesForCurrentUser();
        const encoded = btoa(encodeURIComponent(JSON.stringify(favs)));
        const url = new URL(location.href);
        url.searchParams.set("shared", encoded);
        const link = url.toString();
        await navigator.clipboard.writeText(link);
        safeToast("🔗 Share link copied!", "success");
        return link;
    } catch (err) {
        safeToast("❌ Failed to share favorites", "error");
        console.error(err);
    }
}

export function loadSharedFavoritesFromQuery() {
    const params = new URLSearchParams(location.search);
    if (!params.has("shared")) return [];
    try {
        const decoded = decodeURIComponent(atob(params.get("shared")));
        const imported = JSON.parse(decoded);
        if (!Array.isArray(imported)) return [];
        saveFavoritesForCurrentUser(imported);
        safeToast("✅ Imported shared favorites!", "success");
        return imported;
    } catch (err) {
        safeToast("❌ Invalid shared favorites", "error");
        console.error(err);
        return [];
    }
}
