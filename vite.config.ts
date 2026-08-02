import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'motion-vendor': ['framer-motion'],
                    'utils': ['clsx']
                }
            }
        },
        minify: 'terser',
        chunkSizeWarningLimit: 600
    }
})
