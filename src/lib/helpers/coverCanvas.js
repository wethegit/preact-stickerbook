import { loadUrlAsImage } from './loadUrlAsImage'

export async function coverCanvas({
  ctx,
  img,
  width,
  height,
  offsetX = 0.5,
  offsetY = 0.5,
}) {
  if (!ctx || !(ctx instanceof CanvasRenderingContext2D))
    throw Error('`ctx` is required and must be a valid canvas context')
  if (!img) throw Error('`img` is required')

  const loadedImage = typeof img === 'string' ? await loadUrlAsImage(img) : img

  const imageWidth =
    loadedImage.width || loadedImage.naturalWidth || loadedImage.offsetWidth
  const imageHeight =
    loadedImage.height || loadedImage.naturalHeight || loadedImage.offsetHeight

  const imageRatio = imageWidth / imageHeight
  const outputRatio = width / height

  let outputWidth = width
  let outputHeight = height

  if (imageRatio > outputRatio) outputWidth = outputHeight * imageRatio
  else if (imageRatio < outputRatio)
    outputHeight = outputWidth * (imageHeight / imageWidth)

  // first we our image/source onto a canvas resized
  // to the output size we want and with the correct ratio
  const resizedCanvas = document.createElement('canvas')
  const resizedCanvasCtx = resizedCanvas.getContext('2d')

  resizedCanvas.width = outputWidth
  resizedCanvas.height = outputHeight
  resizedCanvasCtx.drawImage(loadedImage, 0, 0, outputWidth, outputHeight)

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
}
