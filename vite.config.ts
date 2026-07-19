/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import babel from '@rollup/plugin-babel';
import react from '@vitejs/plugin-react';
import {defineConfig, type PluginOption, type UserConfig} from 'vite';

import transformErrorMessages from './scripts/vite/viteModuleResolution';
import viteMonorepoResolutionPlugin from './scripts/vite/lexicalMonorepoPlugin';
import viteCopyEsm from './viteCopyEsm';
import viteCopyExcalidrawAssets from './viteCopyExcalidrawAssets';
import dts from 'vite-plugin-dts';
// react() returns Plugin[]; widening it to PluginOption[] here lets the plugins
// array below infer as PluginOption[] (every other entry is a Plugin, which is
// a PluginOption) without annotating the whole array. That matters because
// comparing the inferred plugin union against vite's recursively-defined
// PluginOption type overflows with "Excessive stack depth" on newer vite type
// definitions; widening the one array-valued entry keeps the check shallow.
const reactPlugins: PluginOption[] = react();

// https://vitejs.dev/config/
export default defineConfig(
({mode}): UserConfig => ({

  build: {

    // Library output folder
    outDir: 'dist',

    target: 'es2022',

    lib: {

      // NEW library entry
      entry: './src/index.ts',

      name: 'LexicalEditor',

      fileName: 'lexical-editor',

      formats: [
        'es'
      ],
    },


    rollupOptions: {

      // Do not bundle these
      external: [
        'react',
        'react-dom',

        'lexical',
        '@lexical/react',

        '@lexical/utils',
        '@lexical/html',
        '@lexical/list',
        '@lexical/table',
        '@lexical/link',
        '@lexical/history',
        '@lexical/rich-text',
      ],

    },


    ...(mode === 'production'
      ? {
          minify: 'terser',

          terserOptions: {
             keep_classnames: true,
          },
        }
      : {
          minify: false,
        }),
  },


  plugins: [

    // TypeScript declarations
    dts({
      insertTypesEntry: true,
    }),


    viteMonorepoResolutionPlugin(),


    babel({

      babelHelpers: 'bundled',

      babelrc: false,

      configFile: false,

      exclude: '**/node_modules/**',

      extensions: [
        'jsx',
        'js',
        'ts',
        'tsx',
        'mjs',
      ],


      plugins: [

        '@babel/plugin-transform-flow-strip-types',

        ...(mode !== 'production'
          ? [
              [
                transformErrorMessages,
                {
                  noMinify: true,
                },
              ],
            ]
          : []),

      ],


      presets: [
        [
          '@babel/preset-react',
          {
            runtime: 'automatic',
          },
        ],
      ],

    }),


    ...reactPlugins,


    // Keep only if your editor needs these assets
    ...viteCopyExcalidrawAssets(),

    viteCopyEsm(),

  ],

}));