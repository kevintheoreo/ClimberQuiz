// ClimberType stats reel — 1080x1920 @ 30fps, 36s.
// Every frame is a pure function of time `t`, so the same code drives the
// live browser preview and the frame-by-frame offline render (render.mjs).
// Timing is locked to a 120 BPM grid (1 beat = 0.5s, 1 bar = 2s); music.py
// uses the same cue times, so keep the two in sync when moving anything.

export const W = 1080
export const H = 1920
export const FPS = 30
export const DURATION = 36

const BEAT = 0.5
const SITE_URL = 'climbertype.vercel.app'

// Gig-poster screenprint palette, lifted from src/index.css.
const C = {
  bg: '#efe3c8',
  surface: '#e4d5b0',
  ink: '#201a12',
  muted: '#5c5138',
  red: '#e8432e',
  teal: '#1e7a6e',
  tealDark: '#18625a',
  mustard: '#e8a93b',
}
const FONT = { head: '"Titan One"', mono: '"Space Mono"', script: '"Caveat"' }

// ---------------------------------------------------------------- data ----

const TOTAL = 2782
const RESULTS = [
  ['chill-climber', 'Chill Climber', 561],
  ['slab-philosopher', 'Slab Philosopher', 380],
  ['beta-scientist', 'Beta Scientist', 376],
  ['rest-day-warrior', 'Rest-Day Warrior', 359],
  ['project-addict', 'Project Addict', 304],
  ['dyno-gremlin', 'Dyno Gremlin', 277],
  ['movement-nerd', 'Movement Nerd', 273],
  ['crimp-goblin', 'Crimp Goblin', 91],
  ['sloper-specialist', 'Sloper Specialist', 84],
  ['campus-ape', 'Campus Ape', 39],
  ['grade-goblin', 'Grade Goblin', 34],
  ['sandbagger-supreme', 'Sandbagger Supreme', 4],
].map(([id, name, count], i) => ({ id, name, count, rank: i + 1 }))
const byId = Object.fromEntries(RESULTS.map((r) => [r.id, r]))

const CAST = [
  'beta-scientist', 'campus-ape', 'chill-climber',
  'crimp-goblin', 'dyno-gremlin', 'grade-goblin',
  'movement-nerd', 'project-addict', 'rest-day-warrior',
  'sandbagger-supreme', 'slab-philosopher', 'sloper-specialist',
]

const COUNTRIES = [
  { code: 'SG', name: 'Singapore', pct: 53 },
  { code: 'ID', name: 'Indonesia', pct: 19 },
  { code: 'MY', name: 'Malaysia', pct: 16 },
  { code: 'US', name: 'USA', pct: 4 },
]
const MORE_COUNTRIES = [
  '+ UNITED KINGDOM · AUSTRALIA · POLAND',
  'JAPAN · THAILAND · CANADA · GERMANY',
  'HONG KONG · NETHERLANDS & MORE',
]

// Scene cuts (seconds). A screenprint wipe covers each one.
const CUTS = [4, 8, 12, 18, 26, 30]
const WIPE_COLORS = [C.red, C.teal, C.ink, C.red, C.teal, C.red]

// Slot-machine spin in the outro: each entry is when the reel flips to the
// next mascot. music.py rebuilds this exact schedule for its tick sounds.
const SPIN_LAND = 34
const SPIN = (() => {
  const times = []
  let t = 30.3
  let dt = 0.07
  while (t < 33.7) {
    times.push(t)
    t += dt
    dt *= 1.11
  }
  return times
})()

// ------------------------------------------------------------- helpers ----

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const lerp = (a, b, p) => a + (b - a) * p
const prog = (t, start, dur) => clamp((t - start) / dur)
const ease = {
  outCubic: (p) => 1 - (1 - p) ** 3,
  inCubic: (p) => p ** 3,
  inOutCubic: (p) => (p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2),
  outBack: (p, s = 1.9) => 1 + (s + 1) * (p - 1) ** 3 + s * (p - 1) ** 2,
}
const fmt = (n) => Math.round(n).toLocaleString('en-US')

function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// Hand-drawn "line boil": a small jitter that changes 8 times a second,
// like a stop-motion cartoon redrawn on every few frames.
function boil(t, id, amp = 1) {
  const k = Math.floor(t * 8)
  return {
    x: (hash(k * 7.13 + id) - 0.5) * 2 * amp,
    y: (hash(k * 3.71 + id * 1.3) - 0.5) * 2 * amp,
    r: (hash(k * 5.3 + id * 2.1) - 0.5) * 0.03 * amp,
  }
}

