// src/js/favorites.mjs
import { db, auth } from "./firebase-config.mjs";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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

async function firebaseSaveFavorites(favs) {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const ref = doc(db, "favorites", user.uid);
        await setDoc(ref, { items: favs }, { merge: true });
        return true;
    } catch (err) {
        console.warn("firebaseSaveFavorites failed:", err);
        return false;
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
    const ok = await firebaseSaveFavorites(favs);
    if (!ok) saveLocalFavorites(favs);
}

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
        await firebaseSaveFavorites(merged);
        localStorage.removeItem(LOCAL_FAVS_KEY);
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
    return url;
}

export function loadSharedFavoritesFromQuery() {
    const params = new URLSearchParams(location.search);
    if (!params.has("shared")) return false;
    try {
        const payload = decodeURIComponent(escape(atob(params.get("shared"))));
        const imported = JSON.parse(payload);
        saveLocalFavorites(imported);
        return true;
    } catch (err) {
        console.error("loadSharedFavoritesFromQuery failed:", err);
        return false;
    }
}
