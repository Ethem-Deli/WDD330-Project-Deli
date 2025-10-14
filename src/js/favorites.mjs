// src/js/favorites.mjs
import { db, auth } from "./firebase-config.mjs";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Lazy getter to ensure toast is ready before use
function safeToast(message, type = "info") {
    if (window.showToast && typeof window.showToast === "function") {
        window.showToast(message, type);
    } else {
        console.log(`[Toast:${type}] ${message}`);
    }
}

const LOCAL_FAVS_KEY = "favorites_v1";

/* -------------------------
   LOCAL STORAGE HELPERS
-------------------------- */
function getLocalFavorites() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_FAVS_KEY) || "[]");
    } catch {
        return [];
    }
}

function saveLocalFavorites(favs) {
    try {
        localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(favs || []));
    } catch (err) {
        console.error("Failed saving local favorites:", err);
    }
}

/* -------------------------
   FIRESTORE SYNC
-------------------------- */
async function firebaseGetFavorites() {
    try {
        const user = auth.currentUser;
        if (!user) return null;

        const ref = doc(db, "favorites", user.uid);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data().items || [] : [];
    } catch (err) {
        console.warn("firebaseGetFavorites failed:", err);
        return null;
    }
}

/* -------------------------
   PUBLIC API
-------------------------- */
export async function getFavoritesForCurrentUser() {
    const fb = await firebaseGetFavorites();
    if (Array.isArray(fb)) return fb;
    return getLocalFavorites();
}

export async function saveFavoritesForCurrentUser(favs) {
    try {
        const user = auth.currentUser;
        saveLocalFavorites(favs); // Always save locally first

        if (user) {
            try {
                const ref = doc(db, "favorites", user.uid);
                await setDoc(ref, { items: favs }, { merge: true });
                safeToast("✅ Synced to your online favorites!", "success");
            } catch (err) {
                console.warn("Firestore save failed, fallback to local only:", err);
                safeToast("⚠️ Saved locally (offline mode)", "info");
            }
        }
    } catch (err) {
        console.error("Error saving favorites:", err);
        safeToast("❌ Failed to save favorite.", "error");
    }
}

/* -------------------------
   MERGE LOCAL + ONLINE
-------------------------- */
export async function mergeLocalIntoUserFavorites() {
    try {
        const local = getLocalFavorites();
        if (!local.length) return;
        const fb = await firebaseGetFavorites();
        if (!Array.isArray(fb)) return;
        const merged = [...fb];
        for (const item of local) {
            if (!merged.find(x => x.id === item.id)) merged.push(item);
        }
        const user = auth.currentUser;
        if (user) {
            const ref = doc(db, "favorites", user.uid);
            await setDoc(ref, { items: merged }, { merge: true });
            localStorage.removeItem(LOCAL_FAVS_KEY);
        }
    } catch (err) {
        console.warn("mergeLocalIntoUserFavorites failed:", err);
    }
}

/* -------------------------
   EXPORT & SHARE HELPERS
-------------------------- */
export function exportFavoritesAsFile() {
    const favs = getLocalFavorites();
    const blob = new Blob([JSON.stringify(favs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites.json";
    a.click();
    URL.revokeObjectURL(url);
}

export async function createShareLink() {
    const favs = getLocalFavorites();
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(favs))));
    const url = `${location.origin}${location.pathname}?shared=${payload}`;
    await navigator.clipboard.writeText(url);
    safeToast("📋 Share link copied to clipboard!", "info");
    return url;
}

export function loadSharedFavoritesFromQuery() {
    const params = new URLSearchParams(location.search);
    if (!params.has("shared")) return false;
    try {
        const payload = decodeURIComponent(escape(atob(params.get("shared"))));
        const imported = JSON.parse(payload);
        saveLocalFavorites(imported);
        safeToast("✅ Imported shared favorites!", "success");
        return true;
    } catch (err) {
        console.error("loadSharedFavoritesFromQuery failed:", err);
        safeToast("❌ Failed to import shared favorites.", "error");
        return false;
    }
}
