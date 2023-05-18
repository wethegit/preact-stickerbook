import { coverCanvas } from './coverCanvas'
import { loadUrlAsImage } from './loadUrlAsImage'
import { renderSticker } from './renderSticker'

export async function exportStickerbook({
  canvas,
  background,
  frame,
  stickers = [],
  foreground,
  outputWidth = 500,
  outputHeight = 500,
  format = 'image',
}) {
  const TYPES = ['image', 'canvas', 'blob']

  if (!outputWidth && !outputHeight)
    throw Error("'outputWidth' and 'outputHeight' needs to be bigger than 0")

  if (!TYPES.includes(format))
    throw Error(`Invalid 'format'. 'format' must be one of: ${TYPES.join(',')}`)

  // output canvas
  const outputCanvas = canvas || document.createElement('canvas')
  const outputCtx = outputCanvas.getContext('2d')

  outputCanvas.width = outputWidth
  outputCanvas.height = outputHeight

  // draw background
  if (background && background.image)
    await coverCanvas({
      ctx: outputCtx,
      img: background.image,
      width: outputWidth,
      height: outputHeight,
    })

  // draw frame
  if (frame && frame.image)
    await coverCanvas({
      ctx: outputCtx,
      img: frame.image,
      width: outputWidth,
      height: outputHeight,
    })

  console.log(stickers.length)
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
  // draw foreground
  if (foreground && foreground.image)
    await coverCanvas({
      ctx: outputCtx,
      img: foreground.image,
      width: outputWidth,
      height: outputHeight,
    })

  // download
  if (format === 'canvas') return outputCanvas

  const imageUrl = await new Promise((resolve, reject) => {
    try {
      outputCanvas.toBlob((blob) => {
        if (format === 'blob') resolve(blob)
        else resolve(window.URL.createObjectURL(blob))
      })
    } catch (err) {
      reject(err)
    }
  })

  return imageUrl
}
