import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// reference: https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/dashboard/',
    resolve: {
        alias: { '@': path.resolve(__dirname, 'src/') },
    },
});
