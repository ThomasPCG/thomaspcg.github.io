<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'

// Hero visual: a circuit-like dataflow lattice. Nodes sit on a square grid
// whose tracks are nudged by a few percent (so spacing is uneven but every
// orthogonal edge stays exactly axis-aligned); a few edges run at exactly 45
// degrees, and only on a sparse set of diagonals. Small packets travel node to
// node; accent packets emit a ring pulse on arrival. The pointer gently pushes
// nearby nodes away and lights them up.

interface RGB { r: number, g: number, b: number }
interface Edge { a: Node, b: Node }
interface Node {
  bx: number, by: number // rest position
  x: number, y: number // drawn position
  ox: number, oy: number // spring offset
  vx: number, vy: number // spring velocity
  glow: number
  adj: Edge[]
}
interface Packet {
  edge: Edge
  from: Node
  to: Node
  prev: Node | null
  t: number
  dur: number
  wait: number
  accent: boolean
}
interface Pulse { active: boolean, node: Node | null, age: number }

const FG_FALLBACK: RGB = { r: 0xec, g: 0xe7, b: 0xdd }
const ACCENT_FALLBACK: RGB = { r: 0xff, g: 0x5b, b: 0x2e }

const SPACING = 84
const JITTER = 0.08 // track offset, as a fraction of SPACING (max 10%)
const PERIOD = 4 // jitter repeats every PERIOD tracks, which keeps diagonals at exactly 45 degrees
const KEEP_ORTHO = 0.72
const KEEP_DIAG = 0.6
const MOUSE_RADIUS = 180
const MOUSE_PUSH = 10
const SPRING_K = 70
const SPRING_C = 2 * Math.sqrt(SPRING_K) * 0.85
const TRAIL_SEGMENTS = 5
const NODE_LEVELS = 12
const PULSE_LEVELS = 24
const NODE_R = 2
const PULSE_DURATION = 1.4
const PULSE_MAX_ALPHA = 0.8
const PULSE_REACH = 46
const TAU = Math.PI * 2

const rootEl = ref<HTMLDivElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

let ctx!: CanvasRenderingContext2D
let cssW = 0
let cssH = 0
let curDpr = 0

let nodes: Node[] = []
let edges: Edge[] = []
let packets: Packet[] = []
const pulses: Pulse[] = Array.from({ length: 16 }, () => ({ active: false, node: null, age: 0 }))

// Precomputed rgba strings, so nothing is built per frame.
let edgeStyle = ''
let nodeStyle = ''
let headFg = ''
let headAccent = ''
let nodeLevels: string[] = []
let trailFg: string[] = []
let trailAccent: string[] = []
let pulseLevels: string[] = []

let raf = 0
let last = 0
let inView = true
let tabVisible = true
let reduced = false
let fine = false

let pointerIn = false
let pcx = 0
let pcy = 0
let rectL = 0
let rectT = 0
let rectAt = -1e9
let rectDirty = true
let mx = 0
let my = 0
let mInfl = 0

const cleanups: Array<() => void> = []

function rgba(c: RGB, a: number): string {
  return `rgba(${c.r},${c.g},${c.b},${a})`
}

