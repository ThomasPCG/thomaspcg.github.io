<script setup lang="ts">
  /**
   * Deterministic technical schematic for a project. Thin strokes at .7 opacity,
   * exactly one accent element per drawing, no crop marks: the drawing itself is
   * the frame, and it runs edge to edge inside an even margin.
   *
   * `ratio` picks the sheet the drawing is laid out on, so it fills its container
   * instead of letterboxing:
   *   card  400 x 250  (16:10)  previews and the front-page figure
   *   wide  700 x 300  (21:9)   the case-study figure on desktop
   *   tall  400 x 300  (4:3)    the case-study figure on phones
   * The geometry is generated from `seed` (mulberry32), so the same project
   * always draws the same diagram.
   */
  import { computed } from 'vue'
  import type { GlyphKind } from '@/data/content'

  const SHEETS = {
    card: { w: 400, h: 250, m: 26, fs: 9 },
    wide: { w: 700, h: 300, m: 30, fs: 7 },
    tall: { w: 400, h: 300, m: 26, fs: 10.5 },
  } as const

  type Ratio = keyof typeof SHEETS

  const props = withDefaults(defineProps<{ kind: GlyphKind, seed?: string, ratio?: Ratio }>(), {
    seed: '',
    ratio: 'card',
  })

  /** The sheet with its drawing area: X0..X1 by Y0..Y1 is the even margin inset. */
  interface Sheet {
    ratio: Ratio
    w: number
    h: number
    fs: number
    X0: number
    X1: number
    Y0: number
    Y1: number
  }

  interface Prim {
    tag: 'path' | 'rect' | 'circle' | 'text'
    attrs: Record<string, string | number>
    cls: string
    text?: string
  }

  type Rand = () => number

  function hash (input: string) {
    let h = 1779033703 ^ input.length
    for (let i = 0; i < input.length; i++) {
      h = Math.imul(h ^ input.charCodeAt(i), 3432918353)
      h = (h << 13) | (h >>> 19)
    }
    return h >>> 0
  }

  function mulberry32 (seed: number): Rand {
    let a = seed
    return () => {
      a = (a + 0x6D2B79F5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const r1 = (n: number) => Math.round(n * 10) / 10

  /** Collects drawing primitives. Class names map to the styles below. */
  function pen () {
    const prims: Prim[] = []
    return {
      prims,
      path: (d: string, cls = '') => prims.push({ tag: 'path', attrs: { d }, cls }),
      rect: (x: number, y: number, width: number, height: number, cls = '') =>
        prims.push({ tag: 'rect', attrs: { x: r1(x), y: r1(y), width: r1(width), height: r1(height) }, cls }),
      circle: (cx: number, cy: number, r: number, cls = '') =>
        prims.push({ tag: 'circle', attrs: { cx: r1(cx), cy: r1(cy), r }, cls }),
      text: (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'start') =>
        prims.push({ tag: 'text', attrs: { x: r1(x), y: r1(y), 'text-anchor': anchor }, cls: '', text }),
    }
  }

  type Pen = ReturnType<typeof pen>

  // ---------------------------------------------------------------- ledger
  // Two columns of rows. Matching rows are joined; one is left open (accent).
  function ledger (p: Pen, rand: Rand, { X0, X1, Y0, Y1, ratio }: Sheet) {
    const cw = Math.round((X1 - X0) * (ratio === 'wide' ? 0.3 : 0.36))
    const L = X0
    const R = X1 - cw
    const mx = (L + cw + R) / 2
    const rows = ratio === 'tall' ? 10 : ratio === 'wide' ? 9 : 8
    const top = Y0 + 26
    const end = Y1 - 16
    const gap = 6
    const pitch = (end - top + gap) / rows
    const H = pitch - gap
    const rowY = (i: number) => top + i * pitch
    const unmatched = 2 + Math.floor(rand() * (rows - 5))

    // Two adjacent pairs cross over, like a reordered settlement file.
    const starts = Array.from({ length: rows - 1 }, (_, i) => i).filter(a => a !== unmatched && a + 1 !== unmatched)
    const a = starts[Math.floor(rand() * starts.length)]!
    const others = starts.filter(b => Math.abs(b - a) > 1)
    const swaps = others.length > 0 ? [a, others[Math.floor(rand() * others.length)]!] : [a]
    const target = (i: number) => (swaps.includes(i) ? i + 1 : swaps.includes(i - 1) ? i - 1 : i)

    p.text(L, Y0 + 7, 'BANK FILE')
    p.text(R, Y0 + 7, 'LEDGER')
    p.path(`M${L} ${Y0 + 14}h${cw}M${R} ${Y0 + 14}h${cw}`, 'faint')

    const cells = (x: number, y: number, cls = '') => {
      const mid = y + H / 2
      const id = cw * (0.14 + rand() * 0.16)
      const amount = cw * (0.16 + rand() * 0.14)
      p.path(`M${r1(x + 8)} ${r1(mid)}h${r1(id)}M${r1(x + cw - 8 - amount)} ${r1(mid)}h${r1(amount)}`, cls)
    }

    for (let i = 0; i < rows; i++) {
      const y = rowY(i)
      p.rect(L, y, cw, H, i === unmatched ? 'hot' : '')
      cells(L, y, i === unmatched ? 'hot' : '')
      if (i === unmatched) {
        p.rect(R, y, cw, H, 'hot dash')
      } else {
        p.rect(R, y, cw, H)
        cells(R, y)
      }
    }

    for (let i = 0; i < rows; i++) {
      const yl = r1(rowY(i) + H / 2)
      if (i === unmatched) {
        p.path(`M${L + cw} ${yl}H${r1(mx + 6)}`, 'hot dash')
        p.path(`M${r1(mx + 10)} ${r1(yl - 5)}V${r1(yl + 5)}`, 'hot')
        p.circle(L + cw, yl, 4, 'mask')
        p.circle(L + cw, yl, 2, 'hot')
        continue
      }
      const yr = r1(rowY(target(i)) + H / 2)
      p.path(yl === yr
        ? `M${L + cw} ${yl}H${R}`
        : `M${L + cw} ${yl}H${r1(mx - 12)}L${r1(mx + 12)} ${yr}H${R}`)
      for (const [x, y] of [[L + cw, yl], [R, yr]] as const) {
        p.circle(x, y, 4, 'mask')
        p.circle(x, y, 2)
      }
    }

    // Column totals: an amount and an accountant's double rule.
    for (const x of [L, R]) {
      p.path(`M${x} ${end + 6}h${cw}`, 'faint')
      p.text(x, Y1, 'TOTAL')
      p.path(`M${x + cw - 46} ${Y1 - 8}h46`)
      p.path(`M${x + cw - 46} ${Y1 - 3}h46M${x + cw - 46} ${Y1}h46`, 'faint')
    }
  }

  // ----------------------------------------------------------------- tiers
  // Twelve progressive brackets as a staircase, one bracket measured in accent.
  function tiers (p: Pen, rand: Rand, { X0, X1, Y0, Y1 }: Sheet) {
    const n = 12
    const ax = X0 + 3
    const x0 = ax + 12
    const step = (X1 - x0) / n
    const X = (i: number) => r1(x0 + i * step)
    const base = Y1 - 14
    const avail = base - Y0
    const heights = Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1)
      const jitter = i === n - 1 ? 0 : (rand() - 0.5) * avail * 0.03
      return r1(avail * (0.06 + 0.94 * Math.pow(t, 1.5)) + jitter)
    })
    const hot = 3 + Math.floor(rand() * 5)
    const topOf = (i: number) => r1(base - heights[i]!)

    // Gridlines and the y axis
    for (let g = 1; g <= 4; g++) {
      p.path(`M${ax} ${r1(base - (g * avail) / 4)}H${X1}`, 'faint dots')
    }
    p.path(`M${ax} ${base}V${Y0}`)
    for (let g = 0; g <= 4; g++) {
      p.path(`M${ax} ${r1(base - (g * avail) / 4)}h4`, 'faint')
    }
    p.text(ax + 8, Y0 + 7, 'RATE')
    p.text(X1, Y1, 'INCOME', 'end')

    // Bars are knocked out of the grid, then outlined as one stair.
    for (let i = 0; i < n; i++) {
      p.rect(X(i), topOf(i), step, heights[i]!, 'mask')
    }
    let stair = `M${X(0)} ${base}V${topOf(0)}`
    for (let i = 1; i < n; i++) {
      stair += `H${X(i)}V${topOf(i)}`
    }
    p.path(`${stair}H${X(n)}V${base}`)
    for (let i = 1; i < n; i++) {
      p.path(`M${X(i)} ${base}V${topOf(i - 1)}`, 'faint')
    }

    // Baseline with a tick at every threshold
    p.path(`M${ax} ${base}H${X1}`)
    for (let i = 0; i <= n; i++) {
      p.path(`M${X(i)} ${base}v5`)
    }

    // The bracket under measurement
    const y = topOf(hot)
    const mid = r1(X(hot) + step / 2)
    p.rect(X(hot), y, step, heights[hot]!, 'hot-fill')
    p.path(`M${X(hot)} ${y}H${X(hot + 1)}`, 'hot heavy')
    p.path(`M${r1(X(hot) + 3)} ${y - 8}V${y - 13}H${r1(X(hot + 1) - 3)}V${y - 8}M${mid} ${y - 13}V${y - 18}`, 'hot')
    p.path(`M${ax} ${y}H${X(hot)}`, 'hot dash')
    p.rect(ax - 3, y - 3, 6, 6, 'hot-solid')
  }

  // ----------------------------------------------------------------- graph
  // A layered job graph; one route through it is traced in accent.
  const LAYERS: Record<Ratio, number[]> = {
    card: [1, 3, 4, 3, 1],
    wide: [1, 3, 4, 5, 4, 3, 1],
    tall: [1, 3, 5, 4, 1],
  }

  function graph (p: Pen, rand: Rand, { X0, X1, Y0, Y1, ratio }: Sheet) {
    const counts = LAYERS[ratio]
    const nw = ratio === 'wide' ? 34 : 26
    const nh = ratio === 'wide' ? 16 : 14
    const xs = counts.map((_, l) => r1(X0 + nw / 2 + (l * (X1 - X0 - nw)) / (counts.length - 1)))
    const bandTop = Y0 + 22 + nh / 2
    const bandBottom = Y1 - 12 - nh / 2
    const pitch = (bandBottom - bandTop) / (Math.max(...counts) - 1)
    const mid = (bandTop + bandBottom) / 2

    const nodes = counts.map((count, l) =>
      Array.from({ length: count }, (_, j) => ({
        x: xs[l]!,
        y: r1(mid + (j - (count - 1) / 2) * pitch + (count > 1 ? (rand() - 0.5) * pitch * 0.14 : 0)),
      })),
    )

    const edges: Array<[number, number, number]> = []
    const link = (l: number, a: number, b: number) => {
      if (!edges.some(e => e[0] === l && e[1] === a && e[2] === b)) {
        edges.push([l, a, b])
      }
    }
    for (let l = 0; l < counts.length - 1; l++) {
      const next = counts[l + 1]!
      for (let a = 0; a < counts[l]!; a++) {
        if (counts[l] === 1) {
          for (let b = 0; b < next; b++) link(l, a, b)
          continue
        }
        const near = Math.round(((a + 0.5) / counts[l]!) * next - 0.5 + (rand() - 0.5))
        const t = Math.min(next - 1, Math.max(0, near))
        link(l, a, t)
        if (rand() < 0.5) {
          link(l, a, Math.min(next - 1, Math.max(0, t + (rand() < 0.5 ? -1 : 1))))
        }
      }
      for (let b = 0; b < next; b++) {
        if (!edges.some(e => e[0] === l && e[2] === b)) {
          link(l, Math.min(counts[l]! - 1, Math.round((b / next) * counts[l]!)), b)
        }
      }
    }

    // Trace one route from the first layer to the last.
    const route: Array<[number, number, number]> = []
    const onRoute = new Set<string>(['0-0'])
    let at = 0
    for (let l = 0; l < counts.length - 1; l++) {
      const outs = edges.filter(e => e[0] === l && e[1] === at)
      const pick = outs[Math.floor(rand() * outs.length)]!
      route.push(pick)
      at = pick[2]
      onRoute.add(`${l + 1}-${at}`)
    }
    const failed = route[1]![2]

    // Layer guides, a time axis along the bottom, and the two end labels.
    p.text(X0, Y0 + 7, 'INGEST')
    p.text(X1, Y0 + 7, 'REPORT', 'end')
    p.path(`M${X0} ${Y1}H${X1}`, 'faint')
    for (const x of xs) {
      p.path(`M${x} ${Y0 + 16}V${Y1}`, 'faint dash')
      p.path(`M${x} ${Y1}v-5`)
    }

    const curve = ([l, a, b]: [number, number, number]) => {
      const from = nodes[l]![a]!
      const to = nodes[l + 1]![b]!
      const x1 = from.x + nw / 2
      const x2 = to.x - nw / 2
      const k = (x2 - x1) / 2
      return `M${r1(x1)} ${from.y}C${r1(x1 + k)} ${from.y} ${r1(x2 - k)} ${to.y} ${r1(x2)} ${to.y}`
    }
    for (const e of edges) {
      if (!route.includes(e)) p.path(curve(e))
    }
    for (const e of route) {
      p.path(curve(e), 'hot heavy')
    }

    nodes.forEach((layer, l) => {
      layer.forEach(({ x, y }, j) => {
        const hot = onRoute.has(`${l}-${j}`) ? 'hot' : ''
        const len = nw * (0.3 + rand() * 0.28)
        p.rect(x - nw / 2, y - nh / 2, nw, nh, 'mask')
        if (l === 2 && j === failed) p.rect(x - nw / 2, y - nh / 2, nw, nh, 'hot-fill')
        p.rect(x - nw / 2, y - nh / 2, nw, nh, hot)
        p.path(`M${r1(x - nw / 2 + 6)} ${y}h${r1(len)}`, hot)
        for (const px of [x - nw / 2, x + nw / 2]) {
          p.circle(px, y, 3, 'mask')
          p.circle(px, y, 1.5, hot)
        }
      })
    })
  }

  // ------------------------------------------------------------------ form
  // Stacked fields, each with a sync status. The field being edited syncs (accent).
  // The wide sheet adds the sync queue beside the form, one row per field.
  function form (p: Pen, rand: Rand, { X0, X1, Y0, Y1, ratio }: Sheet) {
    const wide = ratio === 'wide'
    const fa = wide ? Math.round((X1 - X0) * 0.5) : X1 - X0
    const sw = 26
    const S = X0 + fa - sw
    const W = S - 14 - X0
    const top = Y0 + 22
    const bottom = Y1 - 34
    const pitch = (bottom - top) / 4
    const fh = pitch - 16

    p.text(X0, Y0 + 7, 'PLANT ROOM 2')
    p.text(X0 + fa, Y0 + 7, 'OFFLINE', 'end')
    p.path(`M${X0} ${Y0 + 14}h${fa}`, 'faint')

    for (let i = 0; i < 4; i++) {
      const y = top + i * pitch
      const mid = r1(y + 10 + fh / 2)
      p.path(`M${X0} ${r1(y + 3)}h${22 + Math.floor(rand() * 34)}`, 'faint')
      p.rect(X0, y + 10, W, fh)
      p.path(`M${X0 + W} ${mid}H${S}`, 'faint')
      p.rect(S, y + 10, sw, fh, i === 3 ? 'faint dash' : '')

      if (i < 2) {
        p.path(`M${X0 + 10} ${mid}h${r1(W * (0.3 + rand() * 0.3))}`)
        p.path(`M${S + 8} ${mid}l4 4 9-9`)
      } else if (i === 2) {
        const len = W * (0.14 + rand() * 0.1)
        p.rect(X0 - 3, y + 7, W + 6, fh + 6, 'faint dash')
        p.path(`M${X0 + 10} ${mid}h${r1(len)}M${r1(X0 + 15 + len)} ${mid - 6}v12`)
        sync(p, S + sw / 2, mid)
      } else {
        p.path(`M${X0 + 10} ${mid}h48`, 'faint dots')
        p.path(`M${S + 9} ${mid}h8`, 'faint')
      }
    }

    p.text(X0, Y1 - 8, '1 PENDING')
    p.rect(X0 + fa - 76, Y1 - 22, 76, 22)
    p.path(`M${X0 + fa - 60} ${Y1 - 11}h44`)

    if (!wide) return

    // Sync queue: a row per field, joined to its status box by a dotted leader.
    const QX = X0 + fa + 60
    const QW = X1 - QX
    p.text(QX, Y0 + 7, 'SYNC QUEUE')
    p.text(X1, Y0 + 7, 'RETRY 4S', 'end')
    p.path(`M${QX} ${Y0 + 14}h${QW}`, 'faint')
    for (let i = 0; i < 4; i++) {
      const y = top + i * pitch + 10
      const mid = r1(y + fh / 2)
      p.path(`M${S + sw} ${mid}H${QX}`, 'faint dots')
      p.rect(QX, y, QW, fh, i === 3 ? 'faint dash' : '')
      if (i < 2) p.path(`M${QX + 9} ${mid}l4 4 9-9`)
      else p.circle(QX + 15, mid, 5, 'faint dash')
      p.path(`M${QX + 34} ${mid - 4}h${r1(QW * (0.22 + rand() * 0.2))}`, i > 1 ? 'faint' : '')
      p.path(`M${QX + 34} ${mid + 4}h${r1(QW * (0.12 + rand() * 0.14))}`, 'faint')
      p.path(`M${X1 - 14 - 34} ${mid}h34`, 'faint')
    }
  }

  /** Two chasing arcs, the universal "syncing" mark. */
  function sync (p: Pen, cx: number, cy: number) {
    const r = 5.5
    const at = (deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)] as const
    for (const [from, to] of [[190, 330], [10, 150]] as const) {
      const [sx, sy] = at(from)
      const [ex, ey] = at(to)
      // Arrowhead: two short strokes swept back from the tip along the tangent.
      const back = ((to + 90) * Math.PI) / 180 + Math.PI
      const head = [0.5, -0.5].map(s => `${r1(ex + 3.4 * Math.cos(back + s))} ${r1(ey + 3.4 * Math.sin(back + s))}`)
      p.path(`M${r1(sx)} ${r1(sy)}A${r} ${r} 0 0 1 ${r1(ex)} ${r1(ey)}M${head[0]}L${r1(ex)} ${r1(ey)}L${head[1]}`, 'hot')
    }
  }

  // ----------------------------------------------------------------- notes
  // Greeked text boxes on ruled lines; the caret is the accent. The wide sheet
  // adds a sidebar listing the notes.
  function notes (p: Pen, rand: Rand, { X0, X1, Y0, Y1, ratio }: Sheet) {
    const wide = ratio === 'wide'
    const sb = 150
    const EL = wide ? X0 + sb + 34 : X0
    const TX = EL + 28

    if (wide) {
      const n = 5
      const first = Y0 + 26
      const pitch = (Y1 - first + 8) / n
      p.text(X0, Y0 + 7, 'NOTES')
      p.path(`M${X0} ${Y0 + 14}h${sb}`, 'faint')
      for (let i = 0; i < n; i++) {
        const y = first + i * pitch
        if (i === 1) p.rect(X0, y, sb, pitch - 8)
        p.path(`M${X0 + 10} ${r1(y + 12)}h${r1(54 + rand() * 50)}`)
        p.path(`M${X0 + 10} ${r1(y + 24)}h${r1(sb - 34 - rand() * 30)}`, 'faint')
      }
      p.path(`M${X0 + sb + 17} ${Y0}V${Y1}`, 'faint')
    }

    // Toolbar
    for (let i = 0; i < 3; i++) p.rect(EL + i * 16, Y0 + 1, 10, 10)
    p.path(`M${EL + 54} ${Y0}v12`, 'faint')
    p.rect(EL + 62, Y0 + 1, 34, 10, 'faint')
    p.path(`M${EL} ${Y0 + 20}H${X1}`, 'faint')
    p.path(`M${EL + 14} ${Y0 + 28}V${Y1}`, 'faint')

    const words = (rule: number, height: number, width: number) => {
      let x = TX
      const end = TX + width
      while (end - x > 8) {
        const w = Math.min(end - x, 14 + rand() * 34)
        p.rect(x, rule - height - 4, w, height)
        x += w + 6
      }
      return x - 6
    }

    const rows = ratio === 'tall' ? 9 : wide ? 8 : 7
    const first = Y0 + 46
    const pitch = (Y1 - first) / (rows - 1)
    const full = X1 - TX
    const caretRow = rows - 3
    let caret = TX
    for (let i = 0; i < rows; i++) {
      const rule = r1(first + i * pitch)
      p.path(`M${EL + 14} ${rule}H${X1}`, 'faint')
      p.path(`M${EL} ${rule - 4}h6`, 'faint')
      if (i === 0) words(rule, 11, full * (0.4 + rand() * 0.12))
      else if (i < caretRow) words(rule, 6, full * (0.86 - rand() * 0.14))
      else if (i === caretRow) caret = words(rule, 6, full * (0.26 + rand() * 0.2))
    }
    p.path(`M${r1(caret + 5)} ${r1(first + caretRow * pitch - 18)}V${r1(first + caretRow * pitch - 2)}`, 'hot heavy')
  }

  const drawings = { ledger, tiers, graph, form, notes }

  const sheet = computed<Sheet>(() => {
    const { w, h, m, fs } = SHEETS[props.ratio]
    return { ratio: props.ratio, w, h, fs, X0: m, X1: w - m, Y0: m, Y1: h - m }
  })

  const prims = computed(() => {
    const p = pen()
    drawings[props.kind](p, mulberry32(hash(`${props.kind}:${props.seed}`)), sheet.value)
    return p.prims
  })
