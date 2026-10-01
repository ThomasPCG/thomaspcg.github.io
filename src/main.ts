/**
 * main.ts
 *
 * Bootstraps Vuetify, the router and the global directive, then mounts the App.
 */

import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import App from './app.vue'

// Fonts (self-hosted through fontsource)
import '@fontsource-variable/montserrat'
import '@fontsource-variable/caveat'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/jetbrains-mono'

// Global tokens and utilities. Imported after Vuetify so equal specificity resolves to ours.
import '@/styles/main.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