// Mascots hop on every beat once they have arrived.
const hop = (t, phase = 0, amp = 14) => -Math.abs(Math.sin(Math.PI * (t / BEAT + phase))) * amp

// Short "punch" pulse on each beat for things that should breathe with the music.
const beatPulse = (t) => Math.exp(-((t % BEAT) / BEAT) * 6)

function typed(str, p) {
  return str.slice(0, Math.round(str.length * clamp(p)))
}

// --------------------------------------------------------------- assets ----

const images = {}
const silhouettes = {}
let grain = null

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function makeSilhouette(img) {
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const g = c.getContext('2d')
  g.drawImage(img, 0, 0)
  g.globalCompositeOperation = 'source-in'
  g.fillStyle = C.ink
  g.fillRect(0, 0, c.width, c.height)
  return c
}

// Screenprint texture: the share card's 22px halftone dot grid plus random
// ink speckle, laid over every frame.
function makeGrain() {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = 'rgba(32, 26, 18, 0.07)'
  for (let y = 11; y < H; y += 22) {
    for (let x = 11; x < W; x += 22) {
      g.beginPath()
      g.arc(x, y, 2.6, 0, Math.PI * 2)
      g.fill()
    }
  }
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(32, 26, 18, ${0.05 + hash(i * 9.1) * 0.12})`
    g.beginPath()
    g.arc(hash(i * 1.3) * W, hash(i * 2.7) * H, 0.6 + hash(i * 4.9) * 1.6, 0, Math.PI * 2)
    g.fill()
  }
  for (let i = 0; i < 1500; i++) {
    g.fillStyle = `rgba(255, 250, 235, ${0.08 + hash(i * 3.3) * 0.12})`
    g.fillRect(hash(i * 5.7) * W, hash(i * 6.1) * H, 1.5, 1.5)
  }
  return c
}

export async function load(mascotBase) {
  await Promise.all([
    document.fonts.load(`100px ${FONT.head}`),
    document.fonts.load(`700 100px ${FONT.mono}`),
    document.fonts.load(`700 100px ${FONT.script}`),
  ])
  await Promise.all(
    CAST.map(async (id) => {
      images[id] = await loadImage(`${mascotBase}/${id}.png`)
      silhouettes[id] = makeSilhouette(images[id])
    }),
  )
  grain = makeGrain()
}

// ------------------------------------------------------------- drawing ----

function poly(ctx, pts, fill) {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function paper(ctx, color = C.bg) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, W, H)
}

function text(ctx, str, x, y, o = {}) {
  const {
    font = FONT.mono, size = 32, weight = '700', color = C.ink, align = 'center',
    spacing = 0, shadow = null, shadowOff = 5, stroke = null, strokeW = 0, maxWidth = 0,
    alpha = 1,
  } = o
  if (!str || alpha <= 0) return
  ctx.save()
  ctx.globalAlpha *= alpha
  let s = size
  const setFont = () => {
    ctx.font = `${font === FONT.head ? '' : weight} ${s}px ${font}`
    ctx.letterSpacing = `${spacing * (s / size)}px`
  }
  setFont()
  if (maxWidth && ctx.measureText(str).width > maxWidth) {
    s = (s * maxWidth) / ctx.measureText(str).width
    setFont()
  }
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  // letterSpacing pads after every glyph, so shift centred text back by half a gap.
  const dx = align === 'center' ? (spacing * (s / size)) / 2 : 0
  if (shadow) {
    ctx.fillStyle = shadow
    ctx.fillText(str, x + dx + shadowOff, y + shadowOff)
  }
  if (stroke) {
    ctx.lineJoin = 'round'
    ctx.lineWidth = strokeW
    ctx.strokeStyle = stroke
    ctx.strokeText(str, x + dx, y)
  }
  ctx.fillStyle = color
  ctx.fillText(str, x + dx, y)
  ctx.restore()
}

// Poster headline: Titan One in ink with the mustard offset print.
function headline(ctx, str, x, y, size, o = {}) {
  text(ctx, str, x, y, {
    font: FONT.head, size, color: C.ink, shadow: C.mustard, shadowOff: Math.max(4, size / 22),
    ...o,
  })
}

function eyebrow(ctx, str, y, t, start, color = C.bg) {
  text(ctx, typed(str, prog(t, start, 0.6)), W / 2, y, {
    size: 34, color, spacing: 6, maxWidth: 900,
  })
}

function scaled(ctx, cx, cy, s, rot, fn) {
  if (s <= 0.001) return
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.scale(s, s)
  fn()
  ctx.restore()
}

function pill(ctx, str, cx, cy, o = {}) {
  const { size = 30, bg = C.ink, fg = C.bg, font = FONT.mono, border = null, scale = 1, rot = 0 } = o
  scaled(ctx, cx, cy, scale, rot, () => {
    ctx.font = `${font === FONT.head ? '' : '700'} ${size}px ${font}`
    ctx.letterSpacing = font === FONT.mono ? '2px' : '1px'
    const w = ctx.measureText(str).width + size * 1.9
    const h = size * 2.1
    ctx.beginPath()
    ctx.roundRect(-w / 2, -h / 2, w, h, h / 2)
    ctx.fillStyle = bg
    ctx.fill()
    if (border) {
      ctx.lineWidth = 5
      ctx.strokeStyle = border
      ctx.stroke()
    }
    ctx.fillStyle = fg
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(str, 1, size * 0.08)
  })
}

// The share card's chunky stat bar: ink-bordered track, teal fill with
// darker stripe segments.
function statBar(ctx, x, y, w, h, frac, o = {}) {
  const { fill = C.teal, stripe = C.tealDark, track = C.bg, border = 5, seg = 31 } = o
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 7)
  ctx.fillStyle = track
  ctx.fill()
  ctx.clip()
  const fw = (w - border) * clamp(frac)
  ctx.fillStyle = fill
  ctx.fillRect(x, y, fw, h)
  ctx.fillStyle = stripe
  for (let sx = x + seg - 3; sx < x + fw; sx += seg) ctx.fillRect(sx, y, 3, h)
  ctx.restore()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 7)
  ctx.lineWidth = border
  ctx.strokeStyle = C.ink
  ctx.stroke()
}

function mascot(ctx, id, cx, cy, size, o = {}) {
  const { scale = 1, rot = 0, alpha = 1, silhouette = false, sx = 1, sy = 1, anchorBottom = false } = o
  const img = silhouette ? silhouettes[id] : images[id]
  if (!img || scale <= 0.001 || alpha <= 0) return
  const k = size / Math.max(img.width, img.height)
  const w = img.width * k
  const h = img.height * k
  ctx.save()
  ctx.globalAlpha *= alpha
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.scale(scale * sx, scale * sy)
  ctx.drawImage(img, -w / 2, anchorBottom ? -h : -h / 2, w, h)
  ctx.restore()
}

// Mascot that pops in at `start` and then dances on the beat.
function popMascot(ctx, t, id, cx, cy, size, start, n, o = {}) {
  const p = prog(t, start, 0.38)
  if (p <= 0) return
  const b = boil(t, n, 1.2)
  const s = ease.outBack(p)
  const h = p >= 1 ? hop(t, n * 0.17, o.hopAmp ?? 12) : 0
  mascot(ctx, id, cx + b.x, cy + b.y + h, size, { scale: s, rot: (o.rot ?? 0) + b.r + (1 - p) * 0.5, ...o })
}

function rays(ctx, t, cx, cy, r, s, color = C.mustard) {
  if (s <= 0) return
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(t * 0.35)
  ctx.scale(s, s)
  ctx.fillStyle = color
  const n = 14
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r, a, a + Math.PI / n)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

const CONFETTI = Array.from({ length: 110 }, (_, i) => ({
  a: -Math.PI / 2 + (hash(i * 1.7) - 0.5) * 2.6,
  v: 900 + hash(i * 3.1) * 1500,
  c: [C.red, C.teal, C.mustard, C.bg, C.ink][i % 5],
  w: 14 + hash(i * 4.4) * 18,
  h: 8 + hash(i * 5.5) * 10,
  spin: (hash(i * 6.6) - 0.5) * 16,
}))

function confetti(ctx, t, t0, ox, oy) {
  const tau = t - t0
  if (tau < 0 || tau > 5) return
  const k = 1.8
  const drag = (1 - Math.exp(-k * tau)) / k
  for (const c of CONFETTI) {
    const x = ox + Math.cos(c.a) * c.v * drag
    const y = oy + Math.sin(c.a) * c.v * drag + 700 * tau * tau * 0.5
    if (y > H + 50) continue
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(c.spin * tau)
    ctx.scale(1, Math.cos(c.spin * tau * 0.7))
    ctx.fillStyle = c.c
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = C.ink
    ctx.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h)
    ctx.restore()
  }
}

// --------------------------------------------------------------- scenes ----

// 0–4s · Hook: how many people took the quiz.
function sceneIntro(ctx, t) {
  paper(ctx)
  const s = ease.outCubic(prog(t, 0, 0.6))
  poly(ctx, [[0, 0], [W, 0], [W, lerp(-300, 760, s)], [0, lerp(-300, 1240, s)]], C.red)

  eyebrow(ctx, 'WHAT KIND OF CLIMBER ARE YOU?', 300, t, 0.15)
  popMascot(ctx, t, 'slab-philosopher', 230, 620, 270, 0.5, 1, { rot: -0.12 })
  popMascot(ctx, t, 'beta-scientist', 850, 620, 270, 1.0, 3, { rot: 0.12 })
  popMascot(ctx, t, 'chill-climber', 540, 560, 330, 0.75, 2)

  const pIn = prog(t, 0.5, 0.35)
  const punch = t >= 2.5 ? 0.2 * Math.exp(-(t - 2.5) * 7) : 0
  const count = TOTAL * ease.outCubic(prog(t, 0.5, 2.0))
  scaled(ctx, W / 2, 1000, ease.outBack(pIn) * (1 + punch), 0, () =>
    headline(ctx, fmt(count), 0, 90, 250, { shadowOff: 11 }),
  )

  const p2 = ease.outCubic(prog(t, 2.5, 0.4))
  text(ctx, 'CLIMBERS TOOK THE QUIZ', W / 2, 1190 + (1 - p2) * 40, { size: 46, spacing: 4, alpha: p2 })
  const p3 = ease.outCubic(prog(t, 2.9, 0.4))
  text(ctx, '...and the results are in', W / 2, 1300, {
    font: FONT.script, size: 72, color: C.muted, alpha: p3,
  })
  pill(ctx, "HERE'S WHAT WE FOUND", W / 2, 1440, { size: 30, scale: ease.outBack(prog(t, 3.25, 0.35)) })
}

// 4–8s · Meet the cast: the 12 archetypes pop in on 8th notes.
function sceneCast(ctx, t) {
  paper(ctx)
  poly(ctx, [[0, 0], [W, 0], [W, 330], [0, 450]], C.red)
  eyebrow(ctx, 'MEET THE CAST', 250, t, 4.1)
  scaled(ctx, W / 2, 380, ease.outBack(prog(t, 4.1, 0.4)), 0, () =>
    headline(ctx, '12 CLIMBER TYPES', 0, 30, 92, { maxWidth: 960 }),
  )

  CAST.forEach((id, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const cx = 240 + col * 300
    const top = 500 + row * 255
    const start = 4.25 + i * 0.25
    popMascot(ctx, t, id, cx, top + 95, 175, start, i + 10)
    const p = ease.outCubic(prog(t, start + 0.1, 0.3))
    text(ctx, byId[id].name.toUpperCase(), cx, top + 218, { size: 22, alpha: p, maxWidth: 285 })
  })

  const p = ease.outCubic(prog(t, 7.2, 0.4))
  text(ctx, 'but some of you are WAY rarer...', W / 2, 1565, {
    font: FONT.script, size: 64, color: C.red, alpha: p,
  })
}

// 8–12s · Spotlight on the rarest type (the music drops into a sneaky minor key).
function sceneRarest(ctx, t) {
  paper(ctx, C.ink)
  const r = byId['sandbagger-supreme']

  // Spotlight flickers on.
  const on = t > 8.25 && !(t > 8.32 && t < 8.4) ? 1 : 0
  if (on) {
    const g = ctx.createLinearGradient(0, 0, 0, 900)
    g.addColorStop(0, 'rgba(239, 227, 200, 0.05)')
    g.addColorStop(1, 'rgba(239, 227, 200, 0.22)')
    poly(ctx, [[470, 0], [610, 0], [860, 870], [220, 870]], g)
    ctx.beginPath()
    ctx.ellipse(540, 868, 330, 52, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(239, 227, 200, 0.28)'
    ctx.fill()
  }
  eyebrow(ctx, 'THE RAREST CLIMBER TYPE', 290, t, 8.05, C.mustard)

  // Drop in, land at 8.9 with a squash.
  if (t >= 8.5) {
    const fall = ease.inCubic(prog(t, 8.5, 0.4))
    const bottom = lerp(-100, 860, fall)
    const tau = Math.max(0, t - 8.9)
    const sq = t >= 8.9 ? 0.22 * Math.exp(-tau * 7) * Math.cos(tau * 28) : 0
    const b = boil(t, 40, 1)
    mascot(ctx, r.id, 540 + b.x, bottom - 8, 380, {
      sx: 1 + sq, sy: 1 - sq, rot: b.r, anchorBottom: true,
    })
  }

  const pn = ease.outBack(prog(t, 9.0, 0.35))
  scaled(ctx, W / 2, 990, pn, 0, () =>
    text(ctx, r.name, 0, 0, { font: FONT.head, size: 84, color: C.bg, shadow: C.red, shadowOff: 6 }),
  )
  scaled(ctx, W / 2, 1290, ease.outBack(prog(t, 9.5, 0.4), 2.6), 0, () =>
    text(ctx, String(r.count), 0, 0, { font: FONT.head, size: 300, color: C.mustard, shadow: C.red, shadowOff: 12 }),
  )
  const pc = ease.outCubic(prog(t, 9.75, 0.4))
  text(ctx, `OUT OF ${fmt(TOTAL)} CLIMBERS (0.14%)`, W / 2, 1375, { size: 34, color: C.bg, spacing: 3, alpha: pc })
  const pt = ease.outCubic(prog(t, 10.25, 0.4))
  text(ctx, '"I\'m honestly not that strong."', W / 2, 1480, {
    font: FONT.script, size: 64, color: C.bg, alpha: pt,
  })

  // Rubber stamp slams down on the beat.
  const ps = prog(t, 11.0, 0.14)
  if (ps > 0) {
    ctx.save()
    ctx.globalAlpha = ps
    scaled(ctx, 540, 790, lerp(2.4, 1, ease.outCubic(ps)), -0.12, () => {
      ctx.lineWidth = 7
      ctx.strokeStyle = C.red
      ctx.strokeRect(-330, -58, 660, 116)
      ctx.strokeRect(-318, -46, 636, 92)
      text(ctx, 'SUSPICIOUSLY RARE', 0, 20, { font: FONT.head, size: 56, color: C.red })
    })
    ctx.restore()
  }
}

// 12–18s · Leaderboard climbs from #12 up to #4; the top 3 stay hidden.
function sceneRanks(ctx, t) {
  paper(ctx)
  poly(ctx, [[0, 0], [W, 0], [W, 300], [0, 420]], C.red)
  eyebrow(ctx, `ALL ${fmt(TOTAL)} RESULTS`, 240, t, 12.1)
  scaled(ctx, W / 2, 380, ease.outBack(prog(t, 12.1, 0.4)), 0, () =>
    headline(ctx, 'THE LEADERBOARD', 0, 30, 92, { maxWidth: 940 }),
  )

  const max = RESULTS[0].count
  for (const r of RESULTS) {
    const top = 470 + (r.rank - 1) * 88
    const hidden = r.rank <= 3
    const start = hidden ? 12.3 : 12.5 + (12 - r.rank) * 0.5
    const p = prog(t, start, 0.35)
    if (p <= 0) continue
    let dx = (1 - ease.outBack(p)) * -760
    if (hidden && t > 16.9) {
      const k = prog(t, 16.9, 0.85)
      dx += Math.sin(t * 70 + r.rank * 2) * 9 * k
    }
    ctx.save()
    ctx.translate(dx, 0)
    text(ctx, `#${r.rank}`, 64, top + 52, { size: 26, color: C.muted, align: 'left' })
    if (hidden) {
      mascot(ctx, r.id, 180, top + 40, 78, { silhouette: true, rot: boil(t, r.rank).r })
      text(ctx, '?', 180, top + 56, { font: FONT.head, size: 44, color: C.mustard })
      text(ctx, '???', 232, top + 28, { size: 24, align: 'left' })
      ctx.setLineDash([14, 10])
      ctx.lineWidth = 4
      ctx.strokeStyle = C.ink
      ctx.beginPath()
      ctx.roundRect(232, top + 40, 610, 30, 7)
      ctx.stroke()
      ctx.setLineDash([])
    } else {
      const g = prog(t, start + 0.1, 0.6)
      mascot(ctx, r.id, 180, top + 40 + hop(t, r.rank * 0.13, 6), 78, { rot: boil(t, r.rank).r })
      text(ctx, r.name.toUpperCase(), 232, top + 28, { size: 24, align: 'left' })
      statBar(ctx, 232, top + 40, 610, 30, (r.count / max) * ease.outCubic(g), { border: 4, seg: 26 })
      text(ctx, fmt(r.count * ease.outCubic(g)), 862, top + 68, { font: FONT.head, size: 36, align: 'left' })
    }
    ctx.restore()
  }

  const pc = ease.outCubic(prog(t, 16.9, 0.4))
  text(ctx, 'and your top 3 are...', W / 2, 1590, { font: FONT.script, size: 66, color: C.red, alpha: pc })
}