function parseColor(raw: string, fallback: RGB): RGB {
  const s = raw.trim().toLowerCase()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s)
  if (hex && hex[1]) {
    let h = hex[1]
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('')
    const n = parseInt(h.slice(0, 6), 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const fn = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/.exec(s)
  if (fn) {
    return {
      r: Math.round(Number(fn[1] ?? 0)),
      g: Math.round(Number(fn[2] ?? 0)),
      b: Math.round(Number(fn[3] ?? 0)),
    }
  }
  return fallback
}

function at(list: readonly string[], i: number): string {
  return list[i] ?? list[0] ?? 'rgba(255,255,255,0.1)'
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function buildStyles(fg: RGB, accent: RGB) {
  edgeStyle = rgba(fg, 0.12)
  nodeStyle = rgba(fg, 0.4)
  headFg = rgba(fg, 0.85)
  headAccent = rgba(accent, 0.85)
  nodeLevels = []
  for (let i = 0; i < NODE_LEVELS; i++) {
    nodeLevels.push(rgba(fg, 0.4 + 0.42 * (i / (NODE_LEVELS - 1))))
  }
  trailFg = []
  trailAccent = []
  for (let i = 0; i < TRAIL_SEGMENTS; i++) {
    const a = 0.85 * (1 - i / TRAIL_SEGMENTS)
    trailFg.push(rgba(fg, a))
    trailAccent.push(rgba(accent, a))
  }
  pulseLevels = []
  for (let i = 0; i < PULSE_LEVELS; i++) {
    pulseLevels.push(rgba(accent, PULSE_MAX_ALPHA * (i / (PULSE_LEVELS - 1))))
  }
}

// Colours come from the page's --fg and --accent tokens, so they follow the theme.
function readColors() {
  const root = rootEl.value
  if (!root) return
  const cs = getComputedStyle(root)
  buildStyles(
    parseColor(cs.getPropertyValue('--fg'), FG_FALLBACK),
    parseColor(cs.getPropertyValue('--accent'), ACCENT_FALLBACK),
  )
}

// After the DOM has switched theme: re-read the tokens. A running loop picks the new
// styles up on its next frame; a paused one (reduced motion, off screen) needs a repaint.
watch(useTheme().name, () => {
  readColors()
  if (ctx && !raf) draw()
}, { flush: 'post' })

function connect(a: Node, b: Node) {
  const e: Edge = { a, b }
  edges.push(e)
  a.adj.push(e)
  b.adj.push(e)
}

function nextEdge(node: Node, cameFrom: Edge): Edge {
  const adj = node.adj
  const len = adj.length
  const r = Math.floor(Math.random() * len)
  let e = adj[r]
  if (e === cameFrom && len > 1) e = adj[(r + 1) % len]
  return e ?? cameFrom
}

function build() {
  const rand = mulberry32(0x5eed1e)
  nodes = []
  edges = []
  packets = []
  for (const p of pulses) {
    p.active = false
    p.node = null
  }

  // One offset table shared by columns and rows. Because it repeats every
  // PERIOD tracks, a diagonal between (i, j) and (i+1, j+1) has dx === dy
  // whenever i and j are congruent mod PERIOD, so those diagonals are exactly
  // 45 degrees. Orthogonal edges share a track coordinate and stay axis-aligned.
  const jit: number[] = []
  for (let k = 0; k < PERIOD; k++) jit.push(Math.round((rand() - 0.5) * 2 * JITTER * SPACING))
  const track = (k: number) => k * SPACING + (jit[((k % PERIOD) + PERIOD) % PERIOD] ?? 0)
  const mod = (k: number) => ((k % PERIOD) + PERIOD) % PERIOD

  // Origin sits off-canvas so nodes and edges run past the clip edge.
  // Integer tracks plus a half pixel keep 1px edges crisp at rest.
  const x0 = Math.round(-SPACING * (0.25 + rand() * 0.5)) + 0.5
  const y0 = Math.round(-SPACING * (0.25 + rand() * 0.5)) + 0.5
  const cols = Math.ceil((cssW - x0) / SPACING) + 1
  const rows = Math.ceil((cssH - y0) / SPACING) + 1

  const grid: Array<Node | undefined> = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const bx = x0 + track(i)
      const by = y0 + track(j)
      const n: Node = { bx, by, x: bx, y: by, ox: 0, oy: 0, vx: 0, vy: 0, glow: 0, adj: [] }
      grid.push(n)
      nodes.push(n)
    }
  }
  const cell = (i: number, j: number): Node | undefined =>
    i < 0 || j < 0 || i >= cols || j >= rows ? undefined : grid[j * cols + i]

  const diagRight: boolean[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const n = cell(i, j)
      if (!n) continue
      const right = cell(i + 1, j)
      const down = cell(i, j + 1)
      if (right && rand() < KEEP_ORTHO) connect(n, right)
      if (down && rand() < KEEP_ORTHO) connect(n, down)
      // Down-right diagonal, only on the eligible diagonals.
      const dr = cell(i + 1, j + 1)
      if (dr && mod(i - j) === 0 && rand() < KEEP_DIAG) {
        connect(n, dr)
        diagRight[j * cols + i] = true
      }
      // Down-left diagonal; skipped when the same cell already has the crossing one.
      const dl = cell(i - 1, j + 1)
      if (dl && mod(i - 1 - j) === 0 && !diagRight[j * cols + (i - 1)] && rand() < KEEP_DIAG) {
        connect(n, dl)
      }
    }
  }

  // Every node gets at least one edge.
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const n = cell(i, j)
      if (!n || n.adj.length > 0) continue
      const other = cell(i + 1, j) ?? cell(i - 1, j) ?? cell(i, j + 1) ?? cell(i, j - 1)
      if (other) connect(n, other)
    }
  }

  const count = Math.max(6, Math.round(nodes.length / 6))
  for (let k = 0; k < count; k++) {
    const from = nodes[Math.floor(Math.random() * nodes.length)]
    if (!from) continue
    const edge = from.adj[Math.floor(Math.random() * from.adj.length)]
    if (!edge) continue
    packets.push({
      edge,
      from,
      to: edge.a === from ? edge.b : edge.a,
      prev: null,
      t: 0.25 + Math.random() * 0.6,
      dur: 1.2 + Math.random() * 1.2,
      wait: 0,
      accent: k % 6 === 0,
    })
  }
}

