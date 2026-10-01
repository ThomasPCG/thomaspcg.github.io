<script setup lang="ts">
  /**
   * Closing call to action, shown on every page. Holds the `#contact` anchor.
   */
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { colophon, site } from '@/data/content'
  import ArrowIcon from './arrow-icon.vue'

  // ---- Singapore clock ------------------------------------------------------
  const clock = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  })
  const time = ref(clock.format(new Date()))
  let tick = 0

  // ---- Magnetic email link ----------------------------------------------------
  const MAX_PULL = 6
  const mail = ref<HTMLElement>()
  const magnetic = ref(false)

  function pull (e: PointerEvent) {
    const el = mail.value
    if (!magnetic.value || !el) return
    const box = el.getBoundingClientRect()
    const dx = (e.clientX - (box.left + box.width / 2)) / (box.width / 2)
    const dy = (e.clientY - (box.top + box.height / 2)) / (box.height / 2)
    const clamp = (n: number) => Math.max(-1, Math.min(1, n)) * MAX_PULL
    el.style.transform = `translate3d(${clamp(dx).toFixed(2)}px, ${clamp(dy).toFixed(2)}px, 0)`
  }

  function release () {
    if (mail.value) mail.value.style.transform = ''
  }

  onMounted(() => {
    tick = window.setInterval(() => {
      time.value = clock.format(new Date())
    }, 30_000)
    magnetic.value
      = window.matchMedia('(pointer: fine)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  onBeforeUnmount(() => window.clearInterval(tick))

  function toTop () {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }
</script>

<template>
  <footer id="contact" class="footer">
    <div class="wrap">
      <div class="rule" />

      <!-- Label in cols 1-3, content from col 4: the same column rule as the rest of the site. -->
      <div class="footer__body grid-12">
        <p class="footer__label t-label">Contact</p>

        <h2 v-reveal class="footer__pitch t-display">
          Let&rsquo;s Make <span class="accent">Great</span> Things <em>Together</em>.
        </h2>

        <div v-reveal="120" class="footer__mail-zone" @pointerleave="release" @pointermove="pull">
          <a ref="mail" class="footer__mail link-u" :href="`mailto:${site.email}`">
            <span v-text="site.email"></span>
            <ArrowIcon dir="up-right" />
          </a>
        </div>
      </div>

      <div class="footer__meta rule">
        <div class="grid-12 footer__row t-label">
          <p class="footer__copy">&copy; 2026 <span v-text="site.name"></span></p>
          <a class="footer__link link-u" :href="site.github" rel="noopener" target="_blank">
            GitHub
            <ArrowIcon dir="up-right" />
          </a>
          <p class="footer__clock">
            <time v-text="time"></time> SGT
          </p>
          <button class="footer__top link-u" type="button" @click="toTop">
            Back to top
            <ArrowIcon dir="up" />
          </button>
        </div>

        <div class="footer__colophon grid-12">
          <p class="footer__colophon-label t-label">Built with Claude</p>
          <p class="footer__colophon-text" v-html="colophon"></p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding-bottom: clamp(32px, 4vw, 56px);
}

.footer__body {
  --pitch: clamp(2.75rem, 6.2vw, 6rem);
  padding-block: clamp(56px, 8vw, 120px) clamp(72px, 10vw, 152px);
  row-gap: 0;
}

.footer__label {
  grid-column: 1 / span 3;
  grid-row: 1;
  margin: 0;
  /* Drops the label's cap line onto the headline's (Instrument Serif at .88 line
     height: cap-top 0.06em; JetBrains Mono label at 1.5: 0.38em of 0.72rem). */
  margin-top: calc(var(--pitch) * 0.06 - 0.274rem);
}

.footer__pitch {
  grid-column: 4 / -1;
  grid-row: 1;
  font-size: var(--pitch);
}

.footer__mail-zone {
  grid-column: 4 / -1;
  grid-row: 2;
  justify-self: start;
  /* A wider catch area for the magnetic pull without moving the layout. */
  margin: clamp(28px, 4vw, 56px) -24px -24px;
  padding: 24px;
}

.footer__mail {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2em;
  max-width: 100%;
  font-size: clamp(0.8rem, 3vw, 1.5rem);
  font-weight: 300;
  line-height: 1.3;
  letter-spacing: -0.01em;
  transition:
    background-size 0.4s var(--ease),
    transform 0.5s var(--ease);
}

.footer__mail .arrow-icon {
  align-self: center;
  font-size: 0.7em;
}

/* ------------------------------------------------------------ bottom row
   Four cells across the full width: 1-3, 4-6, 7-9, 10-12. */
.footer__meta {
  padding-top: 24px;
}

.footer__row {
  row-gap: 14px;
  align-items: baseline;
}

.footer__row > * {
  grid-column: span 2;
  margin: 0;
}

.footer__link {
  justify-self: start;
  width: fit-content;
}

.footer__clock {
  color: var(--fg-muted);
}

.footer__top {
  justify-self: end;
  width: fit-content;
  padding: 0 0 0.12em;
  border: 0;
  background-color: transparent;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: var(--fg-muted);
  cursor: pointer;
  transition:
    background-size 0.4s var(--ease),
    color 0.3s var(--ease);
}

.footer__top:is(:hover, :focus-visible) {
  color: var(--fg);
}

.footer__copy {
  color: var(--fg);
}

/* --------------------------------------------------------------- colophon
   Label in cols 1-3, text from col 4, directly under the GitHub cell. */
.footer__colophon {
  margin-top: clamp(40px, 5vw, 64px);
  row-gap: 10px;
  align-items: baseline;
}

.footer__colophon-label {
  grid-column: 1 / span 3;
  margin: 0;
}

.footer__colophon-text {
  grid-column: 4 / span 6;
  max-width: 52ch;
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--fg-muted);
}

@media (min-width: 760px) {
  .footer__row > * {
    grid-column: span 3;
  }
}

@media (max-width: 759.98px) {
  .footer__label,
  .footer__pitch,
  .footer__mail-zone {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .footer__label {
    margin-top: 0;
    margin-bottom: clamp(28px, 4vw, 48px);
  }

  .footer__colophon-label,
  .footer__colophon-text {
    grid-column: 1 / -1;
  }
}
</style>