// 18–26s · The podium: #3, #2, then the big #1 reveal on the chorus.
function scenePodium(ctx, t) {
  paper(ctx)
  poly(ctx, [[0, 0], [W, 0], [W, 560], [0, 900]], C.red)
  // Sunburst behind the winner.
  rays(ctx, t, 540, 1330 - 440 - 150, 620, ease.outBack(prog(t, 22.0, 0.5)), 'rgba(232, 169, 59, 0.55)')
  eyebrow(ctx, `THE TOP 3 OF ${fmt(TOTAL)}`, 250, t, 18.15)
  scaled(ctx, W / 2, 400, ease.outBack(prog(t, 18.2, 0.4)), 0, () => headline(ctx, 'THE PODIUM', 0, 36, 112))

  const base = 1330
  const steps = [
    { r: RESULTS[1], x: 70, hgt: 330, fill: C.surface, fg: C.ink, reveal: 20.25, size: 250, rise: 18.05 },
    { r: RESULTS[0], x: 390, hgt: 440, fill: C.mustard, fg: C.ink, reveal: 22.0, size: 330, rise: 18.0 },
    { r: RESULTS[2], x: 710, hgt: 270, fill: C.teal, fg: C.bg, reveal: 18.75, size: 250, rise: 18.1 },
  ]
  const winner = steps[1]

  for (const s of steps) {
    const top = base - s.hgt
    const rise = ease.outCubic(prog(t, s.rise, 0.45))
    const y = top + (1 - rise) * (s.hgt + 700)
    ctx.fillStyle = C.ink
    ctx.fillRect(s.x + 12, y + 12, 300, base - y)
    ctx.fillStyle = s.fill
    ctx.fillRect(s.x, y, 300, base - y + 6)
    ctx.lineWidth = 6
    ctx.strokeStyle = C.ink
    ctx.strokeRect(s.x, y, 300, base - y + 6)

    const cx = s.x + 150
    const rev = prog(t, s.reveal, 0.4)
    text(ctx, String(s.r.rank), cx, y + 100, { font: FONT.head, size: 96, color: s.fg })
    if (rev <= 0) {
      text(ctx, '?', cx, y + 210, { font: FONT.head, size: 80, color: s.fg, alpha: 0.5 })
      continue
    }
    const pct = (s.r.count / TOTAL) * 100 * ease.outCubic(rev)
    text(ctx, s.r.name.toUpperCase(), cx, y + 150, { size: 22, color: s.fg, maxWidth: 270, alpha: rev })
    text(ctx, `${pct.toFixed(1)}%`, cx, y + 215, { font: FONT.head, size: 54, color: s.fg, alpha: rev })

    // Mascot drops onto the step and then dances.
    const drop = ease.outBack(prog(t, s.reveal, 0.4), 1.4)
    const b = boil(t, s.r.rank + 50, 1.2)
    const h = t > s.reveal + 0.4 ? hop(t, s.r.rank * 0.21, s.r.rank === 1 ? 22 : 12) : 0
    mascot(ctx, s.r.id, cx + b.x, lerp(-400, top - 8, drop) + h, s.size, { rot: b.r, anchorBottom: true })
  }
  confetti(ctx, t, 22.0, 540, base - winner.hgt - 200)

  // Captions under the podium.
  const close = prog(t, 20.75, 0.35) * (1 - prog(t, 22.5, 0.2))
  pill(ctx, '#2 AND #3: JUST 4 VOTES APART', W / 2, 1440, { size: 28, scale: ease.outBack(close) })
  const p1 = ease.outCubic(prog(t, 22.75, 0.4))
  text(ctx, '1 IN 5 OF YOU IS A', W / 2, 1430, { size: 34, spacing: 4, alpha: p1 })
  scaled(ctx, W / 2, 1530, ease.outBack(prog(t, 23.0, 0.4)) * (1 + 0.05 * beatPulse(t)), 0, () =>
    text(ctx, 'CHILL CLIMBER', 0, 0, { font: FONT.head, size: 92, color: C.red, shadow: C.ink, shadowOff: 6 }),
  )
}

