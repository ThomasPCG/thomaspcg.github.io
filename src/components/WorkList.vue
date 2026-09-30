<script setup lang="ts">
  /**
   * Editorial project table. Every row links to its case study.
   * By default only featured projects are listed; pass `show-all` for the full index.
   *
   * Column rule (12-col grid, >= 760px): the index sits in cols 1-3 on the
   * title's cap line, the title starts at col 4 and the summary runs beneath
   * it. Kind, year and the arrow are right-aligned in cols 10-12, their first
   * line on the title's cap line. On hover-capable desktops the summary stops
   * at col 7 and the preview panel floats in the gap between it and the
   * right-hand meta, so it never covers text. The first row has no top
   * hairline because the heading above it draws the only rule; pass `ruled`
   * when nothing above the list does.
   * `start` is the number printed on the first row (Home starts at 02, since the
   * lead story is 01).
   */
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import type { Project } from '@/data/content'
  import ArrowIcon from './ArrowIcon.vue'
  import ProjectGlyph from './ProjectGlyph.vue'

  const props = withDefaults(
    defineProps<{ projects: Project[], showAll?: boolean, ruled?: boolean, start?: number }>(),
    { start: 1 },
  )

  const rows = computed(() => (props.showAll ? props.projects : props.projects.filter(p => p.featured)))
  const pad = (n: number) => String(n).padStart(2, '0')

  // ---- floating preview ---------------------------------------------------
  // A 4:3 panel that follows the cursor's Y and sits in the gap between the
  // text block (titles, summaries) and the right-aligned meta. Its width is
  // whatever that gap allows, up to PREVIEW_W; if the gap is too narrow the
  // panel stays hidden rather than cover text.
  const PREVIEW_W = 320
  const PREVIEW_MIN_W = 220
  const RATIO = 3 / 4
  const CLEAR = 20 // air between the panel and the text on either side
  const TITLE_SHIFT = 22 // how far a title slides right on hover
  const SIDE_SHIFT = 14 // how far the right-hand meta slides left on hover
  const MARGIN = 16

  const enabled = ref(false)
  const visible = ref(false)
  const active = ref('')
  const size = ref({ w: PREVIEW_W, h: PREVIEW_W * RATIO })
  const list = ref<HTMLElement>()
  const panel = ref<HTMLElement>()

  let mq: MediaQueryList | undefined
  let reduceMotion = false
  let raf = 0
  let lastFrame = 0
  let targetX = 0
  let targetY = 0
  let x = 0
  let y = 0

  /** Horizontal position of an element's edge with its hover transform removed. */
  function restX (el: Element, edge: 'left' | 'right') {
    const rect = el.getBoundingClientRect()
    const tx = new DOMMatrixReadOnly(getComputedStyle(el).transform).m41
    return rect[edge] - tx
  }

  /**
   * Fit the panel into the gap between the widest text in the list and the
   * nearest right-hand meta. Returns false when the gap is too narrow.
   */
  function measure () {
    const root = list.value
    if (!root) return false
    let textRight = 0
    let sideLeft = Infinity
    root.querySelectorAll('.row__title, .row__summary').forEach(el => {
      textRight = Math.max(textRight, restX(el, 'right'))
    })
    root.querySelectorAll('.row__side').forEach(el => {
      sideLeft = Math.min(sideLeft, restX(el, 'left'))
    })
    const from = textRight + TITLE_SHIFT + CLEAR
    const to = sideLeft - SIDE_SHIFT - CLEAR
    const free = to - from
    if (!Number.isFinite(free) || free < PREVIEW_MIN_W) return false
    const w = Math.round(Math.min(PREVIEW_W, free))
    size.value = { w, h: Math.round(w * RATIO) }
    targetX = to - w
    return true
  }

  function aim (e: PointerEvent) {
    const h = size.value.h
    targetY = Math.min(Math.max(e.clientY - h / 2, MARGIN), window.innerHeight - h - MARGIN)
  }

  function paint () {
    if (panel.value) {
      panel.value.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }
  }

  function frame (now: number) {
    const dt = Math.min(now - lastFrame, 64)
    lastFrame = now
    // Frame-rate independent exponential smoothing
    const k = reduceMotion ? 1 : 1 - Math.pow(1 - 0.14, dt / 16.67)
    x += (targetX - x) * k
    y += (targetY - y) * k
    paint()
    raf = visible.value || Math.hypot(targetX - x, targetY - y) > 0.5 ? requestAnimationFrame(frame) : 0
  }

  function run () {
    if (!raf) {
      lastFrame = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }

  function onEnter (slug: string, e: PointerEvent) {
    if (!enabled.value || e.pointerType === 'touch') return
    if (!measure()) {
      visible.value = false
      return
    }
    active.value = slug
    aim(e)
    if (!visible.value) {
      // First appearance: start in place instead of gliding in from the last position.
      x = targetX
      y = targetY
      paint()
      visible.value = true
    }
    run()
  }

  function onMove (e: PointerEvent) {
    if (!visible.value) return
    aim(e)
    run()
  }

  function onLeave () {
    visible.value = false
  }

  function syncEnabled () {
    enabled.value = !!mq?.matches
    if (!enabled.value) visible.value = false
  }

  onMounted(() => {
    mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1280px)')
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    syncEnabled()
    mq.addEventListener('change', syncEnabled)
    window.addEventListener('resize', onLeave, { passive: true })
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    mq?.removeEventListener('change', syncEnabled)
    window.removeEventListener('resize', onLeave)
  })
