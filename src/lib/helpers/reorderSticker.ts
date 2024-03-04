import type { OrderDirection, StickerItem } from "../types"

interface ReorderStickerOptions {
  id: string
  direction: OrderDirection
  extreme: boolean
  stickers: StickerItem[]
}

/**
 * Returns a reordered copy of the provided `stickers` array.
 * @param {ReorderStickerOptions[]}
 * @returns {StickerItem[]}
 */
export function reorderSticker({
  id,
  direction = "up",
  extreme = false,
  stickers,
}: ReorderStickerOptions): StickerItem[] {
  if (!stickers || stickers.length <= 0)
    throw Error("`stickers` array is empty")

  if (!direction || !["up", "down"].includes(direction))
    throw Error("`direction` needs to be either `up` or `down`")

  const sticker = stickers.find((item) => item.id === id)
  if (!sticker) throw Error("`id` needs to be a valid `sticker` id")

  // First, we can't change the array itself otherwise
  // it will cause a re-render and the item will loose focus.
  // So I made a prop to stickers called `order` and that represents
  // the order of the sticker on the DOM as a z-index CSS prop.
  const max = stickers.length - 1 // the max is the number of stickers on the array
  const min = 0 // can't go lower than 0 with z-index
  const { order: currentOrder } = sticker // get item to change and its current order

  // if we are going to the extreme, we max it up otherwise
  // we just make sure that we are not going over our max/min
  const newOrder =
    direction === "up"
      ? extreme
        ? max
        : Math.min(max, currentOrder + 1)
      : extreme
      ? min
      : Math.max(min, currentOrder - 1)

  // if the order didn't change, than we just return
  if (newOrder === currentOrder) return stickers

  return stickers.map((item) => {
    // if it's our item we update its order
    if (item.id === id) item.order = newOrder
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
        item.order -= 1
    } else if (
      (extreme && item.order <= currentOrder) ||
      (!extreme && item.order === newOrder)
    )
      item.order += 1

    return item
  })
}