function spawnPulse(n: Node) {
  let slot: Pulse | undefined
  for (const p of pulses) {
    if (!p.active) {
      slot = p
      break
    }
  }
  if (!slot) slot = pulses[0]
  if (!slot) return
  slot.active = true
  slot.node = n
  slot.age = 0
}

function advance(p: Packet) {
  const node = p.to
  if (p.accent) spawnPulse(node)
  const next = nextEdge(node, p.edge)
  p.prev = p.from
  p.from = node
  p.to = next.a === node ? next.b : next.a
  p.edge = next
  p.t = 0
  p.dur = 1.2 + Math.random() * 1.2
  p.wait = p.accent ? 0.25 : Math.random() * 0.3
}

function refreshRect(now: number) {
  const root = rootEl.value
  if (!root) return
  const r = root.getBoundingClientRect()
  rectL = r.left
  rectT = r.top
  rectAt = now
  rectDirty = false
}

function update(dt: number, now: number) {
  // Pointer: smoothed position and influence, so nothing snaps.
  if (fine) {
    if (pointerIn && (rectDirty || now - rectAt > 250)) refreshRect(now)
    const tx = pcx - rectL
    const ty = pcy - rectT
    if (pointerIn && mInfl < 0.01) {
      mx = tx
      my = ty
    } else {
      const k = 1 - Math.exp(-dt * 9)
      mx += (tx - mx) * k
      my += (ty - my) * k
    }
    mInfl += ((pointerIn ? 1 : 0) - mInfl) * (1 - Math.exp(-dt * 5))
  }

  const active = mInfl > 0.002
  const kGlow = 1 - Math.exp(-dt * 6)
  const r2 = MOUSE_RADIUS * MOUSE_RADIUS
  for (const n of nodes) {
    let tgx = 0
    let tgy = 0
    let tgl = 0
    if (active) {
      const dx = n.bx - mx
      const dy = n.by - my
      const d2 = dx * dx + dy * dy
      if (d2 < r2) {
        const d = Math.sqrt(d2) || 1
        const f = 1 - d / MOUSE_RADIUS
        const s = f * f * (3 - 2 * f) * mInfl
        tgl = s
        tgx = (dx / d) * MOUSE_PUSH * s
        tgy = (dy / d) * MOUSE_PUSH * s
      }
    }
    n.vx += ((tgx - n.ox) * SPRING_K - n.vx * SPRING_C) * dt
    n.vy += ((tgy - n.oy) * SPRING_K - n.vy * SPRING_C) * dt
    n.ox += n.vx * dt
    n.oy += n.vy * dt
    n.glow += (tgl - n.glow) * kGlow
    n.x = n.bx + n.ox
    n.y = n.by + n.oy
  }

  for (const p of packets) {
    if (p.wait > 0) {
      p.wait -= dt
      continue
    }
    p.t += dt / p.dur
    if (p.t >= 1) advance(p)
  }

  for (const p of pulses) {
    if (!p.active) continue
    p.age += dt
    if (p.age >= PULSE_DURATION) {
      p.active = false
      p.node = null
    }
  }
}

