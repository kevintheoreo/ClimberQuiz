import { toCanvas } from 'html-to-image'

/** Slugifies an archetype name into a safe download filename, e.g. "Crimp Goblin" -> "climbertype-crimp-goblin.png". */
export function buildShareFilename(archetypeName: string): string {
  const slug = archetypeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `climbertype-${slug}.png`
}

const MAX_IMAGE_FETCH_ATTEMPTS = 3
const IMAGE_FETCH_RETRY_DELAY_MS = 350

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetches a same-origin image URL as a data: URL, retrying a couple of
 * times on failure. On a flaky mobile connection the <img> tag's own single
 * load attempt (and separately, html-to-image's own internal fetch to
 * inline it into the SVG snapshot it builds) can each fail independently —
 * that's the source of the intermittent missing mascot on share. Fetching
 * it ourselves, with retries, and only proceeding once we actually have the
 * bytes in hand removes both of those races.
 */
async function fetchAsDataUrl(url: string): Promise<string> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_IMAGE_FETCH_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Image request failed: HTTP ${response.status}`)
      const blob = await response.blob()
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error ?? new Error('Failed to read image data'))
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      lastError = err
      if (attempt < MAX_IMAGE_FETCH_ATTEMPTS) await delay(IMAGE_FETCH_RETRY_DELAY_MS * attempt)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to fetch image')
}

/**
 * Replaces an <img>'s src with a data: URL of its actual bytes, fetched
 * with retries above. Throws if every attempt fails, so a share-card
 * export with a missing mascot never silently "succeeds" — see
 * fetchAsDataUrl for why this is necessary.
 */
async function inlineImage(img: HTMLImageElement): Promise<void> {
  if (img.src.startsWith('data:')) return
  img.src = await fetchAsDataUrl(img.src)
  await img.decode()
}

/**
 * Position of an <img> relative to the share-card node, in CSS px — used to
 * composite it back onto the exported canvas ourselves afterward.
 */
interface ImagePlacement {
  img: HTMLImageElement
  x: number
  y: number
  width: number
  height: number
}

function getImagePlacement(node: HTMLElement, img: HTMLImageElement): ImagePlacement {
  const nodeRect = node.getBoundingClientRect()
  const imgRect = img.getBoundingClientRect()
  return {
    img,
    x: imgRect.left - nodeRect.left,
    y: imgRect.top - nodeRect.top,
    width: imgRect.width,
    height: imgRect.height,
  }
}

/** Captures a share-card node as a PNG blob at its native pixel size. */
export async function captureShareCardPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  const images = Array.from(node.querySelectorAll('img'))
  await Promise.all(images.map(inlineImage))

  // Record each image's on-screen position before html-to-image clones and
  // rasterizes the node, since the clone won't exist afterward.
  const placements = images.map((img) => getImagePlacement(node, img))

  const canvas = await toCanvas(node, {
    width: node.offsetWidth,
    height: node.offsetHeight,
    pixelRatio: 1,
  })

  // html-to-image rasterizes <img> elements by embedding them (as data:
  // URLs by this point, already verified loadable above) inside an SVG
  // <foreignObject>, then drawing that SVG onto this canvas. That step is
  // known to silently drop large embedded images on some mobile
  // browsers/WebViews — the rest of the card renders fine, but the mascot
  // just doesn't show up, with no error anywhere. Since we already have
  // each image fully decoded in memory (inlineImage above guarantees it,
  // with retries), draw it directly onto the canvas ourselves as a final
  // step. This doesn't depend on html-to-image's SVG rasterization at all,
  // so it can't be silently skipped by it.
  const ctx = canvas.getContext('2d')
  if (ctx) {
    for (const { img, x, y, width, height } of placements) {
      if (width === 0 || height === 0) continue
      ctx.drawImage(img, x, y, width, height)
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Failed to render share card image')
  return blob
}

export function downloadPng(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** Uses the Web Share API when it can share files, otherwise falls back to a direct download. */
export async function shareOrDownloadPng(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })
  const shareData = { files: [file] }

  if (navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
    }
  }

  downloadPng(blob, filename)
}
