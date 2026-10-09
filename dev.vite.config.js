import { defineConfig } from 'vite';
import CssBramfoxie from './src/index.js';

export default defineConfig({
    root: './example',
    build: {
        outDir: '../dist-example',
    },
    plugins: [
        CssBramfoxie({
            outDir: '../dist-example',
            minifyOptions: {
                inline: ['local']
            },
            targets: {
                'index.css'     : './example/index.css',
                'the/second.css': './example/fourth/fourth.css'
            }
        })
    ]
});