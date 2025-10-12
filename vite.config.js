// ✅ vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
    root: ".",
    publicDir: "data", // your public JSON/images/etc folder
    base: "/WDD330-Project-Deli/", // 🔹 VERY IMPORTANT for GitHub Pages (use your repo name)
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: "index.html",
                favorites: "favorites.html",
                login: "auth/login.html"
            }
        }
    },
    server: {
        port: 5173,
        open: true
    }
});
