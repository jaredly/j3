import { defineConfig } from 'vite';
import linaria from '@linaria/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    define: { 'process.env': {} },
    plugins: [
        react(),
        linaria({
            include: ['**/*.{ts,tsx}'],
            babelOptions: {
                presets: ['@babel/preset-typescript', '@babel/preset-react'],
            },
        }),
    ],
});
