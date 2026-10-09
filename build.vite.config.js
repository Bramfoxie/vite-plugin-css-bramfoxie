import { fileURLToPath } from 'node:url';
import { defineConfig }  from 'vite';

export default defineConfig({
    root: './src',
    build: {
        outDir: '../dist',
        lib: {
            entry   : fileURLToPath(new URL('./src/index.js', import.meta.url)),
            name    : 'CssBramfoxie',
            fileName: (format) => `css-bramfoxie.${format}.js`
        },
        rollupOptions: {
            external: [
                'node:path',
                'node:zlib',
                'node:fs/promises',
                'picocolors',
                'clean-css'
            ],
            output: {
                globals: {
                    'node:path'       : 'path',
                    'node:zlib'       : 'zlib',
                    'node:fs/promises': 'fsPromises',
                    'picocolors'      : 'pc',
                    'clean-css'       : 'CleanCSS'
                }
            }
        }
    }
});