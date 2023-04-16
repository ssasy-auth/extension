/// <reference types="vitest" />

import { dirname, relative } from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'
import { isDev, port, r, isManifest3 } from './scripts/utils'

export const sharedConfig: UserConfig = {
  root: r('src'),
  resolve: {
    alias: {
      '~/': `${r('src')}/`
    }
  },
  define: {
    __DEV__: isDev
  },
  plugins: [
    Vue(),
    Pages(),
    Layouts(),

    AutoImport({
      imports: [
        'vue',
        {
          'webextension-polyfill': [
            [ '*', 'browser' ]
          ]
        }
      ],
      dts: r('src/auto-imports.d.ts')
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      dirs: [ r('src/components') ],
      // generate `components.d.ts` for ts support with Volar
      dts: r('src/components.d.ts')
    }),

    // https://github.com/unocss/unocss
    UnoCSS(),

    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        return html.replace(/"\/assets\//g, `"${relative(dirname(path), '/assets')}/`)
      }
    }
  ],
  optimizeDeps: {
    include: [
      'vue',
      '@vueuse/core',
      'webextension-polyfill'
    ],
    exclude: [
      'vue-demi'
    ]
  }
}

export default defineConfig(({ command }) => ({
  ...sharedConfig,
  base: command === 'serve' ? `http://localhost:${port}/` : '/dist/',
  server: {
    port,
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: r('extension/dist'),
    emptyOutDir: false,
    sourcemap: isDev ? 'inline' : false,
    // https://developer.chrome.com/docs/webstore/program_policies/#:~:text=Code%20Readability%20Requirements
    terserOptions: {
      mangle: false
    },
    rollupOptions: {
      input: {
        ...(isManifest3 ? {} : { background: r('src/background/index.html') }), // add the background if it's not manifest v3
        options: r('src/options/index.html'),
        popup: r('src/popup/index.html')
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
}))
