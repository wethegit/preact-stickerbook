import type { StickerItem } from "../types"

interface StickerOptions {
  stickers: StickerItem[]
  sticker: Omit<StickerItem, "id" | "order">
}

/**
 * Returns a copy of the provided `stickers` array with the new sticker containing the required **id** and **order** fields.
 * @param {StickerOptions[]}
 * @returns {StickerItem[]}
 */
export function addSticker({
  stickers = [],
  sticker,
}: StickerOptions): StickerItem[] {
  if (!sticker) throw Error("No `sticker` provided")

  // we add a unique key based on the time because otherwise the
  // sticker will loose its state when re-rendering it, even though
  // we save the state globally, this is a good failsafe
  return stickers.concat([
    { ...sticker, order: stickers.length, id: `_${Date.now()}` },
  ])
}
