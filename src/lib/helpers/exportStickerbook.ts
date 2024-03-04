import type {
  BackgroundItem,
  ExportFormat,
  ForegroundItem,
  Frame,
  StickerItem,
} from "../types"

import { coverCanvas } from "./coverCanvas"
import { loadUrlAsImage } from "./loadUrlAsImage"
import { renderSticker } from "./renderSticker"
import { EXPORT_FORMATS } from "./consts"

interface ExportStickerbookOptions<T extends ExportFormat> {
  /**
   * A canvas element to draw to. If not provided, a new canvas will be created.
   */
  canvas?: HTMLCanvasElement
  backgrounds?: BackgroundItem[]
  frame?: Frame
  stickers?: StickerItem[]
  foregrounds?: ForegroundItem[]
  /**
   * The width of the output image.
   */
  outputWidth: number
  /**
   * The height of the output image.
   */
  outputHeight: number
  // **`image`** will generate a url using `window.URL.createObjectURL`. **`canvas`** will just return the provided `canvas` or a new one. **`blob`** will return a `Blob` using `HTMLCanvasElement.toBlob()`
  format: T
}

// prettier-ignore
type ExportReturn<K extends ExportFormat> =
  K extends "canvas" ? HTMLCanvasElement :
  K extends "blob" ? Blob :
  K extends "image" ? string :
  never

/**
 * Returns a representation of the stickerbook in the chosen `format`.
 * @param {ExportStickerbookOptions[]}
 * @returns {Promise<ExportReturn<T>>}
 */
export async function exportStickerbook<T extends ExportFormat>({
  canvas,
  backgrounds,
  frame,
  stickers,
  foregrounds,
  outputWidth,
  outputHeight,
  format,
}: ExportStickerbookOptions<T>): Promise<ExportReturn<T>> {
  if (!outputWidth && !outputHeight)
    throw Error("'outputWidth' and 'outputHeight' needs to be bigger than 0")

  if (!EXPORT_FORMATS.includes(format))
    throw Error(
      `Invalid 'format'. 'format' must be one of: ${EXPORT_FORMATS.join(",")}`
    )

  // output canvas
  const outputCanvas = canvas || document.createElement("canvas")
  const outputCtx = outputCanvas.getContext("2d")!

  outputCanvas.width = outputWidth
  outputCanvas.height = outputHeight

  // draw backgrounds
  if (backgrounds && backgrounds.length) {
    for (const background of backgrounds) {
      if (!background.image) continue

      await coverCanvas({
        ctx: outputCtx,
        img: background.image,
        width: outputWidth,
        height: outputHeight,
      })
    }
  }

  // draw frame
  if (frame && frame.image)
    await coverCanvas({
      ctx: outputCtx,
      img: frame.image,
      width: outputWidth,
      height: outputHeight,
    })

  if (stickers && stickers.length > 0) {
    // sort by order
    const sortedStickers = [...stickers].sort((a, b) => a.order - b.order)

    // load all images to Image elements
    const loadedStickers = await Promise.all(
      sortedStickers.map(({ image }) => loadUrlAsImage(image))
    )

    for (let i = 0; i < loadedStickers.length; i++) {
      const sticker = sortedStickers[i]

      // Render the sticker as a stamp
      const stamp = renderSticker(sticker, loadedStickers[i], [
        outputWidth,
        outputHeight,
      ])

      // final draw
      outputCtx.drawImage(stamp, 0, 0)
    }
  }
  // draw foregrounds
  if (foregrounds && foregrounds.length) {
    for (const foreground of foregrounds) {
      if (!foreground.image) continue

      await coverCanvas({
        ctx: outputCtx,
        img: foreground.image,
        width: outputWidth,
        height: outputHeight,
      })
    }
  }

  // download
  if (format === "canvas") return outputCanvas as ExportReturn<T>

  const blob = await new Promise<Blob>((resolve, reject) => {
    try {
      outputCanvas.toBlob((blob) => {
        if (!blob) throw Error("Failed to create blob")
        resolve(blob)
      })
    } catch (err) {
      reject(err)
    }
  })

  if (format === "blob") return blob as ExportReturn<T>

  return window.URL.createObjectURL(blob) as ExportReturn<T>
}
