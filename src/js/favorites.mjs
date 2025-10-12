// ✅ src/js/favorites.mjs
import { db } from "./firebase-config.mjs";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { auth } from "./firebase-config.mjs";

const LOCAL_FAVS_KEY = "favorites";

/* -------------------------
   LOCAL FALLBACK HELPERS
-------------------------- */
export function getLocalFavorites() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_FAVS_KEY) || "[]");
    } catch {
        return [];
    }
}

export function saveLocalFavorites(favs) {
    localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(favs || []));
}

/* -------------------------
   FIRESTORE HELPERS
-------------------------- */
function userFavoritesDocRef(uid) {
    return doc(db, "users", uid);
}

/**
 * 🔹 Get favorites (Firestore if logged in, else local)
 */
export async function getFavoritesForCurrentUser() {
    const user = auth.currentUser;
    if (!user) return getLocalFavorites();

    try {
        const ref = userFavoritesDocRef(user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return [];
        const data = snap.data();
        return data.favorites || [];
    } catch (err) {
        console.error("❌ Failed to load favorites from Firestore:", err);
        return getLocalFavorites();
    }
}

/**
 * 🔹 Save favorites for current user
 */
export async function saveFavoritesForCurrentUser(favs = []) {
    const user = auth.currentUser;
    if (!user) {
        saveLocalFavorites(favs);
        return;
    }
    try {
        const ref = userFavoritesDocRef(user.uid);
        await setDoc(ref, { favorites: favs }, { merge: true });
    } catch (err) {
        console.error("❌ Failed to save favorites to Firestore:", err);
        saveLocalFavorites(favs);
    }
}

/**
 * 🔹 Merge local favorites when user logs in
 */
export async function mergeLocalIntoUserFavorites() {
    const local = getLocalFavorites();
    if (!local?.length) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
        const existing = await getFavoritesForCurrentUser();
        const merged = [...existing];
        for (const f of local) {
            if (!merged.find(x => x && x.id === f.id)) merged.push(f);
        }
        await saveFavoritesForCurrentUser(merged);
        localStorage.removeItem(LOCAL_FAVS_KEY);
    } catch (err) {
        console.error("❌ Failed to merge local favorites:", err);
    }
}

/* -------------------------
   SHARE / EXPORT FEATURES
-------------------------- */

/** 🔸 Export favorites as JSON file */
export async function exportFavoritesAsFile() {
    const favs = await getFavoritesForCurrentUser();
    const blob = new Blob([JSON.stringify(favs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favorites-timeline.json";
    a.click();
    URL.revokeObjectURL(url);
}

/** 🔸 Create a base64 share link and copy to clipboard */
export async function createShareLink() {
    const favs = await getFavoritesForCurrentUser();
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(favs))));
    const shareUrl = `${location.origin}${location.pathname}?shared=${payload}`;
    await navigator.clipboard.writeText(shareUrl);
    alert("✅ Share link copied to clipboard!");
}

/** 🔸 Import favorites from ?shared= query parameter */
export async function loadSharedFavoritesFromQuery() {
    const params = new URLSearchParams(location.search);
    if (!params.has("shared")) return;

    try {
        const payload = decodeURIComponent(escape(atob(params.get("shared"))));
        const imported = JSON.parse(payload);
        await saveFavoritesForCurrentUser(imported);
        alert("✅ Imported shared favorites!");
    } catch (err) {
        console.error("❌ Failed to import shared favorites:", err);
    }
}
