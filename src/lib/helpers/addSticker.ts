import type { StickerItem } from "../types"

type StickerOption = Omit<StickerItem, "id" | "order">

export function addSticker(
  stickers: StickerItem[] = [],
  sticker: StickerOption
) {
  if (!sticker) throw Error("No `sticker` provided")

  // we add a unique key based on the time because otherwise the
  // sticker will loose its state when re-rendering it, even though
  // we save the state globally, this is a good failsafe
  return stickers.concat([
    { ...sticker, order: stickers.length, id: `_${Date.now()}` },
  ])
}
