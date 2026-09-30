// Serves dist/ the way GitHub Pages does: /route -> /route/index.html, unknown paths -> 404.html (status 404).
import { join, resolve, sep } from 'node:path'

const root = resolve(import.meta.dir, '..', 'dist')
const port = Number(process.env.PORT) || 8888

async function find (pathname) {
  const target = resolve(root, '.' + decodeURIComponent(pathname))
  if (target !== root && !target.startsWith(root + sep)) return undefined
  for (const candidate of [target, join(target, 'index.html')]) {
    const file = Bun.file(candidate)
    if (await file.exists() && file.size > 0) return file
  }
  return undefined
}

const server = Bun.serve({
  port,
  async fetch (req) {
    const file = await find(new URL(req.url).pathname)
    if (file) return new Response(file)
    return new Response(Bun.file(join(root, '404.html')), { status: 404 })
  },
})

console.log(`Serving dist/ at ${server.url}`)
