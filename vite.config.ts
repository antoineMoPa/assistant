import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/assistant.ts',
            formats: ['es'],
            fileName: () => 'bundle.js'
        },
        outDir: 'dist',
        rollupOptions: {
            external: ['fs', 'path', 'readline', 'os'], // Don't bundle node built-ins
        },
        minify: false, // Optional: keep readable
        sourcemap: false,
    }
});
