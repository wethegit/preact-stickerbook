import { Vec2 } from "wtc-math";

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
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = item;
  });
}

export async function drawFromCenter({
  ctx,
  img,
  width,
  height,
  x = 0,
  y = 0,
  offsetX = 0.5,
  offsetY = 0.5,
}) {
  const loadedImage = typeof img === "string" ? await loadUrlAsImage(img) : img;

  let imageWidth = loadedImage.width,
    imageHeight = loadedImage.height,
    ratio = Math.min(width / imageWidth, height / imageHeight),
    newWidth = imageWidth * ratio, // new prop. width
    newHeight = imageHeight * ratio, // new prop. height
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    scaledRatio = 1;

  // decide which gap to fill
  if (newWidth < width) scaledRatio = width / newWidth;
  if (Math.abs(scaledRatio - 1) < 1e-14 && newHeight < height)
    scaledRatio = height / newHeight; // updated

  newWidth *= scaledRatio;
  newHeight *= scaledRatio;

  // calc source rectangle
  sourceWidth = imageWidth / (newWidth / width);
  sourceHeight = imageHeight / (newHeight / height);

  sourceX = (imageWidth - sourceWidth) * offsetX;
  sourceY = (imageHeight - sourceHeight) * offsetY;

  // make sure source rectangle is valid
  if (sourceX < 0) sourceX = 0;
  if (sourceY < 0) sourceY = 0;
  if (sourceWidth > imageWidth) sourceWidth = imageWidth;
  if (sourceHeight > imageHeight) sourceHeight = imageHeight;

  // fill image in dest. rectangle
  ctx.drawImage(
    loadedImage,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
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
    await drawFromCenter({
      ctx: outputCtx,
      img: background.image,
      width: outputWidth,
      height: outputHeight,
    });

  // draw background
  if (frame && frame.image)
    await drawFromCenter({
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

    for (let i = 0; i < loadedStickers.length; i++) {
      const sticker = sortedStickers[i];
      const stickerImage = loadedStickers[i];

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
      let cvs = document.createElement("canvas");
      let scvs = document.createElement("canvas");
      let ctx = cvs.getContext("2d");

      // adapted to unit sizing
      let dimensions = new Vec2(
        stickerImage.naturalWidth,
        stickerImage.naturalHeight
      );
      let scale =
        (sticker.scale * outputWidth) /
        Math.min(dimensions.x, dimensions.y) /
        0.5;
      let scaledDimensions = dimensions.scaleNew(scale);

      cvs.width = scaledDimensions.width;
      cvs.height = scaledDimensions.height;

      ctx.drawImage(stickerImage, 0, 0, scaledDimensions.x, scaledDimensions.y);

      let sin = Math.sin(sticker.rotation);
      let cos = Math.cos(sticker.rotation);
      let rotatedSize = new Vec2(
        Math.abs(scaledDimensions.y * sin) + Math.abs(scaledDimensions.x * cos),
        Math.abs(scaledDimensions.y * cos) + Math.abs(scaledDimensions.x * sin)
      );
      let rotatedSizeHalf = rotatedSize.scaleNew(0.5);

      scvs.width = rotatedSize.x;
      scvs.height = rotatedSize.y;

      ctx = scvs.getContext("2d");

      ctx.translate(rotatedSizeHalf.x, rotatedSizeHalf.y);
      ctx.rotate(sticker.rotation);
      ctx.drawImage(cvs, -scaledDimensions.x * 0.5, -scaledDimensions.y * 0.5);

      let hw = new Vec2(scvs.width * 0.5, scvs.height * 0.5);

      // adapting position to unit sizing
      let pos = sticker.position.scaleNew(outputWidth);

      outputCtx.drawImage(scvs, pos.x - hw.x, pos.y - hw.y);
    }
  }

  // draw foreground
  if (foreground && foreground.image)
    await drawFromCenter({
      ctx: outputCtx,
      img: foreground.image,
      width: outputWidth,
      height: outputHeight,
    });

  // download
  if (format === "image" || format === "blob") {
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

  return outputCanvas;
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

  if (!PROPS.includes(format))
    throw Error(`Invalid 'prop'. 'prop' must be one of: ${PROPS.join(",")}`);

  if (stickers[index][prop] && stickers[index][prop] === value) return stickers;

  return stickers.map((item, i) => {
    if (i === index) item[prop] = value;
    return item;
  });
}