function draw() {
  const c = ctx
  c.clearRect(0, 0, cssW, cssH)
  c.lineCap = 'round'

  // Edges: one path, one stroke.
  c.lineWidth = 1
  c.strokeStyle = edgeStyle
  c.beginPath()
  for (const e of edges) {
    c.moveTo(e.a.x, e.a.y)
    c.lineTo(e.b.x, e.b.y)
  }
  c.stroke()

  // Resting nodes batched; lit nodes drawn individually.
  c.fillStyle = nodeStyle
  c.beginPath()
  for (const n of nodes) {
    if (n.glow >= 0.03) continue
    c.moveTo(n.x + NODE_R, n.y)
    c.arc(n.x, n.y, NODE_R, 0, TAU)
  }
  c.fill()
  for (const n of nodes) {
    if (n.glow < 0.03) continue
    const lvl = Math.min(NODE_LEVELS - 1, Math.round(n.glow * (NODE_LEVELS - 1)))
    c.fillStyle = at(nodeLevels, lvl)
    c.beginPath()
    c.arc(n.x, n.y, NODE_R, 0, TAU)
    c.fill()
  }

  // Pulses: a ring that expands and fades, with a dot at its origin.
  c.lineWidth = 1.25
  for (const p of pulses) {
    const n = p.node
    if (!p.active || !n) continue
    const q = Math.min(1, p.age / PULSE_DURATION)
    const fade = (1 - q) * (1 - q)
    const lvl = Math.round(fade * (PULSE_LEVELS - 1))
    const out = 1 - Math.pow(1 - q, 3)
    c.strokeStyle = at(pulseLevels, lvl)
    c.beginPath()
    c.arc(n.x, n.y, 4 + PULSE_REACH * out, 0, TAU)
    c.stroke()
    c.fillStyle = at(pulseLevels, lvl)
    c.beginPath()
    c.arc(n.x, n.y, 2.6, 0, TAU)
    c.fill()
  }

  // Packets: short trail following the path already travelled, then the head.
  const step = 1 / TRAIL_SEGMENTS
  for (const p of packets) {
    const fx = p.from.x
    const fy = p.from.y
    const dx = p.to.x - fx
    const dy = p.to.y - fy
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const ux = dx / len
    const uy = dy / len
    const e = easeInOutCubic(p.t)
    const hx = fx + dx * e
    const hy = fy + dy * e
    const traveled = e * len

    let pux = 0
    let puy = 0
    let plen = 0
    const prev = p.prev
    if (prev) {
      const qx = prev.x - fx
      const qy = prev.y - fy
      plen = Math.sqrt(qx * qx + qy * qy) || 1
      pux = qx / plen
      puy = qy / plen
    }

    // Trail is longest mid-flight, where the packet is fastest.
    const s = p.t < 0.5 ? 2 * p.t : 2 * (1 - p.t)
    const trailLen = (8 + 36 * s * s) * (p.accent ? 1.3 : 1)
    const styles = p.accent ? trailAccent : trailFg
    c.lineWidth = p.accent ? 2 : 1.5

    let ax = hx
    let ay = hy
    for (let k = 1; k <= TRAIL_SEGMENTS; k++) {
      const d = k * step * trailLen
      let sx: number
      let sy: number
      if (d <= traveled) {
        sx = hx - ux * d
        sy = hy - uy * d
      } else {
        const r = Math.min(d - traveled, plen)
        sx = fx + pux * r
        sy = fy + puy * r
      }
      c.strokeStyle = at(styles, k - 1)
      c.beginPath()
      c.moveTo(ax, ay)
      c.lineTo(sx, sy)
      c.stroke()
      ax = sx
      ay = sy
    }

    c.fillStyle = p.accent ? headAccent : headFg
    c.beginPath()
    c.arc(hx, hy, p.accent ? 3 : 2, 0, TAU)
    c.fill()
  }
}

