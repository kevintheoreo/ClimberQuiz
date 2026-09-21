import { toBlob } from 'html-to-image'

/** Slugifies an archetype name into a safe download filename, e.g. "Crimp Goblin" -> "climbertype-crimp-goblin.png". */
export function buildShareFilename(archetypeName: string): string {
  const slug = archetypeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `climbertype-${slug}.png`
}

/**
 * Replaces an <img>'s src with a data: URL of its already-decoded pixels.
 * html-to-image does its own network fetch of each <img> src to inline it
 * into the SVG snapshot it builds, separate from the browser's own image
 * load — that second fetch is a known source of intermittent missing
 * images (races, cache misses) independent of decode() having succeeded.
 * Inlining ourselves removes that fetch from the equation entirely.
 */
async function inlineImage(img: HTMLImageElement): Promise<void> {
  if (img.src.startsWith('data:')) return
  try {
    await img.decode()
  } catch {
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx || canvas.width === 0 || canvas.height === 0) return
  ctx.drawImage(img, 0, 0)
  img.src = canvas.toDataURL('image/png')
}

/** Captures a share-card node as a PNG blob at its native pixel size. */
export async function captureShareCardPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  const images = Array.from(node.querySelectorAll('img'))
  await Promise.all(images.map(inlineImage))

  const blob = await toBlob(node, {
    width: node.offsetWidth,
    height: node.offsetHeight,
    pixelRatio: 1,
  })

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