</script>

<template>
  <div class="work-list" :class="{ 'work-list--ruled': ruled }">
    <ol ref="list" class="work-list__rows" @pointerleave="onLeave" @pointermove="onMove">
      <li v-for="(project, i) in rows" :key="project.slug" v-reveal class="work-list__item">
        <RouterLink class="row" :to="`/work/${project.slug}`" @pointerenter="onEnter(project.slug, $event)">
          <span class="row__idx t-label">{{ pad(start + i) }}</span>
          <span class="row__title">{{ project.title }}</span>
          <span class="row__side">
            <span class="row__meta t-label">
              <span class="row__kind">{{ project.kind }}</span>
              <span class="row__year">{{ project.year }}</span>
            </span>
            <ArrowIcon class="row__arrow" dir="right" />
          </span>
          <span class="row__summary">{{ project.summary }}</span>
        </RouterLink>
      </li>
    </ol>

    <Teleport to="body">
      <div
        v-if="enabled"
        ref="panel"
        aria-hidden="true"
        class="preview"
        :style="{ width: `${size.w}px`, height: `${size.h}px` }"
      >
        <div class="preview__card" :class="{ 'is-on': visible }">
          <ProjectGlyph
            v-for="project in rows"
            :key="project.slug"
            class="preview__glyph"
            :class="{ 'is-active': project.slug === active }"
            :kind="project.glyph"
            :seed="project.slug"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.work-list__rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

.work-list__item {
  border-top: 1px solid var(--line);
}

.work-list__item:last-child {
  border-bottom: 1px solid var(--line);
}

/* The heading above draws the only rule, so the first row starts bare. */
.work-list:not(.work-list--ruled) .work-list__item:first-child {
  border-top: 0;
}

/* ------------------------------------------------------------------ row
   idx in cols 1-3, title and summary from col 4, kind + year + arrow
   right-aligned in cols 10-12. */
.row {
  --gap: clamp(16px, 2vw, 32px);
  --pad: clamp(28px, 3.2vw, 44px);
  --title: clamp(2rem, 3.4vw, 2.75rem);
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: var(--gap);
  row-gap: 12px;
  align-items: start;
  padding-block: var(--pad);
}

.work-list:not(.work-list--ruled) .work-list__item:first-child .row {
  padding-top: 0;
}

/* Hover plate. It spans exactly from hairline end to hairline end. */
.row::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--bg-raise);
  opacity: 0;
  transition: opacity 0.3s var(--ease);
}

/* With no hairline above, the plate of the first row reaches up into the gap. */
.work-list:not(.work-list--ruled) .work-list__item:first-child .row::before {
  top: -20px;
}

/* Everything slides in from the plate's edge on hover; the title goes a little further. */
.row > * {
  transition:
    transform 0.4s var(--ease),
    color 0.3s var(--ease);
}

