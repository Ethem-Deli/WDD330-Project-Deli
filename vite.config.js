// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                favorites: 'favorites.html',
                login: 'auth/login.html'
            }
        }
    }
});
