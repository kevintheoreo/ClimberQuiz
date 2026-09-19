import { toBlob } from 'html-to-image'

/** Slugifies an archetype name into a safe download filename, e.g. "Crimp Goblin" -> "climbertype-crimp-goblin.png". */
export function buildShareFilename(archetypeName: string): string {
  const slug = archetypeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `climbertype-${slug}.png`
}

/** Captures a share-card node as a PNG blob at its native pixel size. */
export async function captureShareCardPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  const images = Array.from(node.querySelectorAll('img'))
  await Promise.all(images.map((img) => img.decode().catch(() => undefined)))

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
