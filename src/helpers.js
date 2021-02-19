import { Vec2 } from "wtc-math";

export function classnames(namesArray) {
  return namesArray
    .filter((v) => v != "")
    .join(" ")
    .trim();
}

export function logStickerbook({ background, stickers }) {
  if (!background && !stickers) {
    console.log("No data provided");
    return;
  }

  const { image, alt, ...bg } = background;

  const string = JSON.stringify(
    {
      background: bg,
      stickers: stickers.map((sticker) => {
        const { image, key, position, alt, ...props } = sticker;

        return {
          ...props,
          position: {
            x: position?.x,
            y: position?.y,
          },
        };
      }),
    },
    null,
    2
  );

  console.log(
    "------------------------------------------\n",
    `${new Date().toLocaleString("en-CA")}\n`,
    "------------------------------------------\n",
    string,
    "\n------------------------------------------"
  );

  navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
    if (result.state == "granted" || result.state == "prompt") {
      navigator.clipboard.writeText(string).then(() => {
        console.log(`📋 Copied to clipboard`);
      });
    }
  });
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
  image,
  outputWidth,
  outputHeight,
}) {
  const loadedImage =
    typeof image === "string" ? await loadUrlAsImage(image) : image;
  const imageRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
  const outputRatio = outputWidth / outputHeight;
  let width = outputWidth;
  let height = outputHeight;

  if (imageRatio < outputRatio) height = width / imageRatio;
  else width = height * imageRatio;

  ctx.drawImage(
    loadedImage,
    (outputWidth - width) * 0.5,
    (outputWidth - height) * 0.5,
    width,
    height
  );
}

export async function generateDownload({
  stickers = [],
  background,
  foreground,
  outputWidth = 500,
  outputHeight = 500,
  type = "image",
}) {
  const TYPES = ["image", "canvas", "blob"];

  if (!stickers || stickers.length <= 0)
    throw Error("'stickers' list is empty");
  if (!outputWidth && !outputHeight)
    throw Error("'outputWidth' and 'outputHeight' needs to be bigger than 0");
  if (!TYPES.includes(type))
    throw Error(`Invalid 'type'. 'type' must be one of ${TYPES.join(",")}`);

  // output canvas
  const outputCanvas = document.createElement("canvas");
  const outputCtx = outputCanvas.getContext("2d");

  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;

  // draw background
  if (background && background.image) await drawFromCenter(background.image);

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
      const cvs = document.createElement("canvas");
      const scvs = document.createElement("canvas");
      const ctx = cvs.getContext("2d");

      // adapted to unit sizing
      const d = new Vec2(stickerImage.naturalWidth, stickerImage.naturalHeight);
      const scale = (sticker.scale * outputWidth) / Math.min(d.x, d.y) / 0.5;
      const sd = d.scaleNew(scale);

      cvs.width = sd.width;
      cvs.height = sd.height;

      ctx.drawImage(stickerImage, 0, 0, sd.x, sd.y);

      const s = Math.sin(sticker.rotation);
      const c = Math.cos(sticker.rotation);
      const rotatedSize = new Vec2(
        Math.abs(sd.y * s) + Math.abs(sd.x * c),
        Math.abs(sd.y * c) + Math.abs(sd.x * s)
      );
      const rotatedSizeHalf = rotatedSize.scaleNew(0.5);

      scvs.width = rotatedSize.x;
      scvs.height = rotatedSize.y;

      ctx = scvs.getContext("2d");

      ctx.translate(rotatedSizeHalf.x, rotatedSizeHalf.y);
      ctx.rotate(sticker.rotation);
      ctx.drawImage(cvs, -sd.x * 0.5, -sd.y * 0.5);

      const hw = new Vec2(scvs.width * 0.5, scvs.height * 0.5);

      // adapting position to unit sizing
      const pos = sticker.position.scaleNew(outputWidth);

      outputCtx.drawImage(scvs, pos.x - hw.x, pos.y - hw.y);
    }
  }

  // draw foreground
  if (foreground && foreground.image) await drawFromCenter(background.image);

  // download
  if (type === "image" || type === "blob") {
    const imageUrl = await new Promise((resolve, reject) => {
      try {
        outputCanvas.toBlob((blob) => {
          if (type === "blob") resolve(blob);
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

export function reorderStickerList({
  index,
  direction = "up",
  extreme = false,
  stickers = [],
}) {
  if (!stickers || stickers.length <= 0) throw Error("stickers list is empty");
  if (!direction || !["up", "down"].includes(direction))
    throw Error("direction needs to be either `up` or `down`");
  if (typeof index !== "number" && index < 0)
    throw Error("index needs to be a valid array index");

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