// 26–30s · Where the quiz-takers are.
function sceneWhere(ctx, t) {
  paper(ctx)
  poly(ctx, [[0, 0], [W, 0], [W, 300], [0, 420]], C.red)
  eyebrow(ctx, 'QUIZ VISITORS BY COUNTRY', 240, t, 26.1)
  scaled(ctx, W / 2, 380, ease.outBack(prog(t, 26.1, 0.4)), 0, () => headline(ctx, 'WHERE YOU CLIMB', 0, 30, 92, { maxWidth: 940 }))

  COUNTRIES.forEach((c, k) => {
    const top = 500 + k * 190
    const start = 26.25 + k * 0.5
    const p = prog(t, start, 0.35)
    if (p <= 0) return
    const b = boil(t, 70 + k, 1)
    scaled(ctx, 130 + b.x, top + 72 + b.y, ease.outBack(p), -0.08 + b.r, () => {
      ctx.beginPath()
      ctx.arc(0, 0, 62, 0, Math.PI * 2)
      ctx.fillStyle = C.ink
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, 0, 52, 0, Math.PI * 2)
      ctx.lineWidth = 3
      ctx.strokeStyle = C.mustard
      ctx.stroke()
      text(ctx, c.code, 0, 17, { font: FONT.head, size: 46, color: C.bg })
    })
    const g = ease.outCubic(prog(t, start + 0.1, 0.6))
    text(ctx, c.name.toUpperCase(), 222, top + 48, { size: 36, align: 'left', alpha: ease.outCubic(p) })
    statBar(ctx, 222, top + 68, 560, 46, (c.pct / COUNTRIES[0].pct) * g, { fill: k === 0 ? C.red : C.teal, stripe: k === 0 ? '#b93524' : C.tealDark })
    text(ctx, `${Math.round(c.pct * g)}%`, 800, top + 112, { font: FONT.head, size: 56, align: 'left', alpha: ease.outCubic(p) })
  })

  MORE_COUNTRIES.forEach((line, i) => {
    text(ctx, typed(line, prog(t, 28.2 + i * 0.25, 0.4)), W / 2, 1310 + i * 48, { size: 28, color: C.muted, spacing: 1 })
  })
  const pc = ease.outCubic(prog(t, 28.75, 0.4))
  text(ctx, "Southeast Asia, you're carrying the sport.", W / 2, 1530, {
    font: FONT.script, size: 62, color: C.red, alpha: pc, maxWidth: 960,
  })
}

