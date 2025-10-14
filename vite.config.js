import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Needed because __dirname isn’t available in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    publicDir: "public",

    server: {
        fs: {
            // Allow serving files outside /public, so you can fetch /data/events.json
            allow: [".."],
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
                const srcDir = path.resolve(__dirname, "data");
                const destDir = path.resolve(__dirname, "dist/data");

                if (!fs.existsSync(srcDir)) return; // skip if no folder

                fs.mkdirSync(destDir, { recursive: true });
                fs.readdirSync(srcDir).forEach((file) => {
                    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
                });
                console.log("✅ Copied data folder to dist/");
            },
        },
    ],
});
