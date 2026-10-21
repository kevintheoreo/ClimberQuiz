// Renders reel.js frame by frame in headless Chromium and muxes it with the
// synthesized soundtrack into an Instagram-ready 1080x1920 H.264 MP4.
//
//   python3 reel/music.py            # -> reel/out/music.wav
//   node reel/render.mjs             # -> reel/out/climbertype-stats-reel.mp4
//   node reel/render.mjs 22.3 25     # -> stills at those times, for checking
import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { spawn, execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const reelDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(reelDir, '..')
const outDir = path.join(reelDir, 'out')
const FPS = 30
const DURATION = 36

function loadPlaywright() {
  const require = createRequire(import.meta.url)
  try {
    return require('playwright')
  } catch {
    return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))
  }
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.wav': 'audio/wav' }
const server = createServer(async (req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (!file.startsWith(root)) return res.writeHead(403).end()
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body)
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const url = `http://127.0.0.1:${server.address().port}/reel/index.html?render`

const { chromium } = loadPlaywright()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } })
await page.goto(url)
await page.evaluate(() => window.reel.ready)
await mkdir(outDir, { recursive: true })

const grab = async (t) => {
  const dataUrl = await page.evaluate((t) => window.reel.frame(t), t)
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

const stills = process.argv.slice(2).map(Number)
if (stills.length) {
  for (const t of stills) {
    const file = path.join(outDir, `still-${t.toFixed(2)}.jpg`)
    await writeFile(file, await grab(t))
    console.log(file)
  }
} else {
  const out = path.join(outDir, 'climbertype-stats-reel.mp4')
  const ffmpeg = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(outDir, 'music.wav'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  const total = FPS * DURATION
  for (let f = 0; f < total; f++) {
    const frame = await grab(f / FPS)
    if (!ffmpeg.stdin.write(frame)) await new Promise((r) => ffmpeg.stdin.once('drain', r))
    if (f % FPS === 0) process.stdout.write(`\rframe ${f}/${total}`)
  }
  ffmpeg.stdin.end()
  await new Promise((r, j) => ffmpeg.on('close', (c) => (c ? j(new Error(`ffmpeg exited ${c}`)) : r())))
  console.log(`\n${out}`)
}

await browser.close()
server.close()
