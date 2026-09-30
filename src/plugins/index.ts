/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Types
import type { App } from 'vue'

import { vReveal } from '@/directives/reveal'
import router from '@/router'
// Plugins
import vuetify from './vuetify'

export function registerPlugins (app: App) {
  app.use(vuetify)
  app.use(router)
  app.directive('reveal', vReveal)
}
