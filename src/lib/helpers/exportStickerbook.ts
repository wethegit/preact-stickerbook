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

interface ExportStickerbookOptions {
  canvas?: HTMLCanvasElement
  backgrounds?: BackgroundItem[]
  frame?: Frame
  stickers?: StickerItem[]
  foregrounds?: ForegroundItem[]
  outputWidth?: number
  outputHeight?: number
  format?: ExportFormat
}

export async function exportStickerbook({
  canvas,
  backgrounds,
  frame,
  stickers,
  foregrounds,
  outputWidth = 500,
  outputHeight = 500,
  format = "image",
}: ExportStickerbookOptions) {
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
      sticker.img = loadedStickers[i]

      // Render the sticker as a stamp
      const stamp = renderSticker(sticker, [outputWidth, outputHeight])

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
  if (format === "canvas") return outputCanvas

  const imageUrl = await new Promise((resolve, reject) => {
    try {
      outputCanvas.toBlob((blob) => {
        if (!blob) throw Error("Failed to create blob")
        if (format === "blob") resolve(blob)
        else resolve(window.URL.createObjectURL(blob))
      })
    } catch (err) {
      reject(err)
    }
  })

  return imageUrl
}
