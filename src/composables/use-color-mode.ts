/**
 * composables/use-color-mode.ts
 *
 * Light/dark switch. Vuetify owns the active theme ('paper' is light, 'ink' is dark)
 * and the view transition between them; the choice is remembered as `theme` inside the
 * `preferences` object in localStorage (`preferences.theme`). `applyColorMode` mirrors
 * the theme onto <html data-theme>, which main.css keys its tokens on, and onto the
 * browser's theme-color, and repaints the film-grain tile (`makeGrain`) for it. Light is the default, and index.html runs the same lookup
 * before first paint so a saved dark choice does not flash light.
 */

import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { readPreferences, writePreferences } from '@/composables/use-preferences'

export type ColorMode = 'dark' | 'light'

const THEME_NAME: Record<ColorMode, string> = { dark: 'ink', light: 'paper' }
const CHROME_COLOR: Record<ColorMode, string> = { dark: '#0d0d0c', light: '#eeeae1' }

export const themeNameFor = (mode: ColorMode) => THEME_NAME[mode]
export const modeFor = (themeName: string): ColorMode => (themeName === THEME_NAME.dark ? 'dark' : 'light')

export function initialColorMode(): ColorMode {
    return readPreferences().theme === 'dark' ? 'dark' : 'light'
}

/**
 * Paints a small monochrome noise tile on a canvas and publishes it as --grain.
 * Every pixel is independent, so the tile repeats without a visible seam. Light
 * specks are sparser and dimmer than dark ones, which keeps the average tone of
 * the page where it was instead of lifting it. Skipped if canvas is unavailable.
 * `mode` is the active theme the tile is painted for; main.css sets how strongly
 * each theme shows it.
 */
export function makeGrain(mode: ColorMode) {
    const size = 240
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
            const light = n > (mode === 'dark' ? 0.32 : 0.62)
            const v = light ? 236 : 0
            d[i] = v
            d[i + 1] = v
            d[i + 2] = v - (light ? 6 : 0)
            // Alpha 0-40 for light specks, 0-50 for dark ones (of 255).
            d[i + 3] = Math.round(Math.random() * (light ? 40 : 50))
            if (mode === 'dark') {
                 d[i + 3] = Math.round(Math.random() * (light ? 80 : 50))
            }
        }
        ctx.putImageData(img, 0, 0)
        document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL('image/png')})`)
    } catch { }
}

export function applyColorMode(mode: ColorMode) {
    document.documentElement.dataset.theme = mode
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CHROME_COLOR[mode])
    makeGrain(mode)
}

export function useColorMode() {
    const theme = useTheme()
    const mode = computed(() => modeFor(theme.name.value))

    /** `origin` is the element the theme change radiates from. */
    function toggle(origin?: Element | null) {
        const next: ColorMode = mode.value === 'dark' ? 'light' : 'dark'
        writePreferences({ theme: next })
        theme.setTransitionOrigin(origin ?? null)
        return theme.change(THEME_NAME[next], true)
    }

    return { mode, toggle }
}
