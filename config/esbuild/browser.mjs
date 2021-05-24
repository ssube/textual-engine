import { build } from 'esbuild';
import IgnorePlugin from 'esbuild-plugin-ignore';
import { join } from 'path';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import alias from 'esbuild-plugin-alias';

const root = process.cwd();

build({
    bundle: true,
    define: {
        global: 'window',
    },
    entryPoints: [
        join(root, 'out/src/browser.js'),
    ],
    keepNames: true,
    outdir: 'out/bundle/',
    platform: 'browser',
    plugins: [
        NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
        }),
        NodeModulesPolyfillPlugin(),
        IgnorePlugin([{
            resourceRegExp: /(ink|mv)/,
            contextRegExp: /node_modules/,
        }, {
            resourceRegExp: /components\/ink/,
            contextRegExp: /./,
        }, {
            resourceRegExp: /render\/(Ink|Line)Render/,
            contextRegExp: /./,
        }, {
            resourceRegExp: /loader\/(File)Loader/,
            contextRegExp: /./,
        }, {
            resourceRegExp: /index/,
            contextRegExp: /./,
        }]),
        alias({
            'yargs-parser': join(root, 'node_modules/yargs-parser/browser.js'),
            './util/config/file': join(root, 'out/src/util/config/page.js'),
        }),
    ],
}).catch(() => process.exit(1));
