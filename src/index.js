import path                           from 'node:path';
import { gzipSync }                   from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import pc                             from 'picocolors';
import CleanCSS                       from 'clean-css';
import { version }                    from '../package.json';

const { cyan, green, yellow, dim, bold } = pc;

const NAME    = 'vite-plugin-css-bramfoxie';
const VERSION = cyan('CssBramfoxie v' + version);

export default function CssBramfoxie (userOptions) {
    let options;
    let root;

    return {
        name: NAME,
        apply: 'build',
        configResolved (config) {
            root = config.root;
            options = normalizeOptions(userOptions);
        },
        closeBundle: {
            order: 'pre',
            sequential: true,
            async handler () {
                let log = createLogger(options.verbose);
                let keys = Object.keys(options.targets);
                let finished = 0;

                log.info('\n' + VERSION + green(' building...'));

                let buildTime = performance.now();

                if (!log.isTTY) log.info('transforming...');

                // Work.
                //------------------------------------------------------------------------------------------------------
                let outcomeList = await Promise.all(keys.map(async key => {
                    try {
                        return await processTarget(key, options.targets[key], options, root);
                    } catch (error) {
                        return { file: key, error: error };
                    } finally {
                        finished += 1;
                        log.step(`transforming (${finished}/${keys.length}) ` + dim(key));
                    }
                }));
                //------------------------------------------------------------------------------------------------------

                let resultList = outcomeList.filter(outcome => !outcome.error);
                let errorList  = outcomeList.filter(outcome => outcome.error);

                // End.
                //------------------------------------------------------------------------------------------------------
                log.done(green('✓ ') + resultList.length + ` ${resultList.length === 1 ? 'file' : 'files'} transformed.`);

                printLog(log, resultList, options.outDir);

                resultList.forEach(result => {
                    result.warnings.forEach(warning => log.info(yellow(`${result.file}: ${warning}`)));
                });

                log.info(green('✓ built in ' + Math.ceil(performance.now() - buildTime) + 'ms'));
                //------------------------------------------------------------------------------------------------------

                // Errors always fail the build, regardless of "verbose".
                if (errorList.length > 0) {
                    this.error(errorList.map(outcome => `File: ${outcome.file}\n${outcome.error.message || outcome.error}`).join('\n\n'));
                }
            }
        }
    }
}

function normalizeOptions (userOptions) {
    let fail = message => {
        throw new Error(`[${NAME}] ${message}`);
    };

    if (userOptions === null || typeof userOptions !== 'object') fail('options is not an object!');

    if (typeof userOptions.outDir !== 'string') fail('outDir is not valid!');

    let targets = userOptions.targets;

    if (targets === null || typeof targets !== 'object' || Array.isArray(targets)) fail('targets is not an object!');

    if (Object.keys(targets).length === 0) fail('targets is empty!');

    for (let key in targets) {
        if (typeof targets[key] !== 'string') fail(`targets key "${key}" is not a string!`);
    }

    // Leading slashes are dropped: outDir is always relative to the Vite root.
    return {
        verbose      : userOptions.verbose !== false,
        outDir       : userOptions.outDir.replace(/^\/+/, ''),
        minifyOptions: userOptions.minifyOptions,
        targets      : targets
    };
}

function createLogger (verbose) {
    let isTTY = Boolean(process.stdout.isTTY);

    return {
        isTTY,

        info (message) {
            if (verbose) console.log(message);
        },

        // Progress line, rewritten in place (TTY only).
        step (message) {
            if (!verbose || !isTTY) return;

            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(message);
        },

        // Replaces the progress line with the final message.
        done (message) {
            if (!verbose) return;

            if (isTTY) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(message + '\n');
            } else {
                console.log(message);
            }
        }
    };
}

async function processTarget (key, source, options, root) {
    // Source is resolved from the current working directory, destination from the Vite root.
    let srcFile  = path.resolve(source);
    let destFile = path.resolve(root, options.outDir, key);

    let styles = await readFile(srcFile, 'utf8');

    // Source is passed as a hash, so relative @import paths are resolved against the file itself.
    let output = new CleanCSS(options.minifyOptions).minify({ [srcFile]: { styles } });

    if (output.errors.length > 0) throw new Error(output.errors.join('\n'));

    await mkdir(path.dirname(destFile), { recursive: true });
    await writeFile(destFile, output.styles);

    return {
        file    : key,
        size    : output.stats.minifiedSize,
        gzipSize: gzipSync(output.styles).length,
        warnings: output.warnings
    };
}

function printLog (log, resultList, outDir) {
    let rowList = resultList.map(result => ({
        file    : result.file,
        size    : (result.size / 1000).toFixed(2),
        gzipSize: (result.gzipSize / 1000).toFixed(2)
    }));

    let maxLengthFile     = Math.max(0, ...rowList.map(row => row.file.length));
    let maxLengthSize     = Math.max(0, ...rowList.map(row => row.size.length));
    let maxLengthGzipSize = Math.max(0, ...rowList.map(row => row.gzipSize.length));

    let prefix = outDir === '' ? '' : path.join(outDir, '/');

    rowList.forEach(row => {
        let size     = row.size.padStart(maxLengthSize);
        let gzipSize = row.gzipSize.padStart(maxLengthGzipSize);

        log.info(dim(prefix) + cyan(row.file.padEnd(maxLengthFile)) + '  ' + dim(bold(size + ' kB') + ' │ gzip: ' + gzipSize + ' kB'));
    });
}