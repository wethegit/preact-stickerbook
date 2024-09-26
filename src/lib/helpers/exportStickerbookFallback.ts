import { Vec2 } from "wtc-math"

import type {
  BackgroundItem,
  ExportFormat,
  ForegroundItem,
  Frame,
  StickerItem,
} from "../types"

import { EXPORT_FORMATS } from "./consts"
import { coverCanvas } from "./coverCanvas"
import { loadUrlAsImage } from "./loadUrlAsImage"

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
  /**
   * **`image`** will generate a url using `window.URL.createObjectURL`
   * **`canvas`** will just return the provided `canvas` or a new one
   * **`blob`** will return a `Blob` using `HTMLCanvasElement.toBlob()`
   */
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
export async function exportStickerbookFallback<
  T extends ExportFormat = "image",
>({
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
      const stickerImage = loadedStickers[i]

      if (
        typeof sticker.position === "undefined" ||
        typeof sticker.position.x === "undefined" ||
        typeof sticker.position.y === "undefined" ||
        isNaN(sticker.position.x) ||
        isNaN(sticker.position.y)
      ) {
        throw Error("Sticker position is not defined")
      }

      if (typeof sticker.scale === "undefined" || isNaN(sticker.scale)) {
        throw Error("Sticker scale is not defined")
      }

      if (typeof sticker.rotation === "undefined" || isNaN(sticker.rotation)) {
        throw Error("Sticker rotation is not defined")
      }

      // @marlonmarcello Thanks to Liam for all this magic bellow.
      // It was just slightly adapted for this use case, but
      // all the logic and math was him. Love you man.
      // what this does is, convert the unit size of the sticker
      // to the correct size in relation to the output
      // -----
      // @liamegan I need to clean this whole function up. Currently it uses two
      // different canvases for scale and rotation - mainly because this
      // allows me to think through the problem logically, however I
      // think that this can be greatly simplified in practice by
      // combining these 2 steps into a single canvas.
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      // adapted to unit sizing
      // first, scale it
      const dimensions = new Vec2(stickerImage.width, stickerImage.height)
      const scale =
        (sticker.scale * outputWidth) /
        Math.min(dimensions.x, dimensions.y) /
        0.5

      const scaledDimensions = dimensions.scaleNew(scale)

      canvas.width = scaledDimensions.width
      canvas.height = scaledDimensions.height

      ctx.drawImage(stickerImage, 0, 0, scaledDimensions.x, scaledDimensions.y)

      // adapting position to unit sizing
      const pos = sticker.position.scaleNew(outputWidth)

      // continue if there is no rotation
      if (!sticker.rotation) {
        outputCtx.drawImage(
          canvas,
          pos.x - canvas.width * 0.5,
          pos.y - canvas.height * 0.5
        )
        continue
      }

      // then rotate
      const rotatedCanvas = document.createElement("canvas")
      const rotatedCanvasCtx = rotatedCanvas.getContext("2d")!
      const sin = Math.sin(sticker.rotation)
      const cos = Math.cos(sticker.rotation)
      const rotatedSize = new Vec2(
        Math.abs(scaledDimensions.y * sin) + Math.abs(scaledDimensions.x * cos),
        Math.abs(scaledDimensions.y * cos) + Math.abs(scaledDimensions.x * sin)
      )
      const rotatedSizeHalf = rotatedSize.scaleNew(0.5)

      rotatedCanvas.width = rotatedSize.x
      rotatedCanvas.height = rotatedSize.y

      rotatedCanvasCtx.translate(rotatedSizeHalf.x, rotatedSizeHalf.y)
      rotatedCanvasCtx.rotate(sticker.rotation)
      rotatedCanvasCtx.drawImage(
        canvas,
        -scaledDimensions.x * 0.5,
        -scaledDimensions.y * 0.5
      )

      // final draw
      outputCtx.drawImage(
        rotatedCanvas || canvas,
        pos.x - rotatedCanvas.width * 0.5,
        pos.y - rotatedCanvas.height * 0.5
      )
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
