import type { Plugin } from 'vite';
import type { OptionsOutput } from 'clean-css';

export interface CssBramfoxieOptions {
    /** Write output to console. Default: true. */
    verbose?: boolean;

    /** Path to output directory, relative to the Vite root. */
    outDir: string;

    /** Clean-CSS minify options, https://github.com/clean-css/clean-css */
    minifyOptions?: OptionsOutput | Record<string, unknown>;

    /** Files to process: { "output file (relative to outDir)": "source file" }. */
    targets: Record<string, string>;
}

export default function CssBramfoxie (options: CssBramfoxieOptions): Plugin;