// 30–36s · Call to action: a slot machine spins through the cast and lands on "?".
function sceneOutro(ctx, t) {
  paper(ctx)
  poly(ctx, [[0, 0], [W, 0], [W, 820], [0, 1220]], C.red)
  const landed = t >= SPIN_LAND
  rays(ctx, t, 540, 650, 560, ease.outBack(prog(t, SPIN_LAND, 0.5)), 'rgba(232, 169, 59, 0.6)')
  eyebrow(ctx, 'WHAT KIND OF CLIMBER ARE YOU?', 280, t, 30.1)

  // Slot window.
  const win = 470
  const wx = 540 - win / 2
  const wy = 650 - win / 2
  const pw = ease.outBack(prog(t, 30.05, 0.35))
  scaled(ctx, 540, 650, pw * (landed ? 1 + 0.12 * Math.exp(-(t - SPIN_LAND) * 6) : 1), 0, () => {
    ctx.translate(-540, -650)
    ctx.fillStyle = C.ink
    ctx.beginPath()
    ctx.roundRect(wx + 14, wy + 14, win, win, 36)
    ctx.fill()
    ctx.fillStyle = C.bg
    ctx.beginPath()
    ctx.roundRect(wx, wy, win, win, 36)
    ctx.fill()
    ctx.save()
    ctx.clip()
    let n = 0
    while (n < SPIN.length && SPIN[n] <= t) n++
    const id = CAST[(n + 2) % CAST.length]
    if (landed) {
      mascot(ctx, 'slab-philosopher', 540, 660, 380, { silhouette: true, rot: boil(t, 90).r })
    } else {
      const last = n > 0 ? SPIN[n - 1] : 0
      const dur = n < SPIN.length ? Math.min(0.12, SPIN[n] - last) : 0.15
      const slide = n > 0 ? (1 - ease.outCubic(prog(t, last, dur))) * -160 : 0
      mascot(ctx, id, 540, 660 + slide, 380, { rot: boil(t, 91).r })
    }
    ctx.restore()
    ctx.lineWidth = 8
    ctx.strokeStyle = C.ink
    ctx.beginPath()
    ctx.roundRect(wx, wy, win, win, 36)
    ctx.stroke()
    if (landed) {
      scaled(ctx, 540, 700, ease.outBack(prog(t, SPIN_LAND, 0.4), 2.4), boil(t, 92).r, () =>
        text(ctx, '?', 0, 90, { font: FONT.head, size: 300, color: C.mustard, stroke: C.ink, strokeW: 14 }),
      )
    }
  })
  confetti(ctx, t, SPIN_LAND, 540, 560)

  scaled(ctx, W / 2, 1050, ease.outBack(prog(t, 30.5, 0.4)), 0, () => headline(ctx, 'WHICH ONE', 0, 40, 124))
  scaled(ctx, W / 2, 1180, ease.outBack(prog(t, 30.75, 0.4)), 0, () => headline(ctx, 'ARE YOU?', 0, 40, 124))
  const pp = ease.outBack(prog(t, 31.5, 0.4))
  pill(ctx, 'TAKE THE QUIZ', W / 2, 1335, {
    font: FONT.head, size: 52, bg: C.red, fg: C.bg, border: C.ink, scale: pp * (1 + 0.05 * beatPulse(t)),
  })
  text(ctx, typed(SITE_URL, prog(t, 32.0, 0.6)), W / 2, 1460, { size: 42, spacing: 3 })
  text(ctx, 'link in bio', W / 2, 1545, { font: FONT.script, size: 60, color: C.muted, alpha: ease.outCubic(prog(t, 32.6, 0.4)) })
}

