import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
    build: {
        target: 'esnext',
        lib: {
            entry: 'src/runAssistant.ts',
            formats: ['es'],
            fileName: () => 'bundle.js'
        },
        outDir: 'dist',
        rollupOptions: {
            external: [
                'blessed',
                ...builtinModules,
                ...builtinModules.map(m => `node:${m}`)
            ],
            output: {
                banner: '#!/usr/bin/env node'
            },
        },
        minify: false, // Optional: keep readable
        sourcemap: false,
    }
});
