/** @jsx h */
import { h } from "preact";
import { Vec2 } from "wtc-math";
import { renderSticker } from "./renderSticker";

export function classnames(namesArray) {
  return namesArray
    .filter((v) => v != "")
    .join(" ")
    .trim();
}

// Helpers function to create images from paths
export function loadUrlAsImage(item) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = item;
  });
}

export async function coverCanvas({
  ctx,
  img,
  width,
  height,
  offsetX = 0.5,
  offsetY = 0.5,
}) {
  if (!ctx || !ctx instanceof CanvasRenderingContext2D)
    throw Error("`ctx` is required and must be a valid canvas context");
  if (!img) throw Error("`img` is required");

  const loadedImage = typeof img === "string" ? await loadUrlAsImage(img) : img;

  const imageWidth =
    loadedImage.width || loadedImage.naturalWidth || loadedImage.offsetWidth;
  const imageHeight =
    loadedImage.height || loadedImage.naturalHeight || loadedImage.offsetHeight;

  const imageRatio = imageWidth / imageHeight;
  const outputRatio = width / height;

  let outputWidth = width;
  let outputHeight = height;

  if (imageRatio > outputRatio) outputWidth = outputHeight * imageRatio;
  else if (imageRatio < outputRatio)
    outputHeight = outputWidth * (imageHeight / imageWidth);

  // first we our image/source onto a canvas resized
  // to the output size we want and with the correct ratio
  const resizedCanvas = document.createElement("canvas");
  const resizedCanvasCtx = resizedCanvas.getContext("2d");

  resizedCanvas.width = outputWidth;
  resizedCanvas.height = outputHeight;
  resizedCanvasCtx.drawImage(loadedImage, 0, 0, outputWidth, outputHeight);

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
  );
}

export async function exportStickerbook({
  canvas,
  background,
  frame,
  stickers = [],
  foreground,
  outputWidth = 500,
  outputHeight = 500,
  format = "image",
}) {
  const TYPES = ["image", "canvas", "blob"];

  if (!outputWidth && !outputHeight)
    throw Error("'outputWidth' and 'outputHeight' needs to be bigger than 0");

  if (!TYPES.includes(format))
    throw Error(
      `Invalid 'format'. 'format' must be one of: ${TYPES.join(",")}`
    );

  // output canvas
  const outputCanvas = canvas || document.createElement("canvas");
  const outputCtx = outputCanvas.getContext("2d");

  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;

  // draw background
  if (background && background.image)
    await coverCanvas({
      ctx: outputCtx,
      img: background.image,
      width: outputWidth,
      height: outputHeight,
    });

  // draw background
  if (frame && frame.image)
    await coverCanvas({
      ctx: outputCtx,
      img: frame.image,
      width: outputWidth,
      height: outputHeight,
    });

  if (stickers && stickers.length > 0) {
    // sort by order
    const sortedStickers = [...stickers].sort((a, b) => a.order - b.order);

    // load all images to Image elements
    const loadedStickers = await Promise.all(
      sortedStickers.map(({ image }) => loadUrlAsImage(image))
    );

    console.log("------------");
    window.loadedStickers = loadedStickers;

    for (let i = 0; i < loadedStickers.length; i++) {
      const sticker = sortedStickers[i];

      // Render the sticker as a stamp
      const stamp = renderSticker(sticker, [outputWidth, outputHeight]);

      // final draw
      outputCtx.drawImage(stamp, 0, 0);
    }
  }

  // draw foreground
  if (foreground && foreground.image)
    await coverCanvas({
      ctx: outputCtx,
      img: foreground.image,
      width: outputWidth,
      height: outputHeight,
    });

  // download
  if (format === "canvas") return outputCanvas;

  const imageUrl = await new Promise((resolve, reject) => {
    try {
      outputCanvas.toBlob((blob) => {
        if (format === "blob") resolve(blob);
        else resolve(window.URL.createObjectURL(blob));
      });
    } catch (err) {
      reject(err);
    }
  });

  return imageUrl;
}

export function reorderSticker({
  index,
  direction = "up",
  extreme = false,
  stickers = [],
}) {
  if (!stickers || stickers.length <= 0)
    throw Error("`stickers` array is empty");
  if (!direction || !["up", "down"].includes(direction))
    throw Error("`direction` needs to be either `up` or `down`");
  if (typeof index !== "number" || index < 0 || index >= stickers.length)
    throw Error("`index` needs to be a valid `stickers` array index");

  // First, we can't change the array itself otherwise
  // it will cause a re-render and the item will loose focus.
  // So I made a prop to stickers called `order` and that represents
  // the order of the sticker on the DOM as a z-index CSS prop.
  const max = stickers.length - 1; // the max is the number of stickers on the array
  const min = 0; // can't go lower than 0 with z-index
  const { order: currentOrder } = stickers.find((item, i) => i === index); // get item to change and its current order

  // if we are going to the extreme, we max it up otherwise
  // we just make sure that we are not going over our max/min
  const newOrder =
    direction === "up"
      ? extreme
        ? max
        : Math.min(max, currentOrder + 1)
      : extreme
      ? min
      : Math.max(min, currentOrder - 1);

  // if the order didn't change, than we just return
  if (newOrder === currentOrder) return stickers;

  return stickers.map((item, i) => {
    // if it's our item we update its order
    if (i === index) item.order = newOrder;
    else if (direction === "up") {
      // if we are going to the extreme edges, we gotta
      // move all stickers before/after the new order
      // or
      // if we are not going to the extreme edges
      // we check if the item is our new order and we move it
      if (
        (extreme && item.order >= currentOrder) ||
        (!extreme && item.order === newOrder)
      )
        item.order -= 1;
    } else {
      if (
        (extreme && item.order <= currentOrder) ||
        (!extreme && item.order === newOrder)
      )
        item.order += 1;
    }

    return item;
  });
}

export function addSticker(stickers = [], sticker) {
  if (!sticker) throw Error("No `sticker` provided");

  // we add a unique key based on the time because otherwise the
  // sticker will loose its state when re-rendering it, even though
  // we save the state globally, this is a good failsafe
  return stickers.concat([
    { ...sticker, order: stickers.length, key: Date.now() },
  ]);
}

export function deleteSticker(stickers, index) {
  if (!stickers || !stickers instanceof Array || stickers.length <= 0)
    throw Error("`stickers` array is empty");

  if (typeof index !== "number" || !stickers[index])
    throw Error("`index` needs to be a valid `stickers` array index");

  const order = stickers[index].order;

  return stickers
    .filter((item, i) => i !== index)
    .map((item) => {
      // fix the order
      if (item.order > order) item.order -= 1;
      return item;
    });
}

export function patchSticker({ stickers, prop, value, index }) {
  if (!stickers || !stickers instanceof Array || stickers.length <= 0)
    throw Error("`stickers` array is empty");

  if (typeof index !== "number" || !stickers[index])
    throw Error("`index` needs to be a valid `stickers` array index");

  const PROPS = ["position", "scale", "rotation"];

  if (!PROPS.includes(prop))
    throw Error(`Invalid 'prop'. 'prop' must be one of: ${PROPS.join(",")}`);

  return stickers.map((item, i) => {
    if (i === index) item[prop] = value;
    return item;
  });
}
