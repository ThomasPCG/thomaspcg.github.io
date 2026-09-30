/**
 * composables/useColorMode.ts
 *
 * Light/dark switch. Vuetify owns the active theme ('ink' is dark, 'paper' is light)
 * and the view transition between them; the choice is remembered in localStorage.
 * `applyColorMode` mirrors the theme onto <html data-theme>, which main.css keys its
 * tokens on, and onto the browser's theme-color. Dark is the default, and index.html
 * runs the same lookup before first paint so a saved light choice does not flash dark.
 */

import { computed } from 'vue'
import { useTheme } from 'vuetify'

export type ColorMode = 'dark' | 'light'

const STORAGE_KEY = 'theme'

const THEME_NAME: Record<ColorMode, string> = { dark: 'ink', light: 'paper' }
const CHROME_COLOR: Record<ColorMode, string> = { dark: '#0d0d0c', light: '#eeeae1' }

export const themeNameFor = (mode: ColorMode) => THEME_NAME[mode]
export const modeFor = (themeName: string): ColorMode => (themeName === THEME_NAME.light ? 'light' : 'dark')

export function initialColorMode (): ColorMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyColorMode (mode: ColorMode) {
  document.documentElement.dataset.theme = mode
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME_COLOR[mode])
}

export function useColorMode () {
  const theme = useTheme()
  const mode = computed(() => modeFor(theme.name.value))

  /** `origin` is the element the theme change radiates from. */
  function toggle (origin?: Element | null) {
    const next: ColorMode = mode.value === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice just won't outlive the tab.
    }
    theme.setTransitionOrigin(origin ?? null)
    return theme.change(THEME_NAME[next], true)
  }

  return { mode, toggle }
}