.row__idx {
  grid-column: 1 / span 3;
  grid-row: 1;
  /* Drops the mono label's cap line onto the title's cap line:
     title cap-top = 0.145em (Instrument Serif at 1.05 line height),
     label cap-top = 0.38em of 0.72rem (JetBrains Mono at 1.5 line height). */
  margin-top: calc(var(--title) * 0.145 - 0.274rem);
  color: var(--fg-muted);
}

.row__title {
  grid-column: 4 / -1;
  grid-row: 1;
  justify-self: start;
  max-width: 100%;
  font-family: var(--font-serif);
  font-size: var(--title);
  line-height: 1.05;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.row__side {
  grid-column: 10 / -1;
  grid-row: 1;
  justify-self: end;
  display: flex;
  align-items: flex-start;
  gap: clamp(16px, 2vw, 28px);
  /* Same cap-line drop as the index, so the label sits on the title's cap line. */
  margin-top: calc(var(--title) * 0.145 - 0.274rem);
}

.row__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  text-align: right;
}

.row__kind {
  color: var(--fg);
}

.row__year {
  color: var(--fg-muted);
}

.row__arrow {
  flex: none;
  /* About one label line tall, so it centres on the kind label. */
  font-size: 1.08rem;
  color: var(--fg-muted);
  transition:
    transform 0.4s var(--ease),
    color 0.3s var(--ease);
}

.row__summary {
  grid-column: 4 / span 7;
  grid-row: 2;
  max-width: 52ch;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.55;
  color: var(--fg-muted);
}

/* Hover-capable desktop: the summary stops at col 7 so the preview has room. */
@media (min-width: 1280px) and (hover: hover) and (pointer: fine) {
  .row__summary {
    grid-column: 4 / span 4;
  }
}

/* Hover and keyboard focus share one state. */
.row:is(:hover, :focus-visible)::before {
  opacity: 1;
}

.row:is(:hover, :focus-visible) > * {
  transform: translateX(14px);
}

.row:is(:hover, :focus-visible) .row__title {
  transform: translateX(22px);
}

/* The right-hand meta slides in from the plate's right edge, mirroring the left. */
.row:is(:hover, :focus-visible) .row__side {
  transform: translateX(-14px);
}

.row:is(:hover, :focus-visible) .row__idx {
  color: var(--accent);
}

.row:is(:hover, :focus-visible) .row__arrow {
  transform: translateX(4px);
  color: var(--fg);
}

.row:focus-visible {
  outline-offset: -1px;
}

/* Mobile: index and kind on one line, then title and arrow, then summary. */
@media (max-width: 759.98px) {
  .row {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 14px;
    align-items: baseline;
  }

  /* The side wrapper dissolves so meta and arrow take their own cells. */
  .row__side {
    display: contents;
  }

  .row__idx,
  .row__meta,
  .row__title,
  .row__summary {
    margin-top: 0;
  }

  .row__idx {
    grid-column: 1;
    grid-row: 1;
  }

  .row__meta {
    grid-column: 2;
    grid-row: 1;
    flex-direction: row;
    align-items: baseline;
    gap: 14px;
  }

  .row__title {
    grid-column: 1;
    grid-row: 2;
  }

  .row__arrow {
    grid-column: 2;
    grid-row: 2;
    align-self: center;
    font-size: 1.25rem;
  }

  .row__summary {
    grid-column: 1 / -1;
    grid-row: 3;
  }
}

/* ------------------------------------------------------------- preview */
.preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 60;
  pointer-events: none;
  will-change: transform;
}

.preview__card {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg-raise);
  border: 1px solid var(--line-strong);
  opacity: 0;
  transform: scale(0.96);
  transition:
    opacity 0.25s var(--ease),
    transform 0.4s var(--ease);
}

.preview__card.is-on {
  opacity: 1;
  transform: none;
}

/* The schematic fills the panel edge to edge (both are 4:3). */
.preview__glyph {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  opacity: 0;
  transition: opacity 0.3s var(--ease);
}

.preview__glyph.is-active {
  opacity: 1;
}

/* Lift the drawing out of its half-tone so it reads at thumbnail size;
   the accent element, masks and faint guides keep their own values. */
.preview__glyph :deep(:is(path, rect, circle):not(.hot, .faint, .mask, .hot-fill, .hot-solid)) {
  opacity: 0.9;
}

.preview__glyph :deep(text) {
  opacity: 0.65;
}
</style>