</script>

<template>
  <svg
    aria-hidden="true"
    class="glyph"
    focusable="false"
    preserveAspectRatio="xMidYMid meet"
    :style="{ '--fs': `${sheet.fs}px` }"
    :viewBox="`0 0 ${sheet.w} ${sheet.h}`"
  >
    <component
      :is="prim.tag"
      v-for="(prim, i) in prims"
      :key="i"
      v-bind="prim.attrs"
      :class="prim.cls || undefined"
    >{{ prim.text }}</component>
  </svg>
</template>

<style scoped>
.glyph {
  display: block;
  width: 100%;
  height: 100%;
}

/* Strokes stay a constant width at any size, so the drawing reads as a fine
   technical line in a 364px preview and on a 1250px figure alike. */
.glyph :is(path, rect, circle) {
  fill: none;
  stroke: var(--fg);
  stroke-width: 1.25;
  stroke-linecap: butt;
  stroke-linejoin: miter;
  vector-effect: non-scaling-stroke;
  opacity: 0.7;
}

.glyph text {
  fill: var(--fg);
  font-family: var(--font-mono);
  font-size: var(--fs, 9px);
  letter-spacing: 0.14em;
  opacity: 0.6;
}

.glyph .faint {
  opacity: 0.3;
}

.glyph .dash {
  stroke-dasharray: 3 3;
}

.glyph .dots {
  stroke-dasharray: 1 4;
}

/* Knock-out fill so lines pass behind boxes and ports. */
.glyph .mask {
  fill: var(--bg-raise);
  stroke: none;
  opacity: 1;
}

/* The single accent element of each drawing */
.glyph .hot {
  stroke: var(--accent);
  opacity: 1;
}

.glyph .heavy {
  stroke-width: 2.25;
}

.glyph .hot-fill {
  fill: var(--accent-soft);
  stroke: none;
  opacity: 1;
}

.glyph .hot-solid {
  fill: var(--accent);
  stroke: none;
  opacity: 1;
}
</style>
