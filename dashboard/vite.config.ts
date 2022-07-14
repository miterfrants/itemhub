import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import visualizer from 'rollup-plugin-visualizer';

// reference: https://vitejs.dev/config/

export default () => {
    return defineConfig({
        plugins: [react()],
        base: '/dashboard/',
        resolve: {
            alias: { '@': path.resolve(__dirname, 'src/') },
        },
        build: {
            rollupOptions: {
                plugins: [
                    visualizer({
                        open: true,
                        gzipSize: true,
                        brotliSize: true,
                    }),
                ],
            },
        },
    });
};
