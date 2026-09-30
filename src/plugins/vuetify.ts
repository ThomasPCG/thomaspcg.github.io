/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 *
 * Vuetify 4 ships its CSS inside cascade layers (declared in public/layers.css),
 * so the un-layered rules in src/styles/main.css win without !important.
 */

import { createVuetify } from 'vuetify'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'ink',
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
    },
  },
  defaults: {
    VBtn: { rounded: 0, ripple: false, variant: 'outlined' },
  },
})
