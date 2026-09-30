/**
 * main.ts
 *
 * Bootstraps Vuetify, the router and the global directive, then mounts the App.
 */

import { createApp } from 'vue'

import { registerPlugins } from '@/plugins'
import App from './App.vue'

// Fonts (self-hosted through fontsource)
import '@fontsource-variable/montserrat'
import '@fontsource-variable/caveat'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/jetbrains-mono'

// Global tokens and utilities. Imported after Vuetify so equal specificity resolves to ours.
import '@/styles/main.css'

/**
 * Paints a small monochrome noise tile on a canvas and publishes it as --grain.
 * Every pixel is independent, so the tile repeats without a visible seam. Light
 * specks are sparser and dimmer than dark ones, which keeps the average tone of
 * the page where it was instead of lifting it. Skipped if canvas is unavailable.
 */
function makeGrain (size = 160) {
  try {
    const scale = Math.min(window.devicePixelRatio || 1, 2)
    const px = Math.round(size * scale)
    const canvas = document.createElement('canvas')
    canvas.width = px
    canvas.height = px
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(px, px)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      const n = Math.random()
      const light = n > 0.62
      const v = light ? 236 : 0
      d[i] = v
      d[i + 1] = v
      d[i + 2] = v - (light ? 6 : 0)
      // Alpha 0-8 for light specks, 0-10 for dark ones (of 255).
      d[i + 3] = Math.round(Math.random() * (light ? 8 : 10))
    }
    ctx.putImageData(img, 0, 0)
    document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL('image/png')})`)
  } catch {
    // The grain is decoration only.
  }
}

makeGrain()

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
