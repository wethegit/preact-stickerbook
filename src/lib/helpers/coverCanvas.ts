import { OverlayType } from "../types"
import { loadUrlAsImage } from "./loadUrlAsImage"

interface CoverCanvasOptions {
  ctx: CanvasRenderingContext2D
  img: string | HTMLImageElement
  width: number
  height: number
  offsetX?: number
  offsetY?: number
  type?: OverlayType
}

export async function coverCanvas({
  ctx,
  img,
  width,
  height,
  offsetX = 0.5,
  offsetY = 0.5,
  type = "scene",
}: CoverCanvasOptions): Promise<void> {
  if (!ctx || !(ctx instanceof CanvasRenderingContext2D))
    throw Error("`ctx` is required and must be a valid canvas context")
  if (!img) throw Error("`img` is required")

  const loadedImage = typeof img === "string" ? await loadUrlAsImage(img) : img

  const imageWidth =
    loadedImage.width || loadedImage.naturalWidth || loadedImage.offsetWidth
  const imageHeight =
    loadedImage.height || loadedImage.naturalHeight || loadedImage.offsetHeight

  const imageRatio = imageWidth / imageHeight
  const outputRatio = width / height

  let outputWidth = width
  let outputHeight = height

  // first we our image/source onto a canvas resized
  // to the output size we want and with the correct ratio
  const resizedCanvas = document.createElement("canvas")
  const resizedCanvasCtx = resizedCanvas.getContext("2d")!

  if (type === "scene") {
    if (imageRatio > outputRatio) outputWidth = outputHeight * imageRatio
    else if (imageRatio < outputRatio)
      outputHeight = outputWidth * (imageHeight / imageWidth)
  } else {
    // backgrounds should base themselves on the size of the stickerbook
    // meaning, they should look good with the output size in mind
    // so we don't alter their dimensions here, just like we don't
    // on the stickerbook preview itself, see size matching there
    // https://github.com/wethegit/preact-stickerbook/blob/4f33afc7ac1fb25090d2f799798b104797758229/src/lib/stickerbook.tsx
    outputWidth = imageWidth
    outputHeight = imageHeight
  }

  resizedCanvas.width = outputWidth
  resizedCanvas.height = outputHeight
  resizedCanvasCtx.drawImage(loadedImage, 0, 0, outputWidth, outputHeight)

  if (type === "scene") {
    // now we draw the scaled canvas onto the original context passed
    ctx.drawImage(
      resizedCanvas,
      (outputWidth - width) * offsetX,
      (outputHeight - height) * offsetY,
      width,
      height,
      0,
      0,
      width,
      height
    )
  } else {
    // create a pattern
    const pattern = ctx.createPattern(resizedCanvas, "repeat")!

    // fill canvas
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, width, height)
  }
}