function frame(now: number) {
  raf = 0
  if (!inView || !tabVisible || reduced) return
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  update(dt, now)
  draw()
  raf = requestAnimationFrame(frame)
}

function sync() {
  const should = inView && tabVisible && !reduced
  if (should && !raf) {
    last = performance.now()
    raf = requestAnimationFrame(frame)
  } else if (!should && raf) {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

function resize() {
  const root = rootEl.value
  const cv = canvasEl.value
  if (!root || !cv) return
  const w = Math.round(root.clientWidth)
  const h = Math.round(root.clientHeight)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (w < 1 || h < 1) return
  if (w === cssW && h === cssH && dpr === curDpr) return
  cssW = w
  cssH = h
  curDpr = dpr
  cv.width = Math.round(w * dpr)
  cv.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  rectDirty = true
  build()
  if (!raf) draw()
}

onMounted(() => {
  const root = rootEl.value
  const cv = canvasEl.value
  if (!root || !cv) return
  const c = cv.getContext('2d')
  if (!c) return
  ctx = c

  readColors()

  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const fineMq = window.matchMedia('(pointer: fine)')
  reduced = reducedMq.matches
  fine = fineMq.matches
  tabVisible = !document.hidden

  const onReduced = () => {
    reduced = reducedMq.matches
    if (reduced) {
      sync()
      draw()
    } else {
      sync()
    }
  }
  const onFine = () => {
    fine = fineMq.matches
    if (!fine) pointerIn = false
  }
  reducedMq.addEventListener('change', onReduced)
  fineMq.addEventListener('change', onFine)
  cleanups.push(
    () => reducedMq.removeEventListener('change', onReduced),
    () => fineMq.removeEventListener('change', onFine),
  )

  const onMove = (e: PointerEvent) => {
    if (!fine || e.pointerType === 'touch') return
    pcx = e.clientX
    pcy = e.clientY
    pointerIn = true
  }
  const onLeave = () => { pointerIn = false }
  const onScroll = () => { rectDirty = true }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('blur', onLeave)
  window.addEventListener('scroll', onScroll, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  cleanups.push(
    () => window.removeEventListener('pointermove', onMove),
    () => window.removeEventListener('blur', onLeave),
    () => window.removeEventListener('scroll', onScroll),
    () => document.documentElement.removeEventListener('pointerleave', onLeave),
  )

  const onVisibility = () => {
    tabVisible = !document.hidden
    sync()
  }
  document.addEventListener('visibilitychange', onVisibility)
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility))

  const io = new IntersectionObserver((entries) => {
    const entry = entries[entries.length - 1]
    if (!entry) return
    inView = entry.isIntersecting
    sync()
  })
  io.observe(root)
  cleanups.push(() => io.disconnect())

  const ro = new ResizeObserver(() => {
    rectDirty = true
    resize()
  })
  ro.observe(root)
  cleanups.push(() => ro.disconnect())

  resize()
  sync()
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  for (const fn of cleanups) fn()
  cleanups.length = 0
})
</script>

<template>
  <div ref="rootEl" class="system-canvas" aria-hidden="true">
    <canvas ref="canvasEl" />
  </div>
</template>

<style scoped>
.system-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.system-canvas canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
</style>
