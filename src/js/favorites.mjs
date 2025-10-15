// src/js/favorites.mjs
// Favorites management: localStorage per-user, optional Firebase fallback, export & share.

import { db, auth } from "./firebase-config.mjs"; // Firestore + Auth from Firebase config

function safeToast(message, type = "info") {
    if (window.showToast && typeof window.showToast === "function") {
        window.showToast(message, type);
    } else {
        console.log(`[Toast:${type}] ${message}`);
    }
}

const LOCAL_PREFIX = "myapp:favorites:";

function getLocalKeyForUser(uid) {
    return uid ? LOCAL_PREFIX + uid : LOCAL_PREFIX + "anon";
}

export function getLocalFavorites() {
    try {
        const raw = localStorage.getItem(getLocalKeyForUser(window.__CURRENT_USER_UID || null));
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error("getLocalFavorites parse error", err);
        return [];
    }
}

export function saveLocalFavorites(favs) {
    try {
        const uid = window.__CURRENT_USER_UID || null;
        localStorage.setItem(getLocalKeyForUser(uid), JSON.stringify(favs || []));
        return true;
    } catch (err) {
        console.error("saveLocalFavorites failed", err);
        return false;
    }
}

// === FIREBASE SAFETY CHECK ===
function isFirestoreReady() {
    return !!(db && typeof db === "object" && auth);
}

// === FIREBASE HELPERS (optional, safe) ===
async function firebaseGetFavorites() {
    if (!isFirestoreReady()) return null;

    try {
        const user = auth?.currentUser;
        if (!user) return null;

        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js");
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;

        const data = snap.data();
        return Array.isArray(data.favorites) ? data.favorites : null;
    } catch (err) {
        console.warn("firebaseGetFavorites failed:", err);
        return null;
    }
}

async function firebaseSaveFavorites(favs) {
    if (!isFirestoreReady()) return false;

    try {
        const user = auth?.currentUser;
        if (!user) return false;

        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js");
        const docRef = doc(db, "users", user.uid);
        await setDoc(docRef, { favorites: favs }, { merge: true });
        return true;
    } catch (err) {
        console.warn("firebaseSaveFavorites failed:", err);
        return false;
    }
}

// === PUBLIC API ===
export function getFavoritesForCurrentUser() {
    try {
        const user = sessionStorage.getItem("currentUser") || "guest";
        const data = localStorage.getItem(`favorites_${user}`);

        if (!data) return [];
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === "object" && parsed !== null) return [parsed];
        return [];
    } catch (err) {
        console.error("Error reading favorites:", err);
        return [];
    }
}

export async function saveFavoritesForCurrentUser(favs) {
    saveLocalFavorites(favs);
    await firebaseSaveFavorites(favs); // will safely no-op if Firestore isn't ready
    return true;
}

// === EXPORT / SHARE ===
export function exportFavoritesAsFile(favs) {
    try {
        const dataStr = JSON.stringify(favs || [], null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "favorites.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        safeToast("✅ Favorites exported", "success");
    } catch (err) {
        console.error("exportFavoritesAsFile failed", err);
        safeToast("❌ Failed to export favorites", "error");
    }
}

export async function createShareLink(favs) {
    try {
        const payload = btoa(unescape(encodeURIComponent(JSON.stringify(favs || getLocalFavorites()))));
        const url = new URL(location.href);
        url.searchParams.set("shared", payload);
        const link = url.toString();

        try {
            await navigator.clipboard.writeText(link);
            safeToast("✅ Share link copied to clipboard!", "success");
        } catch (e) {
            safeToast("🔗 Unable to copy — opened in new tab.", "info");
            window.open(link, "_blank");
        }

        return link;
    } catch (err) {
        console.error("createShareLink failed:", err);
        return null;
    }
}

export function loadSharedFavoritesFromQuery(replaceExisting = false) {
    const params = new URLSearchParams(location.search);
    if (!params.has("shared")) return false;

    try {
        const payload = decodeURIComponent(escape(atob(params.get("shared"))));
        const imported = JSON.parse(payload);
        if (!Array.isArray(imported)) throw new Error("imported favorites not array");

        const current = getLocalFavorites();
        const combined = replaceExisting ? imported : mergeUnique(current, imported);

        saveLocalFavorites(combined);
        safeToast("✅ Imported shared favorites!", "success");
        return true;
    } catch (err) {
        console.error("loadSharedFavoritesFromQuery failed:", err);
        safeToast("❌ Failed to import shared favorites.", "error");
        return false;
    }
}

function mergeUnique(current, imported) {
    const existingIds = new Set(current.map((e) => e.id));
    const merged = [...current];
    for (const it of imported) {
        if (!it?.id || !existingIds.has(it.id)) merged.push(it);
    }
    return merged;
}
