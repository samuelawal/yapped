import { toBlob } from 'html-to-image'

/**
 * Renders a DOM node to a PNG. On phones it opens the share sheet (so it can
 * go straight to a WhatsApp status); elsewhere it downloads the file.
 */
export async function saveNodeAsImage(node: HTMLElement, filename: string, pixelRatio: number) {
  await document.fonts.ready
  const blob = await toBlob(node, { pixelRatio, cacheBust: true })
  if (!blob) throw new Error('Could not create the image.')

  const file = new File([blob], filename, { type: 'image/png' })
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  if (isTouch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (error) {
      // Closing the share sheet is not an error
      if (error instanceof DOMException && error.name === 'AbortError') return
      // Otherwise (e.g. the browser blocked it), fall back to a download
    }
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
