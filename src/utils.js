export const classnames = function (namesArray) {
  return namesArray
    .filter((v) => v != "")
    .join(" ")
    .trim();
};

export const logStickerbook = function ({ background, stickers }) {
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
};

export const reorderStickerList = function ({
  itemIndex,
  direction = "up",
  extreme = false,
  items = [],
}) {
  if (!items || items.length <= 0) throw Error("items list is empty");
  if (!direction || !["up", "down"].includes(direction))
    throw Error("direction needs to be either `up` or `down`");
  if (typeof itemsIndex !== "number" && itemIndex < 0)
    throw Error("itemIndex needs to be a valid array index");

  // First, we can't change the array itself otherwise
  // it will cause a re-render and the item will loose focus.
  // So I made a prop to stickers called `order` and that represents
  // the order of the sticker on the DOM as a z-index CSS prop.
  const max = items.length - 1; // the max is the number of items on the array
  const min = 0; // can't go lower than 0 with z-index
  const { order: currentOrder } = items.find((item, i) => i === index); // get item to change and its current order

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
  if (newOrder === currentOrder) return cur;

  return items.map((item, i) => {
    // if it's our item we update its order
    if (i === index) item.order = newOrder;
    else if (direction === "up") {
      // if we are going to the extreme edges, we gotta
      // move all items before/after the new order
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
};
