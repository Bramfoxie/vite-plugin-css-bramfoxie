# Description

Vite plugin for minimizing css. Clean-CSS is used for minification.

# Install

```
yarn add -D vite-plugin-css-bramfoxie
```

# Requirements

Vite 8+ and Node.js `^20.19.0 || >=22.12.0`.

# Sample vite.config.js

```javascript
import { defineConfig } from 'vite';
import CssBramfoxie from 'vite-plugin-css-bramfoxie';

export default defineConfig ({
    /**
     * Root directory.
     * Required.
     */
    root: './src',
    
    plugins: [
        CssBramfoxie(/* options */)
    ]
});
```

# Options

```javascript
{
    /**
     * Write output to console.
     * Default: true.
     */
    verbose: true,

    /**
     * Path to output directory, relative to the Vite root (a leading "/" is ignored).
     * Required.
     */
    outDir: '../dist',

    /** Clean-CSS minify options, https://github.com/clean-css/clean-css
     */
    minifyOptions: {},

    /**
     * Files to process: { "output file (relative to outDir)": "source file" }.
     * Source paths are resolved from the current working directory.
     * Relative "@import" paths inside a source are resolved from that source file
     * (use minifyOptions.inline to inline them).
     * Required, must not be empty.
     */
    targets: {
        'target.css'        : 'source.css',
        'example/target.css': 'example/source.css'
    }
}
```

# Notes

- The plugin works only in `vite build` and runs after the bundle is closed.
- Invalid options and CSS errors fail the build, even with `verbose: false`.
- Printed sizes are the minified size and its gzip size.