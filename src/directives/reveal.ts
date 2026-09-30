/**
 * directives/reveal.ts
 *
 * `v-reveal` fades and lifts an element into place the first time it scrolls
 * into view. The optional value is a delay in milliseconds, useful for
 * staggering siblings: <li v-reveal="i * 90">.
 * The visual states live in src/styles/main.css (.reveal / .is-in).
 */

import type { Directive } from 'vue'

type RevealEl = HTMLElement & { __revealObserver?: IntersectionObserver }

function setDelay (el: HTMLElement, value: unknown) {
  if (typeof value === 'number' && value > 0) {
    el.style.setProperty('--d', `${value}ms`)
  } else {
    el.style.removeProperty('--d')
  }
}

export const vReveal: Directive<RevealEl, number | undefined> = {
  mounted (el, { value }) {
    el.classList.add('reveal')
    setDelay(el, value)

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          el.classList.add('is-in')
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    el.__revealObserver = observer
  },
  updated (el, { value }) {
    setDelay(el, value)
  },
  unmounted (el) {
    el.__revealObserver?.disconnect()
  },
}
