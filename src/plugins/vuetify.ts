/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 *
 * Vuetify 4 ships its CSS inside cascade layers (declared in public/layers.css),
 * so the un-layered rules in src/styles/main.css win without !important.
 */

import { watch } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { applyColorMode, initialColorMode, modeFor, themeNameFor } from '@/composables/use-color-mode'

const initial = initialColorMode()

const vuetify = createVuetify({
  theme: {
    defaultTheme: themeNameFor(initial),
    themes: {
      ink: {
        dark: true,
        colors: {
          'background': '#0d0d0c',
          'surface': '#141412',
          'primary': '#ff5b2e',
          'on-background': '#ece7dd',
          'on-surface': '#ece7dd',
          'on-primary': '#0d0d0c',
        },
      },
      paper: {
        dark: false,
        colors: {
          'background': '#eeeae1',
          'surface': '#f7f4ee',
          'primary': '#ff5b2e',
          'on-background': '#14130f',
          'on-surface': '#14130f',
          'on-primary': '#0d0d0c',
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: 0, ripple: false, variant: 'outlined' },
  },
})

// Keep <html data-theme> in step with the active theme. The watcher is sync so the
// change lands inside Vuetify's view-transition update callback, not a frame after it.
applyColorMode(initial)
watch(vuetify.theme.name, name => applyColorMode(modeFor(name)), { flush: 'sync' })

export default vuetify
