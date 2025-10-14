import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    base: "/", // ✅ needed for GitHub Pages root site
    publicDir: "public",

    server: {
        fs: {
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

                if (!fs.existsSync(srcDir)) return;

                fs.mkdirSync(destDir, { recursive: true });
                fs.readdirSync(srcDir).forEach((file) => {
                    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
                });
                console.log("✅ Copied data folder to dist/");
            },
        },
    ],
});