const SCENES = [sceneIntro, sceneCast, sceneRarest, sceneRanks, scenePodium, sceneWhere, sceneOutro]

// --------------------------------------------------------- transitions ----

function zigzagPanel(ctx, y0, y1, color, amp = 46) {
  const step = 54
  ctx.beginPath()
  ctx.moveTo(0, y0)
  for (let x = 0, i = 0; x <= W + step; x += step, i++) ctx.lineTo(x, y0 + (i % 2 ? -amp : 0))
  for (let x = W + step, i = 0; x >= -step; x -= step, i++) ctx.lineTo(x, y1 + (i % 2 ? amp : 0))
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

function wipes(ctx, t) {
  CUTS.forEach((b, i) => {
    const p = (t - (b - 0.3)) / 0.6
    if (p < 0 || p > 1) return
    const span = H + 200
    const cover = ease.inOutCubic(clamp(p / 0.5))
    const uncover = ease.inOutCubic(clamp((p - 0.5) / 0.5))
    const top = H + 100 - span * cover
    const bottom = H + 100 - span * uncover
    zigzagPanel(ctx, top + 90, Math.min(H + 100, bottom + 90), C.mustard)
    zigzagPanel(ctx, top + 160, Math.min(H + 100, bottom), WIPE_COLORS[i])
  })
}

// Torn top edge and ink side rails, like the printed share card.
function cardFrame(ctx) {
  ctx.fillStyle = C.ink
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, 80)
  for (let i = 0; i <= 20; i++) ctx.lineTo((i / 20) * W, i % 2 ? 6 : 80)
  ctx.lineTo(W, 0)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(0, 0, 16, H)
  ctx.fillRect(W - 16, 0, 16, H)
  ctx.fillRect(0, H - 16, W, 16)
}

export function render(ctx, t) {
  t = clamp(t, 0, DURATION - 1e-6)
  let i = 0
  while (i < CUTS.length && t >= CUTS[i]) i++
  ctx.save()
  SCENES[i](ctx, t)
  ctx.restore()
  ctx.drawImage(grain, 0, 0)
  wipes(ctx, t)
  cardFrame(ctx)
}
