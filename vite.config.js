// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: "data",
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                main: 'index.html',
                favorites: 'favorites.html',
                login: 'auth/login.html'
            }
        }
    }
});
