// vite.config.js
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple copy function for local builds only (skip in Pages)
function copyDataFolder() {
    try {
        const fs = require("fs"); // only used locally
        const srcDir = path.resolve(__dirname, "data");
        const destDir = path.resolve(__dirname, "dist/data");

        if (!fs.existsSync(srcDir)) return;
        fs.mkdirSync(destDir, { recursive: true });
        fs.readdirSync(srcDir).forEach((file) => {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
        });
        console.log("✅ Copied data folder to dist/");
    } catch {
        // On GitHub Pages or Vite preview, this will safely skip
        console.log("ℹ️ Skipping data folder copy (no fs in browser env)");
    }
}

export default defineConfig({
    // This is essential for GitHub Pages:
    base: "/WDD330-Project-Deli/",

    publicDir: "public",

    server: {
        fs: {
            allow: [".."], // Allow serving /data locally
        },
    },

    build: {
        rollupOptions: {
            input: "index.html",
        },
    },

    plugins: [
        {
            name: "copy-data-folder",
            apply: "build",
            closeBundle() {
                copyDataFolder();
            },
        },
    ],
});
