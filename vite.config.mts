import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { projects } from './src/data/content'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// GitHub Pages serves <route>/index.html for each folder and 404.html for anything else.
// After the build, write a copy of index.html for every known route (with its own <title>)
// so each page is a real URL on disk, and reuse it as 404.html for unknown paths.
function multiPage (): Plugin {
  let outDir = 'dist'
  return {
    name: 'multi-page-routes',
    apply: 'build',
    configResolved (config) {
      outDir = config.build.outDir
    },
    closeBundle () {
      const html = readFileSync(`${outDir}/index.html`, 'utf8')
      const pages: Record<string, string> = {
        work: 'Work — Thomas Lim',
        about: 'About — Thomas Lim',
      }
      for (const p of projects) {
        pages[`work/${p.slug}`] = `${p.title} — Thomas Lim`
      }
      for (const [route, title] of Object.entries(pages)) {
        mkdirSync(`${outDir}/${route}`, { recursive: true })
        writeFileSync(
          `${outDir}/${route}/index.html`,
          html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`),
        )
      }
      copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    multiPage(),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
    open: true,
  },
})
